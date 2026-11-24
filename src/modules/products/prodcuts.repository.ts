import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database';
import { Product, ProductRow, ProductsTable } from './types';
import { toProduct } from './product.mapper';
import { CreateProductDto } from './dto';

@Injectable()
export class ProductsRepository {
  public constructor(
    @Inject(DatabaseService)
    private readonly db: DatabaseService,
  ) {}

  public async findAll(locale = 'ru'): Promise<Product[]> {
    const sql = `
      SELECT
        p.id,
        p.slug,
        p.price_cents,
        p.image_url,
        p.is_available,
        t.name,
        t.description
      FROM products AS p
             JOIN product_translations AS t
                  ON t.product_id = p.id
                    AND t.locale = $1
      WHERE p.deleted_at IS NULL
      ORDER BY t.name;
    `;
    const products = await this.db.many<ProductRow>(sql, [locale]);
    return products.map(toProduct);
  }

  public async findBySlug(
    slug: string,
    locale = 'ru',
  ): Promise<Product | null> {
    const sql = `
      SELECT
        p.id,
        p.slug,
        p.price_cents,
        p.image_url,
        p.is_available,
        t.name,
        t.description
      FROM products AS p
             JOIN product_translations AS t
                  ON t.product_id = p.id
                    AND t.locale = $2
      WHERE p.deleted_at IS NULL AND p.slug = $1;
    `;
    const product = await this.db.oneOrNone<ProductRow>(sql, [slug, locale]);
    return product ? toProduct(product) : null;
  }

  public async findById(id: number, locale = 'ru'): Promise<Product | null> {
    const sql = `
      SELECT
        p.id,
        p.slug,
        p.price_cents,
        p.image_url,
        p.is_available,
        t.name,
        t.description
      FROM products AS p
             JOIN product_translations AS t
                  ON t.product_id = p.id
                    AND t.locale = $2
      WHERE p.deleted_at IS NULL AND p.id = $1;
    `;
    const product = await this.db.oneOrNone<ProductRow>(sql, [id, locale]);
    return product ? toProduct(product) : null;
  }

  public async findManyByIds(ids: number[], locale = 'ru') {
    const sql = `
      SELECT
        p.id,
        p.slug,
        p.price_cents,
        p.image_url,
        p.is_available,
        t.name,
        t.description
      FROM products AS p
             JOIN product_translations AS t
                  ON t.product_id = p.id
                    AND t.locale = $2
      WHERE p.deleted_at IS NULL AND p.id = ANY ($1::int[]);
    `;
    const products = await this.db.many<ProductRow>(sql, [ids, locale]);
    return products.map(toProduct);
  }

  public async create(data: CreateProductDto, locale = 'ru'): Promise<Product> {
    return this.db.transaction(async (client) => {
      const { rows } = await client.query<ProductsTable>(
        `
        INSERT INTO products (slug, price_cents, image_url, is_available)
        VALUES ($1, $2, $3, $4)
        RETURNING id, slug, price_cents, image_url, is_available;
      `,
        [data.slug, data.price_cents, data.image_url, data.is_available],
      );
      const created = rows[0];

      await client.query(
        `
        INSERT INTO product_translations (product_id, locale, name, description)
        VALUES ($1, $2, $3, $4);
      `,
        [created.id, locale, data.name, data.description],
      );

      return toProduct({
        ...created,
        name: data.name,
        description: data.description,
      });
    });
  }
}
