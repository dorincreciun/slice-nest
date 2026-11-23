#!/usr/bin/env node
// Date demo pentru dezvoltare: rulează toate fișierele din src/core/database/seeds
// în ordine, TOATE într-o singură tranzacție (ori intră tot, ori nimic).
// Nu e migrare: nu se scrie în schema_migrations, iar fișierele sunt idempotente
// (ON CONFLICT DO NOTHING), deci pot fi rulate de oricâte ori.
//
//   npm run db:seed
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import pg from 'pg';

expand(config({ quiet: true }));

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed in production.');
  process.exit(1);
}

const dir = fileURLToPath(
  new URL('../src/core/database/seeds/', import.meta.url),
);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  await client.query('begin');
  for (const file of files) {
    await client.query(await readFile(join(dir, file), 'utf8'));
    console.log(`Seeded ${file}`);
  }
  await client.query('commit');
  console.log('Done.');
} catch (error) {
  await client.query('rollback').catch(() => {});
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
