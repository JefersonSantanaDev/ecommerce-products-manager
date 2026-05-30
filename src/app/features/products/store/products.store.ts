import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import {
  INITIAL_PRODUCT_FILTERS,
  Product,
  ProductFilters,
} from '../../../core/models';
import { ProductApiService } from '../../../core/services';
import { applyProductFilters } from './product-filters.util';

interface ProductsState {
  items: Product[];
  loading: boolean;
  deletingId: string | null;
  error: string | null;
  filters: ProductFilters;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  deletingId: null,
  error: null,
  filters: INITIAL_PRODUCT_FILTERS,
};

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items, filters }) => ({
    filteredItems: computed(() => applyProductFilters(items(), filters())),
    categories: computed(() => {
      const uniqueCategories = new Set(items().map((item) => item.category));
      return Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b));
    }),
  })),
  withMethods((store, api = inject(ProductApiService)) => ({
    async loadAll(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const items = await firstValueFrom(api.list());
        patchState(store, { items, loading: false });
      } catch {
        patchState(store, {
          loading: false,
          error: 'Nao foi possivel carregar os produtos.',
        });
      }
    },
    setFilters(filters: Partial<ProductFilters>): void {
      patchState(store, (state) => ({
        filters: {
          ...state.filters,
          ...filters,
        },
      }));
    },
    resetFilters(): void {
      patchState(store, { filters: INITIAL_PRODUCT_FILTERS });
    },
    async removeById(id: string): Promise<void> {
      patchState(store, { deletingId: id, error: null });

      try {
        await firstValueFrom(api.remove(id));
        patchState(store, (state) => ({
          deletingId: null,
          items: state.items.filter((item) => item.id !== id),
        }));
      } catch {
        patchState(store, {
          deletingId: null,
          error: 'Nao foi possivel excluir o produto.',
        });
      }
    },
  })),
);
