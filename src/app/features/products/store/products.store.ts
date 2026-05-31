import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import {
  CreateProductPayload,
  INITIAL_PRODUCT_FILTERS,
  Product,
  ProductFilters,
  UpdateProductPayload,
} from '../../../core/models';
import { ProductApiService } from '../../../core/services';
import { applyProductFilters } from './product-filters.util';

interface ProductsState {
  items: Product[];
  loading: boolean;
  deletingId: string | null;
  error: string | null;
  notice: string | null;
  filters: ProductFilters;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  deletingId: null,
  error: null,
  notice: null,
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
          error: 'Não foi possível carregar os produtos.',
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
    async create(payload: CreateProductPayload): Promise<boolean> {
      patchState(store, { loading: true, error: null });

      try {
        const created = await firstValueFrom(api.create(payload));
        patchState(store, (state) => ({
          loading: false,
          notice: 'Produto cadastrado com sucesso.',
          items: [created, ...state.items],
        }));
        return true;
      } catch {
        patchState(store, {
          loading: false,
          error: 'Não foi possível cadastrar o produto.',
        });
        return false;
      }
    },
    async updateById(id: string, payload: UpdateProductPayload): Promise<boolean> {
      patchState(store, { loading: true, error: null });

      try {
        const updated = await firstValueFrom(api.update(id, payload));
        patchState(store, (state) => ({
          loading: false,
          notice: 'Produto atualizado com sucesso.',
          items: state.items.map((item) => (item.id === id ? updated : item)),
        }));
        return true;
      } catch {
        patchState(store, {
          loading: false,
          error: 'Não foi possível atualizar o produto.',
        });
        return false;
      }
    },
    async removeById(id: string): Promise<void> {
      patchState(store, { deletingId: id, error: null });

      try {
        await firstValueFrom(api.remove(id));
        patchState(store, (state) => ({
          deletingId: null,
          notice: 'Produto excluído com sucesso.',
          items: state.items.filter((item) => item.id !== id),
        }));
      } catch {
        patchState(store, {
          deletingId: null,
          error: 'Não foi possível excluir o produto.',
        });
      }
    },
    clearNotice(): void {
      patchState(store, { notice: null });
    },
    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
