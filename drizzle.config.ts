import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { defineConfig } from 'drizzle-kit';

expand(config());

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/core/database/schema/index.ts',
  out: './src/core/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
