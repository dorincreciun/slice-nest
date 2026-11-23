import { Inject, Injectable } from '@nestjs/common';
import { PG_POOL } from '../../core/database';
import type { Pool } from 'pg';
import { Product, ProductRow } from './types';
import { toProduct } from './product.mapper';

@Injectable()
export class ProductsRepository {
  constructor(
    @Inject(PG_POOL)
    private readonly db: Pool,
  ) {}

  async findAll(locale = 'ru'): Promise<Product[]> {
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
    const { rows } = await this.db.query<ProductRow>(sql, [locale]);
    return rows[0].map(toProduct);
  }
}
