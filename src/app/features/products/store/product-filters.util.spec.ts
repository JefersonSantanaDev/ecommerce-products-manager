import { Product, ProductFilters } from '../../../core/models';
import { applyProductFilters } from './product-filters.util';

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Teclado Mecanico',
    imageUrl: 'https://picsum.photos/seed/filter-teclado/800/600',
    category: 'Perifericos',
    price: 399.9,
    status: 'active',
    description: 'Switch brown',
    stock: 8,
    createdAt: '2026-05-30T12:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'Mouse Gamer',
    imageUrl: 'https://picsum.photos/seed/filter-mouse/800/600',
    category: 'Perifericos',
    price: 249.9,
    status: 'inactive',
    description: 'Sensor optico',
    stock: 12,
    createdAt: '2026-05-30T12:01:00.000Z',
  },
  {
    id: 'p3',
    name: 'Monitor IPS 27',
    imageUrl: 'https://picsum.photos/seed/filter-monitor/800/600',
    category: 'Monitores',
    price: 1299.0,
    status: 'active',
    description: '165hz',
    stock: 4,
    createdAt: '2026-05-30T12:02:00.000Z',
  },
];

const emptyFilters: ProductFilters = {
  category: null,
  status: null,
  minPrice: null,
  maxPrice: null,
};

describe('applyProductFilters', () => {
  it('retorna todos os itens quando nao ha filtros', () => {
    const result = applyProductFilters(mockProducts, emptyFilters);

    expect(result).toHaveLength(3);
  });

  it('filtra por categoria', () => {
    const result = applyProductFilters(mockProducts, {
      ...emptyFilters,
      category: 'Perifericos',
    });

    expect(result).toHaveLength(2);
    expect(result.every((item) => item.category === 'Perifericos')).toBe(true);
  });

  it('filtra por status', () => {
    const result = applyProductFilters(mockProducts, {
      ...emptyFilters,
      status: 'active',
    });

    expect(result).toHaveLength(2);
    expect(result.every((item) => item.status === 'active')).toBe(true);
  });

  it('filtra por faixa de preco (limites inclusivos)', () => {
    const result = applyProductFilters(mockProducts, {
      ...emptyFilters,
      minPrice: 249.9,
      maxPrice: 399.9,
    });

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.id)).toEqual(['p1', 'p2']);
  });

  it('combina categoria, status e faixa de preco', () => {
    const result = applyProductFilters(mockProducts, {
      category: 'Perifericos',
      status: 'inactive',
      minPrice: 200,
      maxPrice: 300,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p2');
  });
});
