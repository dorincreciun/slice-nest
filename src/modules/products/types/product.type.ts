export type ProductRow = {
  id: number;
  slug: string;
  price_cents: number;
  image_url: string | null;
  name: string;
  description: string | null;
};

export type Product = {
  id: number;
  slug: string;
  price_cents: number;
  image_url: string | null;
  name: string;
  description: string | null;
};
