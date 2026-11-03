import { NestFactory } from '@nestjs/core';
import { AppModule } from './core/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  const config = app.get(ConfigService);
  await app.listen(config.getOrThrow<number>('PORT'));
}
await bootstrap();
