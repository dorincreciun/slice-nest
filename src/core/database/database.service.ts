import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';
import { PG_POOL } from './database.constants';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);

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
