import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';
import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { PG_POOL } from './database.constants';

/**
 * Thin wrapper over the `pg` Pool.
 * Exposes query helpers named by the row-count they guarantee.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);

  public constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /**
   * Verifies connectivity on startup (fail fast).
   * @throws Error with the original error as `cause` if PostgreSQL is unreachable.
   */
  public async onModuleInit(): Promise<void> {
    try {
      await this.pool.query('SELECT 1');
      this.logger.log('Connected to PostgreSQL');
    } catch (error: unknown) {
      throw new Error(
        'Cannot connect to PostgreSQL. Is the server running? Check DATABASE_URL.',
        { cause: error },
      );
    }
  }

  /** Drains and closes all pool connections on app shutdown. */
  public async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Returns all rows (possibly empty).
   * Use for lists: `SELECT ... WHERE category = $1`.
   * @param sql Parameterized SQL (`$1`, `$2`, ...). Never interpolate user input.
   * @param params Values bound to placeholders.
   */
  public async many<R extends QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<R[]> {
    const { rows } = await this.execute<R>(sql, params);
    return rows;
  }

  /**
   * Returns the single row or `null` if none.
   * Use for lookups by unique key and `UPDATE/DELETE ... RETURNING`.
   * @throws Error if more than one row is returned (indicates a wrong WHERE).
   */
  public async oneOrNone<R extends QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<R | null> {
    const { rows } = await this.execute<R>(sql, params);
    if (rows.length > 1) {
      throw new Error(`Expected at most 1 row, got ${rows.length}`);
    }
    return rows[0] ?? null;
  }

  /**
   * Returns exactly one row.
   * Use for `INSERT ... RETURNING` or when absence is a bug, not a 404.
   * @throws Error if the result has 0 or more than 1 rows.
   */
  public async one<R extends QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<R> {
    const { rows } = await this.execute<R>(sql, params);
    const [row] = rows;
    if (rows.length !== 1 || row === undefined) {
      throw new Error(`Expected exactly 1 row, got ${rows.length}`);
    }
    return row;
  }

  /**
   * Runs a query, logs its duration (success or failure) and rethrows errors.
   * Params are intentionally NOT logged (may contain sensitive data).
   */
  private async execute<R extends QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<QueryResult<R>> {
    const t0 = performance.now();
    try {
      return await this.pool.query<R>(sql, params);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      this.logger.error(`Query failed: ${err.message}`, err.stack);
      throw err;
    } finally {
      const ms = (performance.now() - t0).toFixed(1);
      this.logger.log(`${ms}ms | ${sql.replace(/\s+/g, ' ').trim()}`);
    }
  }
}
