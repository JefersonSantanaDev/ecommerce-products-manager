import { Product, ProductFilters } from '../../../core/models';

export function applyProductFilters(
  items: Product[],
  filters: ProductFilters,
): Product[] {
  return items.filter((item) => {
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesMinPrice = filters.minPrice === null || item.price >= filters.minPrice;
    const matchesMaxPrice = filters.maxPrice === null || item.price <= filters.maxPrice;

    return matchesCategory && matchesStatus && matchesMinPrice && matchesMaxPrice;
  });
}
