import crypto from 'crypto';
import { lruCache } from '../utils/lru-cache.util';
import { SQUARE_CONFIG } from '../config/square.config';
import {
  CatalogCategoryDTO,
  CatalogCategoryGroupDTO,
  CatalogItemDTO,
  CatalogVariationDTO,
  LocationDTO,
} from '../types/square.types';

interface SquareListLocationsResponse {
  locations?: Array<{
    id: string;
    name?: string;
    timezone?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    address?: {
      address_line_1?: string;
      locality?: string;
      administrative_district_level_1?: string;
      postal_code?: string;
    };
  }>;
  errors?: Array<{ detail?: string; category?: string; code?: string }>;
}

interface SquareCatalogObject {
  id: string;
  type: string;
  present_at_all_locations?: boolean;
  present_at_location_ids?: string[];
  item_data?: {
    name?: string;
    description?: string;
    category_id?: string;
    categories?: Array<{
      id: string;
      ordinal?: number;
    }>;
    image_ids?: string[];
    variations?: Array<{
      id: string;
      item_variation_data?: {
        name?: string;
        price_money?: {
          amount?: number;
          currency?: string;
        };
      };
    }>;
  };
  category_data?: {
    name?: string;
  };
  image_data?: {
    url?: string;
  };
}

interface SquareCatalogSearchResponse {
  objects?: SquareCatalogObject[];
  related_objects?: SquareCatalogObject[];
  cursor?: string;
  errors?: Array<{ detail?: string; category?: string; code?: string }>;
}

const CACHE_PREFIX = {
  locations: 'square:locations',
  catalog: (locationId: string) => `square:catalog:${locationId}`,
  categories: (locationId: string) => `square:categories:${locationId}`,
};

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const isPresentAtLocation = (obj: SquareCatalogObject, locationId: string): boolean =>
  Boolean(
    obj.present_at_all_locations ||
      (obj.present_at_location_ids && obj.present_at_location_ids.includes(locationId))
  );

const mapSquareError = (status: number, data: unknown): Error => {
  const payload = data as { errors?: Array<{ detail?: string }>; message?: string };
  const detail = payload?.errors?.[0]?.detail || payload?.message || 'Unknown Square API error';
  return new Error(`Square API (${status}): ${detail}`);
};

const squareFetch = async <T>(path: string, method: 'GET' | 'POST', body?: unknown): Promise<T> => {
  if (!SQUARE_CONFIG.ACCESS_TOKEN) {
    throw new Error('Missing SQUARE_ACCESS_TOKEN in environment');
  }

  const response = await fetch(`${SQUARE_CONFIG.BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${SQUARE_CONFIG.ACCESS_TOKEN}`,
      'Square-Version': '2026-01-22',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json()) as T;
  if (!response.ok) {
    throw mapSquareError(response.status, data);
  }

  return data;
};

const mergeCatalogPages = (pages: SquareCatalogSearchResponse[]): SquareCatalogSearchResponse => ({
  objects: pages.flatMap((p) => p.objects || []),
  related_objects: pages.flatMap((p) => p.related_objects || []),
});

const fetchAllCatalogItems = async (locationId: string): Promise<SquareCatalogSearchResponse> => {
  const pages: SquareCatalogSearchResponse[] = [];
  let cursor: string | undefined;

  do {
    const payload: Record<string, unknown> = {
      object_types: ['ITEM'],
      include_related_objects: true,
      limit: 100,
    };
    if (cursor) {
      payload.cursor = cursor;
    }

    const page = await squareFetch<SquareCatalogSearchResponse>('/catalog/search', 'POST', payload);
    pages.push(page);
    cursor = page.cursor;
  } while (cursor);

  return mergeCatalogPages(pages);
};

