import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductsRepository } from './prodcuts.repository';
import { Product } from './types';
import { CreateProductDto, GetProductsIds } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsRepository) {}

  @Get('')
  async findAll(@Query() query: GetProductsIds): Promise<Product[]> {
    return query.ids
      ? this.productsService.findManyByIds(query.ids)
      : this.productsService.findAll();
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Product | null> {
    return this.productsService.findBySlug(slug);
  }

  @Get('/:id')
  async findById(@Param('id') id: number): Promise<Product | null> {
    return this.productsService.findById(id);
  }

  @Post('')
  async createNewProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
