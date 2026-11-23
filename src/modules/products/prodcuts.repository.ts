import { Injectable } from '@nestjs/common';
import { InjectDatabase, DatabaseService } from '../../core/database';
import { Product, ProductRow } from './types';
import { toProduct } from './product.mapper';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectDatabase()
    private readonly db: DatabaseService,
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
    const products = await this.db.many<ProductRow>(sql, [locale]);
    return products.map(toProduct);
  }
}