const buildCatalogGroups = (locationId: string, catalog: SquareCatalogSearchResponse): CatalogCategoryGroupDTO[] => {
  const related = [...(catalog.related_objects || []), ...(catalog.objects || [])];
  const categoriesById = new Map(
    related.filter((o) => o.type === 'CATEGORY').map((o) => [o.id, o.category_data?.name || 'Uncategorized'])
  );
  const imagesById = new Map(
    related.filter((o) => o.type === 'IMAGE').map((o) => [o.id, o.image_data?.url || null])
  );

  const groups = new Map<string, CatalogCategoryGroupDTO>();
  const items = (catalog.objects || []).filter((o) => o.type === 'ITEM' && isPresentAtLocation(o, locationId));

  for (const item of items) {
    const categoryId =
      item.item_data?.category_id || item.item_data?.categories?.[0]?.id || 'uncategorized';
    const categoryName = categoriesById.get(categoryId) || 'Uncategorized';
    const imageId = item.item_data?.image_ids?.[0];
    const variations: CatalogVariationDTO[] = (item.item_data?.variations || []).map((v) => {
      const amount = v.item_variation_data?.price_money?.amount || 0;
      return {
        id: v.id,
        name: v.item_variation_data?.name || 'Default',
        priceAmount: amount,
        priceFormatted: currencyFormatter.format(amount / 100),
      };
    });

    const mappedItem: CatalogItemDTO = {
      id: item.id,
      name: item.item_data?.name || 'Untitled Item',
      description: item.item_data?.description || '',
      category: categoryId === 'uncategorized' ? null : { id: categoryId, name: categoryName },
      imageUrl: imageId ? imagesById.get(imageId) || null : null,
      variations,
    };

    if (!groups.has(categoryId)) {
      groups.set(categoryId, { categoryId, categoryName, items: [] });
    }
    groups.get(categoryId)?.items.push(mappedItem);
  }

  return Array.from(groups.values()).sort((a, b) => a.categoryName.localeCompare(b.categoryName));
};

export const squareService = {
  async listActiveLocations(): Promise<LocationDTO[]> {
    const cached = lruCache.get(CACHE_PREFIX.locations) as LocationDTO[] | null;
    if (cached) {
      return cached;
    }

    const data = await squareFetch<SquareListLocationsResponse>('/locations', 'GET');
    const locations: LocationDTO[] = (data.locations || [])
      .filter((loc) => loc.status === 'ACTIVE')
      .map((loc) => ({
        id: loc.id,
        name: loc.name || 'Unknown Location',
        timezone: loc.timezone || 'UTC',
        status: (loc.status || 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
        address: [
          loc.address?.address_line_1,
          loc.address?.locality,
          loc.address?.administrative_district_level_1,
          loc.address?.postal_code,
        ]
          .filter(Boolean)
          .join(', '),
      }));

    lruCache.set(CACHE_PREFIX.locations, locations);
    return locations;
  },

  async listCatalogByCategory(locationId: string): Promise<CatalogCategoryGroupDTO[]> {
    const cacheKey = CACHE_PREFIX.catalog(locationId);
    const cached = lruCache.get(cacheKey) as CatalogCategoryGroupDTO[] | null;
    if (cached) {
      return cached;
    }

    const fullCatalog = await fetchAllCatalogItems(locationId);
    const grouped = buildCatalogGroups(locationId, fullCatalog);
    lruCache.set(cacheKey, grouped);
    return grouped;
  },

  async listCatalogCategories(locationId: string): Promise<CatalogCategoryDTO[]> {
    const cacheKey = CACHE_PREFIX.categories(locationId);
    const cached = lruCache.get(cacheKey) as CatalogCategoryDTO[] | null;
    if (cached) {
      return cached;
    }

    const grouped = await this.listCatalogByCategory(locationId);
    const categories = grouped.map((group) => ({
      id: group.categoryId,
      name: group.categoryName,
      itemCount: group.items.length,
    }));
    lruCache.set(cacheKey, categories);
    return categories;
  },

  clearMenuCaches(): void {
    lruCache.clear();
  },

  verifyWebhookSignature(rawBody: string, signature: string, url: string): boolean {
    if (!SQUARE_CONFIG.WEBHOOK_SIGNATURE_KEY) {
      return false;
    }
    const payload = `${url}${rawBody}`;
    const digest = crypto
      .createHmac('sha256', SQUARE_CONFIG.WEBHOOK_SIGNATURE_KEY)
      .update(payload)
      .digest('base64');
    return digest === signature;
  },
};

