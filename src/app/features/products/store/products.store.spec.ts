import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '../../../core/models';
import { ProductApiService } from '../../../core/services';
import { ProductsStore } from './products.store';

const baseProducts: Product[] = [
  {
    id: 'p1',
    name: 'Teclado Mecanico',
    imageUrl: 'https://picsum.photos/seed/spec-teclado/800/600',
    category: 'Perifericos',
    price: 399.9,
    status: 'active',
    description: 'Switch brown',
    stock: 8,
    createdAt: '2026-05-30T12:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'Monitor 27',
    imageUrl: 'https://picsum.photos/seed/spec-monitor/800/600',
    category: 'Monitores',
    price: 1299,
    status: 'inactive',
    description: 'Painel IPS',
    stock: 5,
    createdAt: '2026-05-30T12:01:00.000Z',
  },
];

describe('ProductsStore', () => {
  let store: InstanceType<typeof ProductsStore>;
  let apiMock: {
    list: jest.Mock;
    getById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    apiMock = {
      list: jest.fn().mockReturnValue(of(baseProducts)),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ProductApiService, useValue: apiMock }],
    });

    store = TestBed.inject(ProductsStore);
  });

  it('carrega produtos com loadAll', async () => {
    await store.loadAll();

    expect(apiMock.list).toHaveBeenCalledTimes(1);
    expect(store.items()).toHaveLength(2);
    expect(store.loading()).toBe(false);
  });

  it('adiciona produto com create', async () => {
    const payload: CreateProductPayload = {
      name: 'Mouse',
      imageUrl: 'https://picsum.photos/seed/spec-mouse/800/600',
      category: 'Perifericos',
      price: 199.9,
      status: 'active',
      description: 'RGB',
      stock: 10,
      createdAt: '2026-05-30T12:02:00.000Z',
    };

    const createdProduct: Product = { id: 'p3', ...payload };
    apiMock.create.mockReturnValue(of(createdProduct));

    const created = await store.create(payload);

    expect(created).toBe(true);
    expect(store.items()[0].id).toBe('p3');
    expect(store.notice()).toBe('Produto cadastrado com sucesso.');
  });

  it('atualiza produto com updateById', async () => {
    await store.loadAll();

    const payload: UpdateProductPayload = {
      id: 'p1',
      name: 'Teclado Mecanico Pro',
      imageUrl: 'https://picsum.photos/seed/spec-teclado-pro/800/600',
      category: 'Perifericos',
      price: 499.9,
      status: 'active',
      description: 'Switch tactile',
      stock: 7,
    };

    const updatedProduct: Product = {
      ...payload,
      createdAt: '2026-05-30T12:00:00.000Z',
    };

    apiMock.update.mockReturnValue(of(updatedProduct));

    const updated = await store.updateById('p1', payload);

    expect(updated).toBe(true);
    expect(store.items().find((item) => item.id === 'p1')?.name).toBe('Teclado Mecanico Pro');
    expect(store.notice()).toBe('Produto atualizado com sucesso.');
  });

  it('remove produto com removeById', async () => {
    await store.loadAll();
    apiMock.remove.mockReturnValue(of(undefined));

    await store.removeById('p1');

    expect(apiMock.remove).toHaveBeenCalledWith('p1');
    expect(store.items()).toHaveLength(1);
    expect(store.items()[0].id).toBe('p2');
    expect(store.notice()).toBe('Produto excluido com sucesso.');
  });

  it('define erro quando create falha', async () => {
    const payload: CreateProductPayload = {
      name: 'Falha',
      imageUrl: 'https://picsum.photos/seed/spec-falha/800/600',
      category: 'Teste',
      price: 10,
      status: 'inactive',
      description: 'Teste erro',
      stock: 1,
      createdAt: '2026-05-30T12:03:00.000Z',
    };
    apiMock.create.mockReturnValue(throwError(() => new Error('error')));

    const created = await store.create(payload);

    expect(created).toBe(false);
    expect(store.error()).toBe('Nao foi possivel cadastrar o produto.');
  });
});
