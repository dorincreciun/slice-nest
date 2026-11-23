import { Global, Module, type Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import type { EnvironmentVariables } from '../config/env.validation';
import { PG_POOL } from './database.constants';
import { DatabaseService } from './database.service';

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
  providers: [poolProvider, DatabaseService],
  exports: [PG_POOL],
})
export class DatabaseModule {}
