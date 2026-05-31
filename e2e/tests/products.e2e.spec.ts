import { APIRequestContext, expect, test } from '@playwright/test';

const API_PRODUCTS_URL = 'http://127.0.0.1:3000/products';

type ProductStatus = 'active' | 'inactive';

interface E2eProduct {
  name: string;
  imageUrl: string;
  category: string;
  price: number;
  status: ProductStatus;
  description: string;
  stock: number;
  createdAt: string;
}

test.describe('Produtos - fluxos principais', () => {
  const trackedProductIds = new Set<string>();
  const trackedProductNames = new Set<string>();

  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await expect(
      page.getByRole('heading', {
        name: 'Produtos',
      }),
    ).toBeVisible();
    await expect(page.locator('.products-page__total-value')).toBeVisible();
  });

  test.afterEach(async ({ request }) => {
    for (const id of trackedProductIds) {
      await deleteProductById(request, id);
    }
    trackedProductIds.clear();

    for (const name of trackedProductNames) {
      const idsByName = await findProductIdsByName(request, name);
      for (const id of idsByName) {
        await deleteProductById(request, id);
      }
    }
    trackedProductNames.clear();
  });

  test('deve exibir listagem inicial de produtos', async ({ page }) => {
    const cards = page.locator('.products-page ul > li');
    const cardsCount = await cards.count();
    expect(cardsCount).toBeGreaterThan(0);
    await expect(page.locator('.products-page__total-value')).toHaveText(String(cardsCount));
  });

  test('deve filtrar por categoria usando select customizado', async ({ page }) => {
    await page.getByRole('button', { name: 'Categoria' }).click();
    await page.getByRole('option', { name: 'Monitores' }).click();

    const cards = page.locator('.products-page ul > li');
    await expect(page.locator('.products-page__total-value')).toHaveText('2');
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toContainText('Monitores');
    await expect(cards.nth(1)).toContainText('Monitores');
  });

  test('deve validar campos obrigatórios no cadastro', async ({ page }) => {
    await page.getByRole('link', { name: 'Novo produto' }).click();
    await expect(
      page.getByRole('heading', {
        name: 'Cadastrar produto',
      }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByText('Nome é obrigatório.')).toBeVisible();
    await expect(page.getByText('URL da imagem é obrigatória.')).toBeVisible();
    await expect(page.getByText('Categoria é obrigatória.')).toBeVisible();
    await expect(page.getByText('Descrição é obrigatória.')).toBeVisible();
  });

  test('deve criar produto pela interface e refletir na listagem', async ({ page }) => {
    const uniqueSuffix = Date.now().toString();
    const productName = `Produto E2E Create ${uniqueSuffix}`;
    trackedProductNames.add(productName);

    await page.getByRole('link', { name: 'Novo produto' }).click();
    await expect(page.getByRole('heading', { name: 'Cadastrar produto' })).toBeVisible();

    await page.getByLabel('Nome').fill(productName);
    await page.getByLabel('URL da imagem').fill('/assets/products/keyboard.jpg');
    await page.getByLabel('Categoria').fill('Perifericos');
    await page.getByLabel('Preço').fill('1299,90');
    await page.getByLabel('Preço').blur();
    await page.getByLabel('Estoque').fill('14');
    await page.getByLabel('Descrição').fill('Produto criado via fluxo E2E para validar cadastro.');

    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { name: 'Produtos' })).toBeVisible();

    const createdCard = page.locator('.products-page ul > li', { hasText: productName }).first();
    await expect(createdCard).toBeVisible();
    await expect(createdCard).toContainText('R$ 1.299,90');
  });

  test('deve editar produto existente pela interface', async ({ page, request }) => {
    const uniqueSuffix = Date.now().toString();
    const seededProduct = buildSeedProduct(`edit-${uniqueSuffix}`);
    const createdProductId = await createProductByApi(request, seededProduct);
    trackedProductIds.add(createdProductId);

    await page.goto(`/products/${createdProductId}/edit`);
    await expect(page.getByRole('heading', { name: 'Editar produto' })).toBeVisible();

    const updatedName = `Produto E2E Editado ${uniqueSuffix}`;
    await page.getByLabel('Nome').fill(updatedName);
    await page.getByLabel('Preço').fill('1599,90');
    await page.getByLabel('Preço').blur();
    await page.getByLabel('Estoque').fill('9');
    await page.getByLabel('Descrição').fill('Produto atualizado via fluxo E2E.');

    await page.getByRole('button', { name: 'Status do produto' }).click();
    await page.getByRole('option', { name: 'Inativo' }).click();

    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { name: 'Produtos' })).toBeVisible();

    const updatedCard = page.locator('.products-page ul > li', { hasText: updatedName }).first();
    await expect(updatedCard).toBeVisible();
    await expect(updatedCard).toContainText('R$ 1.599,90');
    await expect(updatedCard).toContainText('Inativo');
  });

  test('deve excluir produto existente pela interface', async ({ page, request }) => {
    const uniqueSuffix = Date.now().toString();
    const seededProduct = buildSeedProduct(`delete-${uniqueSuffix}`);
    const createdProductId = await createProductByApi(request, seededProduct);
    trackedProductIds.add(createdProductId);

    await page.goto('/products');
    const productCard = page.locator('.products-page ul > li', { hasText: seededProduct.name }).first();
    await expect(productCard).toBeVisible();

    await productCard.getByRole('button', { name: 'Excluir produto' }).click();
    const confirmDialog = page.getByRole('dialog');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole('button', { name: 'Excluir produto' }).click();

    await expect(page.locator('.products-page ul > li', { hasText: seededProduct.name })).toHaveCount(0);
    trackedProductIds.delete(createdProductId);
  });
});

function buildSeedProduct(uniqueKey: string): E2eProduct {
  return {
    name: `Produto E2E ${uniqueKey}`,
    imageUrl: '/assets/products/mouse.jpg',
    category: 'Perifericos',
    price: 799.9,
    status: 'active',
    description: 'Produto criado por automacao E2E.',
    stock: 20,
    createdAt: new Date().toISOString(),
  };
}

async function createProductByApi(request: APIRequestContext, product: E2eProduct): Promise<string> {
  const response = await request.post(API_PRODUCTS_URL, {
    data: product,
  });
  expect(response.ok()).toBeTruthy();

  const body: unknown = await response.json();
  const id = extractProductId(body);
  if (id === null) {
    throw new Error('Não foi possível identificar o id do produto criado via API de E2E.');
  }
  return id;
}

async function deleteProductById(request: APIRequestContext, id: string): Promise<void> {
  const response = await request.delete(`${API_PRODUCTS_URL}/${id}`);
  const status = response.status();
  expect([200, 202, 204, 404]).toContain(status);
}

async function findProductIdsByName(request: APIRequestContext, name: string): Promise<string[]> {
  const response = await request.get(`${API_PRODUCTS_URL}?name=${encodeURIComponent(name)}`);
  if (!response.ok()) {
    return [];
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    return [];
  }

  const ids: string[] = [];
  for (const item of body) {
    if (!isRecord(item)) {
      continue;
    }

    const itemName = item['name'];
    const itemId = item['id'];
    if (itemName !== name) {
      continue;
    }

    if (typeof itemId === 'string' || typeof itemId === 'number') {
      ids.push(String(itemId));
    }
  }

  return ids;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractProductId(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = value['id'];
  if (typeof id === 'string' || typeof id === 'number') {
    return String(id);
  }

  return null;
}
