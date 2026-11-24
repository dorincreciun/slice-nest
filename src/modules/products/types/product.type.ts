import { ProductsTable, ProductTranslationsTable } from './table.type';

export type ProductRow = Pick<
  ProductsTable,
  'id' | 'slug' | 'price_cents' | 'image_url' | 'is_available'
> &
  Pick<ProductTranslationsTable, 'name' | 'description'>;

export interface Product extends ProductRow {}
