import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductFilters } from '../../../../core/models';
import { formatCurrencyToBrl } from '../../../../core/utils/currency.util';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProductFiltersComponent } from '../../components';
import { ProductsStore } from '../../store';

@Component({
  selector: 'app-product-list-page',
  imports: [RouterLink, ProductFiltersComponent, ConfirmDialogComponent],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPageComponent implements OnInit {
  readonly productsStore = inject(ProductsStore);
  readonly fallbackImageSrc = '/assets/products/monitor.jpg';
  readonly deleteTargetId = signal<string | null>(null);
  readonly deleteTargetName = signal<string | null>(null);

  ngOnInit(): void {
    this.productsStore.loadAll();
  }

  onFiltersChange(filters: Partial<ProductFilters>): void {
    this.productsStore.setFilters(filters);
  }

  onResetFilters(): void {
    this.productsStore.resetFilters();
  }

  onDeleteRequest(id: string, name: string): void {
    this.deleteTargetId.set(id);
    this.deleteTargetName.set(name);
  }

  onDeleteCancel(): void {
    this.deleteTargetId.set(null);
    this.deleteTargetName.set(null);
  }

  async onDeleteConfirm(): Promise<void> {
    const id = this.deleteTargetId();
    if (!id) {
      return;
    }

    await this.productsStore.removeById(id);
    this.onDeleteCancel();
  }

  onClearNotice(): void {
    this.productsStore.clearNotice();
  }

  onProductImageError(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) {
      return;
    }

    if (target.dataset['fallbackApplied'] === 'true') {
      return;
    }

    target.dataset['fallbackApplied'] = 'true';
    target.src = this.fallbackImageSrc;
  }

  formatPrice(value: number | null | undefined): string {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return '-';
    }

    return formatCurrencyToBrl(value);
  }

  hasActiveFilters(): boolean {
    const currentFilters = this.productsStore.filters();
    return (
      currentFilters.category !== null ||
      currentFilters.status !== null ||
      currentFilters.minPrice !== null ||
      currentFilters.maxPrice !== null
    );
  }
}
