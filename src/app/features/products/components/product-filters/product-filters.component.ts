import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ProductFilters, ProductStatus } from '../../../../core/models';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-product-filters',
  imports: [CustomSelectComponent],
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFiltersComponent {
  readonly categories = input.required<readonly string[]>();
  readonly filters = input.required<ProductFilters>();
  readonly filtersChange = output<Partial<ProductFilters>>();
  readonly resetFilters = output<void>();

  readonly categoryOptions = computed<readonly SelectOption[]>(() =>
    this.categories().map(
      (category: string): SelectOption => ({
        label: category,
        value: category,
      }),
    ),
  );

  readonly statusOptions: readonly SelectOption[] = [
    { label: 'Ativo', value: 'active' },
    { label: 'Inativo', value: 'inactive' },
  ];

  onCategoryChange(value: string | null): void {
    this.filtersChange.emit({ category: value });
  }

  onStatusChange(value: string | null): void {
    const status = value === null ? null : this.parseStatus(value);
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

  private parseStatus(rawValue: string): ProductStatus | null {
    if (rawValue === 'active' || rawValue === 'inactive') {
      return rawValue;
    }
    return null;
  }
}
