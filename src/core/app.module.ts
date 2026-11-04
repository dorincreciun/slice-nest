import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
      expandVariables: true
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
