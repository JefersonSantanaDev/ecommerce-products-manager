import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductsStore } from '../../store';

@Component({
  selector: 'app-product-list-page',
  imports: [RouterLink],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPageComponent implements OnInit {
  readonly productsStore = inject(ProductsStore);

  ngOnInit(): void {
    this.productsStore.loadAll();
  }
}
