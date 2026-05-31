import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  CreateProductPayload,
  ProductStatus,
  UpdateProductPayload,
} from '../../../../core/models';
import { ProductApiService } from '../../../../core/services';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import {
  CustomSelectComponent,
  SelectOption,
} from '../../../../shared/components/custom-select/custom-select.component';
import { ProductsStore } from '../../store';

@Component({
  selector: 'app-product-form-page',
  imports: [ReactiveFormsModule, RouterLink, CustomSelectComponent, BreadcrumbComponent],
  templateUrl: './product-form-page.component.html',
  styleUrl: './product-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPageComponent implements OnInit {
  private static readonly imageUrlPattern = /^(https?:\/\/.+|\/assets\/.+)$/i;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productApiService = inject(ProductApiService);
  private readonly productsStore = inject(ProductsStore);

  readonly isEditMode = signal(false);
  readonly isLoadingProduct = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);
  private productId: string | null = null;
  readonly statusOptions: readonly SelectOption[] = [
    { label: 'Ativo', value: 'active' },
    { label: 'Inativo', value: 'inactive' },
  ];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    imageUrl: [
      '',
      [
        Validators.required,
        Validators.pattern(ProductFormPageComponent.imageUrlPattern),
      ],
    ],
    category: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    status: ['active' as ProductStatus, Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Editar produto' : 'Cadastrar produto',
  );
  readonly pageDescription = computed(() =>
    this.isEditMode()
      ? 'Atualize os dados principais para manter o catalogo de produtos sempre consistente.'
      : 'Cadastre um novo produto com informacoes claras para facilitar a gestao da loja.',
  );
  readonly formIntroTitle = computed(() =>
    this.isEditMode() ? 'Atualizacao de cadastro' : 'Cadastro de novo produto',
  );
  readonly formIntroDescription = computed(() =>
    this.isEditMode()
      ? 'Revise os campos abaixo para manter o catalogo sempre atualizado e consistente.'
      : 'Preencha os dados principais para publicar um novo item no catalogo com seguranca.',
  );
  readonly breadcrumbItems = computed<readonly BreadcrumbItem[]>(() => {
    const currentStepLabel = this.isEditMode() ? 'Editar produto' : 'Novo produto';
    return [
      {
        label: 'Produtos',
        url: '/products',
      },
      {
        label: currentStepLabel,
        isCurrent: true,
      },
    ];
  });

  get controls(): typeof this.form.controls {
    return this.form.controls;
  }

  onStatusChange(value: string | null): void {
    const parsedStatus = this.parseStatus(value);
    if (parsedStatus === null) {
      return;
    }

    this.controls.status.setValue(parsedStatus);
    this.controls.status.markAsTouched();
    this.controls.status.markAsDirty();
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(this.productId !== null);

    if (!this.productId) {
      return;
    }

    void this.loadProduct(this.productId);
  }

  async onSubmit(): Promise<void> {
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    try {
      const formValue = this.form.getRawValue();

      if (this.isEditMode() && this.productId) {
        const payload: UpdateProductPayload = {
          id: this.productId,
          ...formValue,
        };
        const updated = await this.productsStore.updateById(this.productId, payload);
        if (!updated) {
          this.submitError.set('Nao foi possivel salvar o produto.');
          return;
        }
      } else {
        const payload: CreateProductPayload = {
          ...formValue,
          createdAt: new Date().toISOString(),
        };
        const created = await this.productsStore.create(payload);
        if (!created) {
          this.submitError.set('Nao foi possivel salvar o produto.');
          return;
        }
      }

      await this.router.navigateByUrl('/products');
    } catch {
      this.submitError.set('Nao foi possivel salvar o produto.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async onCancel(): Promise<void> {
    await this.router.navigateByUrl('/products');
  }

  private async loadProduct(id: string): Promise<void> {
    this.isLoadingProduct.set(true);
    this.submitError.set(null);

    try {
      const product = await firstValueFrom(this.productApiService.getById(id));
      this.form.setValue({
        name: product.name,
        imageUrl: product.imageUrl,
        category: product.category,
        price: product.price,
        status: product.status,
        description: product.description,
        stock: product.stock,
      });
    } catch {
      this.submitError.set('Nao foi possivel carregar os dados do produto.');
    } finally {
      this.isLoadingProduct.set(false);
    }
  }

  private parseStatus(value: string | null): ProductStatus | null {
    if (value === 'active' || value === 'inactive') {
      return value;
    }

    return null;
  }
}
