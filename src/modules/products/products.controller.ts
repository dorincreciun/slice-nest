import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './prodcuts.repository';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsRepository) {}

  @Get('')
  async findAll() {
    return this.productsService.findAll();
  }
}
