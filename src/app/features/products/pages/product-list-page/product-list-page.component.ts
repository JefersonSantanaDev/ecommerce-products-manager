import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductFilters } from '../../../../core/models';
import { ProductFiltersComponent } from '../../components';
import { ProductsStore } from '../../store';

@Component({
  selector: 'app-product-list-page',
  imports: [RouterLink, ProductFiltersComponent],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPageComponent implements OnInit {
  readonly productsStore = inject(ProductsStore);

  ngOnInit(): void {
    this.productsStore.loadAll();
  }

  onFiltersChange(filters: Partial<ProductFilters>): void {
    this.productsStore.setFilters(filters);
  }

  onResetFilters(): void {
    this.productsStore.resetFilters();
  }

  async onDelete(id: string): Promise<void> {
    const confirmed = window.confirm('Deseja realmente excluir este produto?');
    if (!confirmed) {
      return;
    }

    await this.productsStore.removeById(id);
  }
}
