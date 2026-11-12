import { Global, Logger, Module, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleModule, InjectDrizzle } from '@nestjs/drizzle';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { EnvironmentVariables } from '../config/env.validation';
import { type Database, relations } from './relations';

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
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@InjectDrizzle() private readonly db: Database) {}

  // fail-fast: @nestjs/drizzle nu verifică singur conexiunea la pornire
  async onModuleInit(): Promise<void> {
    try {
      await this.db.execute(sql`select 1`);
      this.logger.log('Connected to PostgreSQL');
    } catch (error) {
      throw new Error(
        'Cannot connect to PostgreSQL. Is the container running? Check DATABASE_URL.',
        { cause: error },
      );
    }
  }
}
