import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { DrizzleModule, InjectDrizzle } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { type Database, relations } from './relations.js';
import { sql } from 'drizzle-orm';

@Global()
@Module({
  imports: [
    DrizzleModule.forRootAsync({
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        drizzle,
        connection: config.get('DATABASE_URL', { infer: true }),
        relations,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [DrizzleModule],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    @InjectDrizzle()
    private readonly db: Database,
  ) {}
  async onModuleInit() {
    await this.db.execute(sql`select 1`);
    new Logger('Database').log('Connected');
  }
}
