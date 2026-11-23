import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './prodcuts.repository';
import { ProductsController } from './products.controller';

@Module({
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
  controllers: [ProductsController],
})
export class ProductsModule {}
