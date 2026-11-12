import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DrizzleHealthIndicator } from './drizzle.health.js';

@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly drizzle: DrizzleHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.drizzle.isHealthy('database')]);
  }
}
