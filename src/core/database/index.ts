import { Inject } from '@nestjs/common';
import { PG_POOL } from './database.constants';

export { DatabaseModule } from './database.module';
export { PG_POOL } from './database.constants';
export type { Pool as Database } from 'pg';

/** Injectează Pool-ul `pg`: `constructor(@InjectDatabase() private db: Database)` */
export const InjectDatabase = () => Inject(PG_POOL);
