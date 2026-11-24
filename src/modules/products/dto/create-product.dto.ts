export class CreateProductDto {
  slug: string;
  price_cents: number;
  image_url: string | null;
  is_available: boolean;
  name: string;
  description: string | null;
}
