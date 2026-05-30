import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/products';

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateProductPayload): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateProductPayload): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
