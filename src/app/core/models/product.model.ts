export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  price: number;
  status: ProductStatus;
  description: string;
  stock: number;
  createdAt: string;
}

export type CreateProductPayload = Omit<Product, 'id'>;

export type UpdateProductPayload = Omit<Product, 'createdAt'>;

export interface ProductFilters {
  category: string | null;
  status: ProductStatus | null;
  minPrice: number | null;
  maxPrice: number | null;
}

export const INITIAL_PRODUCT_FILTERS: ProductFilters = {
  category: null,
  status: null,
  minPrice: null,
  maxPrice: null,
};
