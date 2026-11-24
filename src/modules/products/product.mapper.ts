import type { Product, ProductRow } from './types';
export function toProduct(row: ProductRow): Product {
  return { ...row };
}
