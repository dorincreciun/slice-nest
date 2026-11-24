import { Controller, Get, Param } from '@nestjs/common';
import { ProductsRepository } from './prodcuts.repository';
import { Product } from './types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsRepository) {}

  @Get('')
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<Product | null> {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<Product | null> {
    return this.productsService.findById(id);
  }
}
