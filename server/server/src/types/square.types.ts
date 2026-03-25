export type SquareEnvironment = 'sandbox' | 'production';

export interface ApiErrorPayload {
  success: false;
  error: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessPayload<T> {
  success: true;
  data: T;
}

export interface LocationDTO {
  id: string;
  name: string;
  address: string;
  timezone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CatalogVariationDTO {
  id: string;
  name: string;
  priceAmount: number;
  priceFormatted: string;
}

export interface CatalogItemDTO {
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
  } | null;
  imageUrl: string | null;
  variations: CatalogVariationDTO[];
}

export interface CatalogCategoryGroupDTO {
  categoryId: string;
  categoryName: string;
  items: CatalogItemDTO[];
}

export interface CatalogCategoryDTO {
  id: string;
  name: string;
  itemCount: number;
}

