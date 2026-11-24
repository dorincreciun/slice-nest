import { Locale } from '../../../common/const/locale.const';

export type ProductsTable = {
  id: number;
  is_available: boolean;
  image_url: string | null;
  slug: string;
  price_cents: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type ProductTranslationsTable = {
  product_id: number;
  locale: Locale;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};
