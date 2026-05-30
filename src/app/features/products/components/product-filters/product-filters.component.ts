import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ProductFilters, ProductStatus } from '../../../../core/models';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFiltersComponent {
  readonly categories = input.required<readonly string[]>();
  readonly filters = input.required<ProductFilters>();
  readonly filtersChange = output<Partial<ProductFilters>>();
  readonly resetFilters = output<void>();

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filtersChange.emit({ category: value || null });
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const status = value ? (value as ProductStatus) : null;
    this.filtersChange.emit({ status });
  }

  onMinPriceChange(event: Event): void {
    const value = this.parsePriceValue((event.target as HTMLInputElement).value);
    this.filtersChange.emit({ minPrice: value });
  }

  onMaxPriceChange(event: Event): void {
    const value = this.parsePriceValue((event.target as HTMLInputElement).value);
    this.filtersChange.emit({ maxPrice: value });
  }

  onReset(): void {
    this.resetFilters.emit();
  }

  private parsePriceValue(rawValue: string): number | null {
    if (!rawValue.trim()) {
      return null;
    }

    const value = Number(rawValue);
    return Number.isNaN(value) ? null : value;
  }
}
