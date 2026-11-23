import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database';
import { HealthModule } from './health';
import { ProductsModule } from '../modules/products';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
      expandVariables: true,
    }),
    DatabaseModule,
    HealthModule,
    ProductsModule,
  ],
})
export class AppModule {}
