"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Location = { id: string; name: string; address: string; timezone: string; status: "ACTIVE" | "INACTIVE" };
type Variation = { id: string; name: string; priceAmount: number; priceFormatted: string };
type Item = {
  id: string;
  name: string;
  description: string;
  category: { id: string; name: string } | null;
  imageUrl: string | null;
  variations: Variation[];
};
type Group = { categoryId: string; categoryName: string; items: Item[] };
type Category = { id: string; name: string; itemCount: number };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const LS_KEY = "selected_location_id";
const THEME_KEY = "selected_theme";

const truncate = (text: string, max = 120) => (text.length > max ? `${text.slice(0, max)}...` : text);

function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10" role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      setIsDark(savedTheme === "dark");
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/locations`);
        const payload = (await response.json()) as { data: Location[]; message?: string };
        if (!response.ok) throw new Error(payload.message || "Failed to fetch locations");
        setLocations(payload.data || []);
        const fallback = payload.data?.[0]?.id || "";
        setSelectedLocation(stored && payload.data.some((l) => l.id === stored) ? stored : fallback);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load locations");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const loadMenu = async (locationId: string) => {
    if (!locationId) return;
    try {
      setLoading(true);
      const [catRes, catalogRes] = await Promise.all([
        fetch(`${API_BASE}/api/catalog/categories?location_id=${locationId}`),
        fetch(`${API_BASE}/api/catalog?location_id=${locationId}`),
      ]);
      const catPayload = (await catRes.json()) as { data: Category[]; message?: string };
      const catalogPayload = (await catalogRes.json()) as { data: Group[]; message?: string };
      if (!catRes.ok || !catalogRes.ok) throw new Error(catPayload.message || catalogPayload.message || "Failed to fetch menu");
      setCategories(catPayload.data || []);
      setGroups(catalogPayload.data || []);
      setActiveCategory(catPayload.data?.[0]?.id || "");
      localStorage.setItem(LS_KEY, locationId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMenu(selectedLocation);
  }, [selectedLocation]);

  const visibleGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, search]);

  if (loading && locations.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <LoadingSpinner label="Loading menu data..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header ref={headerRef} className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg sm:text-2xl">Per Diem Menu</h1>
            <button aria-label="Toggle dark mode" className="rounded border px-3 py-1 text-sm" onClick={() => setIsDark((v) => !v)}>
              {isDark ? "Light" : "Dark"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select aria-label="Select location" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="rounded border bg-background p-2">
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <input
              aria-label="Search menu items"
              className="rounded border bg-background p-2 sm:col-span-2"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Menu categories">
            {categories.map((c) => (
              <button
                key={c.id}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm ${activeCategory === c.id ? "bg-foreground text-background" : ""}`}
                onClick={() => {
                  setActiveCategory(c.id);
                  const el = document.getElementById(`cat-${c.id}`);
                  if (el) {
                    const headerHeight = headerRef.current?.offsetHeight || 0;
                    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
              >
                {c.name} ({c.itemCount})
              </button>
            ))}
          </nav>
        </div>
      </header>

      {error ? (
        <section className="mx-auto max-w-6xl p-4">
          <p className="mb-3 text-red-500" role="alert">{error}</p>
          <button className="rounded border px-3 py-2" onClick={() => void loadMenu(selectedLocation)}>Retry</button>
        </section>
      ) : null}

      {!loading && visibleGroups.length === 0 ? (
        <section className="mx-auto max-w-6xl p-4">No items found for this location.</section>
      ) : null}

      <section className="mx-auto max-w-6xl p-3 sm:p-4">
        {loading ? <LoadingSpinner label="Refreshing menu..." /> : null}
        {visibleGroups.map((group) => (
          <article
            id={`cat-${group.categoryId}`}
            key={group.categoryId}
            className="mb-6 scroll-mt-24 sm:scroll-mt-28"
          >
            <h2 className="mb-3 text-lg sm:text-xl">{group.categoryName}</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {group.items.map((item) => {
                const open = expanded[item.id];
                const hasLongText = item.description.length > 120;
                return (
                  <div
                    key={item.id}
                    className="w-[85%] shrink-0 snap-start rounded-lg border border-border p-3 transition hover:shadow-md sm:w-[320px]"
                  >
                    <img
                      src={item.imageUrl || "/placeholder.jpg"}
                      alt={item.name}
                      className="mb-3 h-40 w-full rounded object-cover"
                    />
                    <h3 className="mb-1 text-base">{item.name}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {open ? item.description : truncate(item.description)}
                      {hasLongText ? (
                        <button
                          className="ml-2 underline"
                          onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                        >
                          {open ? "Read less" : "Read more"}
                        </button>
                      ) : null}
                    </p>
                    <p className="text-sm">{item.variations[0]?.priceFormatted || "$0.00"}</p>
                    {item.variations.length > 1 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.variations.map((v) => `${v.name} ${v.priceFormatted}`).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
