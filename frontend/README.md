# Frontend (Next.js) – Per Diem Menu Browser

Mobile‑first menu browser that consumes the backend Square proxy. Supports location selection, category navigation, horizontal carousels, search, loading states, dark/light theme (persisted), and accessible UI.

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- Simple scroll-snap carousels with IntersectionObserver animations

## How it works
- Loads locations from the backend proxy (`GET /api/locations`)
- Persists selected location in `localStorage` (`selected_location_id`)
- Fetches categories and items by location:
  - `GET /api/catalog/categories?location_id=...`
  - `GET /api/catalog?location_id=...`
- Groups items by category and renders each category as a one‑row horizontal carousel
- Search filters client-side on item name/description
- Dark/light theme toggle is saved to `localStorage` (`selected_theme`)

## Environment
Create `.env.local` (values below are typical for local Docker setup):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

If you’re running the backend on a different host/port, update `NEXT_PUBLIC_API_BASE_URL` accordingly.

## Run (Dev)

```
pnpm install   # or npm install
pnpm dev       # or npm run dev
```

Dev server runs at:

```
http://localhost:4000
```

Make sure the backend is running on:

```
http://localhost:3000
```

## Build & Start (Prod)

```
pnpm build
pnpm start
```

## Key UX Features
- Loading spinners:
  - Initial page load
  - Subsequent reloads (on location change)
- Horizontal carousels per category:
  - One row per category, scrollable, with snap alignment
  - Cards animate-in on scroll (fade/slide) using `IntersectionObserver`
- Category navigation:
  - Sticky header with dynamic offset scroll to target category
- Dark mode:
  - Toggle in header, persisted via `localStorage` and uses system default when unset
- Accessibility:
  - Keyboard and screen‑reader friendly structure and labels

## File Tour
- `app/page.tsx`: Main UI and data flow (locations, categories, items, carousels, theme persistence, search)
- `app/layout.tsx`: Root layout, metadata
- `app/globals.css` + `styles/globals.css`: Tailwind theme tokens, global styles
- `public/`: Icons and placeholders

## Architecture Decisions and Trade-offs
- **Single-page App Router approach**: Kept everything in `app/page.tsx` for fast iteration and simpler challenge delivery.  
  **Trade-off**: As features grow, this file can become large; next step would be splitting into feature hooks/components.
- **Backend-proxy-only data access**: Frontend never calls Square directly, only the backend `/api/*` endpoints.  
  **Trade-off**: Adds one network hop, but keeps tokens secure and centralizes API mapping/caching.
- **Client-side search filtering**: Search is applied to already-fetched menu data for instant UX.  
  **Trade-off**: For very large catalogs, client memory/render cost increases; server-side search could scale better.
- **Horizontal scroll-snap carousels instead of heavy carousel library**: Lightweight native scroll behavior with CSS snap and simple controls.  
  **Trade-off**: Fewer advanced features (looping/virtualization) than a full carousel library.
- **IntersectionObserver reveal animations**: Chosen for performance and minimal dependency overhead.  
  **Trade-off**: Animations rely on viewport observation and may vary slightly across browsers/devices.
- **Theme persistence via localStorage**: Dark/light preference survives refresh and sessions.  
  **Trade-off**: Theme state is client-only; SSR-specific theming and cookie-based sync are not implemented.

## Assumptions and Limitations
- Assumes backend is reachable via `NEXT_PUBLIC_API_BASE_URL` and CORS allows frontend origin.
- Assumes Square catalog mapping is normalized by backend; frontend expects grouped category payloads.
- Assumes one primary category per item for grouping in UI (backend currently uses the first available category link).
- No server-side rendering of menu data; content loads client-side after hydration.
- No pagination UI on frontend because backend already aggregates paginated Square results.
- No authenticated user flows (ACL/authz) as challenge scope did not require it.
- No image optimization pipeline beyond standard browser loading (placeholder used when image is missing).
- E2E browser tests for frontend interactions are not included; behavior is validated through implemented states and backend tests.

## Troubleshooting
- If you see CORS errors, ensure backend allows the frontend origin (`http://localhost:4000`) via `CORS_ORIGIN` and that API requests go to the backend base (`NEXT_PUBLIC_API_BASE_URL`).
- If categories are “Uncategorized”, ensure Square items have category linkage; backend supports both `item_data.category_id` and `item_data.categories[0].id`.

