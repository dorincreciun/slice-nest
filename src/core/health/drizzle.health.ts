import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { Database } from '../database';
import { sql } from 'drizzle-orm';

@Injectable()
export class DrizzleHealthIndicator {
  constructor(
    @InjectDrizzle()
    private readonly db: Database,
    private readonly indicator: HealthIndicatorService,
  ) {}

  isHealthy(key: string) {
    return this.indicator
      .check(key)
      .attempt(async () => {
        await this.db.execute(sql`select 1`);
      })
      .withTimeout(1000);
  }
}
