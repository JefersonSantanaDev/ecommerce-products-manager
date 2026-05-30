import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  CreateProductPayload,
  ProductStatus,
  UpdateProductPayload,
} from '../../../../core/models';
import { ProductApiService } from '../../../../core/services';

@Component({
  selector: 'app-product-form-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form-page.component.html',
  styleUrl: './product-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productApiService = inject(ProductApiService);

  isEditMode = false;
  isLoadingProduct = false;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;
  private productId: string | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    status: ['active' as ProductStatus, Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  get pageTitle(): string {
    return this.isEditMode ? 'Editar produto' : 'Cadastrar produto';
  }

  get controls() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = this.productId !== null;

    if (!this.productId) {
      return;
    }

    void this.loadProduct(this.productId);
  }

  async onSubmit(): Promise<void> {
    this.submitError = null;
    this.submitSuccess = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      const formValue = this.form.getRawValue();

      if (this.isEditMode && this.productId) {
        const payload: UpdateProductPayload = {
          id: this.productId,
          ...formValue,
        };
        await firstValueFrom(this.productApiService.update(this.productId, payload));
        this.submitSuccess = 'Produto atualizado com sucesso.';
      } else {
        const payload: CreateProductPayload = {
          ...formValue,
          createdAt: new Date().toISOString(),
        };
        await firstValueFrom(this.productApiService.create(payload));
        this.submitSuccess = 'Produto cadastrado com sucesso.';
        this.form.reset({
          name: '',
          category: '',
          price: 0,
          status: 'active',
          description: '',
          stock: 0,
        });
      }
    } catch {
      this.submitError = 'Nao foi possivel salvar o produto.';
    } finally {
      this.isSubmitting = false;
    }
  }

  async onCancel(): Promise<void> {
    await this.router.navigateByUrl('/products');
  }

  private async loadProduct(id: string): Promise<void> {
    this.isLoadingProduct = true;
    this.submitError = null;

    try {
      const product = await firstValueFrom(this.productApiService.getById(id));
      this.form.setValue({
        name: product.name,
        category: product.category,
        price: product.price,
        status: product.status,
        description: product.description,
        stock: product.stock,
      });
    } catch {
      this.submitError = 'Nao foi possivel carregar os dados do produto.';
    } finally {
      this.isLoadingProduct = false;
    }
  }
}
