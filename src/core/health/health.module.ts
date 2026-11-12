import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  imports: [HealthModule],
  controllers: [HealthController],
})
export class HealthModule {}
