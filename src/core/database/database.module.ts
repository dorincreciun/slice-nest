import {
  Global,
  Inject,
  Logger,
  Module,
  type OnApplicationShutdown,
  type OnModuleInit,
  type Provider,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DATABASE_CLIENT } from './database.constants.js';
import { EnvironmentVariables } from '../config/env.validation.js';

const databaseProvider: Provider = {
  provide: DATABASE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService<EnvironmentVariables, true>): Pool => {
    const pool = new Pool({
      connectionString: config.get('DATABASE_URL', { infer: true }),
    });

    const logger = new Logger('DatabasePool');
    pool.on('error', (error) => {
      logger.error(`Idle client error: ${error.message}`);
    });

    return pool;
  },
};

@Global()
@Module({
  providers: [databaseProvider],
  exports: [DATABASE_CLIENT],
})
export class DatabaseModule implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@Inject(DATABASE_CLIENT) private readonly pool: Pool) {}

  async onModuleInit(): Promise<void> {
    try {
      const result = await this.pool.query<{ server_version: string }>(
        'SHOW server_version',
      );
      this.logger.log(
        `Connected to PostgreSQL ${result.rows[0]?.server_version ?? ''}`,
      );
    } catch (error) {
      throw new Error(
        'Cannot connect to PostgreSQL. Is the container running? Check DATABASE_URL.',
        { cause: error },
      );
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
    this.logger.log('PostgreSQL pool closed');
  }
}
