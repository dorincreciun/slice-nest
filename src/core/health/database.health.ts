import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { type Database, InjectDatabase } from '../database/index';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    @InjectDatabase() private readonly db: Database,
    private readonly indicator: HealthIndicatorService,
  ) {}

  isHealthy(key: string) {
    return this.indicator
      .check(key)
      .attempt(async () => {
        await this.db.query('select 1');
      })
      .withTimeout(1000);
  }
}
