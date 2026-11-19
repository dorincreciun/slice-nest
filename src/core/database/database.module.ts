import {
  Global,
  Inject,
  Logger,
  Module,
  type Provider,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import type { EnvironmentVariables } from '../config/env.validation';
import { PG_POOL } from './database.constants';

const poolProvider: Provider = {
  provide: PG_POOL,
  useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
    new Pool({
      connectionString: config.get('DATABASE_URL', { infer: true }),
    }),
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [poolProvider],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.pool.query('select 1');
      this.logger.log('Connected to PostgreSQL');
    } catch (error) {
      throw new Error(
        'Cannot connect to PostgreSQL. Is the container running? Check DATABASE_URL.',
        { cause: error },
      );
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
