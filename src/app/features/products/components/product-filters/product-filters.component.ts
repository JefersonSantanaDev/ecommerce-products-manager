import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';

import { ProductFilters, ProductStatus } from '../../../../core/models';
import { formatCurrencyToBrl, formatNumberToBrl, parsePriceInput, sanitizePriceInput } from '../../../../core/utils/currency.util';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';

interface QuickPriceRange {
  readonly label: string;
  readonly minPrice: number | null;
  readonly maxPrice: number | null;
}

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
  readonly minPriceDisplay = signal<string>('');
  readonly maxPriceDisplay = signal<string>('');
  readonly minPriceFocused = signal<boolean>(false);
  readonly maxPriceFocused = signal<boolean>(false);
  readonly minPriceParsed = computed<number | null>(() => parsePriceInput(this.minPriceDisplay()));
  readonly maxPriceParsed = computed<number | null>(() => parsePriceInput(this.maxPriceDisplay()));
  readonly hasPriceRangeError = computed<boolean>(() => {
    const minPrice = this.minPriceParsed();
    const maxPrice = this.maxPriceParsed();

    if (minPrice === null || maxPrice === null) {
      return false;
    }

    return minPrice > maxPrice;
  });
  readonly appliedPriceRangeLabel = computed<string | null>(() => this.buildAppliedPriceRangeLabel(this.filters()));
  readonly quickPriceRanges: readonly QuickPriceRange[] = [
    {
      label: 'Até R$ 200',
      minPrice: null,
      maxPrice: 200,
    },
    {
      label: 'R$ 200 até R$ 500',
      minPrice: 200,
      maxPrice: 500,
    },
    {
      label: 'R$ 500 até R$ 1.000',
      minPrice: 500,
      maxPrice: 1000,
    },
    {
      label: 'Acima de R$ 1.000',
      minPrice: 1000,
      maxPrice: null,
    },
  ];
  readonly activeQuickRangeLabel = computed<string | null>(() => {
    const currentFilters = this.filters();
    const activeRange = this.quickPriceRanges.find(
      (range) => range.minPrice === currentFilters.minPrice && range.maxPrice === currentFilters.maxPrice,
    );

    return activeRange?.label ?? null;
  });

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

  constructor() {
    effect((): void => {
      if (!this.minPriceFocused()) {
        this.minPriceDisplay.set(formatNumberToBrl(this.filters().minPrice));
      }

      if (!this.maxPriceFocused()) {
        this.maxPriceDisplay.set(formatNumberToBrl(this.filters().maxPrice));
      }
    });
  }

  onCategoryChange(value: string | null): void {
    this.filtersChange.emit({ category: value });
  }

  onStatusChange(value: string | null): void {
    const status = value === null ? null : this.parseStatus(value);
    this.filtersChange.emit({ status });
  }

  onMinPriceInput(event: Event): void {
    const targetInput = this.getInputTarget(event);
    if (targetInput === null) {
      return;
    }

    const sanitizedValue = sanitizePriceInput(targetInput.value);
    this.minPriceDisplay.set(sanitizedValue);
    this.emitPriceFiltersIfValid(parsePriceInput(sanitizedValue), this.maxPriceParsed());
  }

  onMaxPriceInput(event: Event): void {
    const targetInput = this.getInputTarget(event);
    if (targetInput === null) {
      return;
    }

    const sanitizedValue = sanitizePriceInput(targetInput.value);
    this.maxPriceDisplay.set(sanitizedValue);
    this.emitPriceFiltersIfValid(this.minPriceParsed(), parsePriceInput(sanitizedValue));
  }

  onMinPriceBlur(): void {
    this.minPriceFocused.set(false);
    if (this.hasPriceRangeError()) {
      this.minPriceDisplay.set(formatNumberToBrl(this.filters().minPrice));
      return;
    }

    const parsedValue = parsePriceInput(this.minPriceDisplay());
    this.minPriceDisplay.set(formatNumberToBrl(parsedValue));
  }

  onMaxPriceBlur(): void {
    this.maxPriceFocused.set(false);
    if (this.hasPriceRangeError()) {
      this.maxPriceDisplay.set(formatNumberToBrl(this.filters().maxPrice));
      return;
    }

    const parsedValue = parsePriceInput(this.maxPriceDisplay());
    this.maxPriceDisplay.set(formatNumberToBrl(parsedValue));
  }

  onMinPriceFocus(): void {
    this.minPriceFocused.set(true);
  }

  onMaxPriceFocus(): void {
    this.maxPriceFocused.set(true);
  }

  onReset(): void {
    this.resetFilters.emit();
  }

  onApplyQuickPriceRange(range: QuickPriceRange): void {
    this.minPriceFocused.set(false);
    this.maxPriceFocused.set(false);
    this.minPriceDisplay.set(formatNumberToBrl(range.minPrice));
    this.maxPriceDisplay.set(formatNumberToBrl(range.maxPrice));
    this.filtersChange.emit({
      minPrice: range.minPrice,
      maxPrice: range.maxPrice,
    });
  }

  private parseStatus(rawValue: string): ProductStatus | null {
    if (rawValue === 'active' || rawValue === 'inactive') {
      return rawValue;
    }
    return null;
  }

  private getInputTarget(event: Event): HTMLInputElement | null {
    const target = event.target;
    return target instanceof HTMLInputElement ? target : null;
  }

  private emitPriceFiltersIfValid(minPrice: number | null, maxPrice: number | null): void {
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      return;
    }

    this.filtersChange.emit({ minPrice, maxPrice });
  }

  private buildAppliedPriceRangeLabel(filters: ProductFilters): string | null {
    const minPrice = filters.minPrice;
    const maxPrice = filters.maxPrice;
    const hasMinPrice = minPrice !== null;
    const hasMaxPrice = maxPrice !== null;

    if (!hasMinPrice && !hasMaxPrice) {
      return null;
    }

    if (hasMinPrice && hasMaxPrice) {
      return `Faixa ativa: ${formatCurrencyToBrl(minPrice)} até ${formatCurrencyToBrl(maxPrice)}`;
    }

    if (hasMinPrice) {
      return `Faixa ativa: a partir de ${formatCurrencyToBrl(minPrice)}`;
    }

    if (maxPrice === null) {
      return null;
    }

    return `Faixa ativa: até ${formatCurrencyToBrl(maxPrice)}`;
  }
}
