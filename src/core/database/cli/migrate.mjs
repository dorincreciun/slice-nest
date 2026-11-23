#!/usr/bin/env node
// Migrări minimale: fișiere .sql numerotate din src/core/database/migrations,
// aplicate în ordine, fiecare într-o tranzacție, urmărite în tabela schema_migrations.
//
//   npm run db:migrate           aplică migrările neaplicate
//   npm run db:new -- add_foo    creează 002_add_foo.sql gol
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import pg from 'pg';

expand(config({ quiet: true }));

const dir = fileURLToPath(
  new URL('../migrations/', import.meta.url),
);
const [cmd, arg] = process.argv.slice(2);

async function create(name) {
  if (!/^[a-z0-9_]+$/.test(name ?? '')) {
    throw new Error('Usage: npm run db:new -- <snake_case_name>');
  }
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const next = String(parseInt(files.at(-1) ?? '0', 10) + 1).padStart(3, '0');
  const file = `${next}_${name}.sql`;
  await writeFile(join(dir, file), '', { flag: 'wx' });
  console.log(`Created ${file}`);
}

async function migrate() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('select pg_advisory_lock(727274)'); // evită rulări paralele
    await client.query(`create table if not exists schema_migrations (
      name text primary key, applied_at timestamptz not null default now())`);
    const done = new Set(
      (await client.query('select name from schema_migrations')).rows.map(
        (r) => r.name,
      ),
    );
    const pending = (await readdir(dir))
      .filter((f) => f.endsWith('.sql') && !done.has(f))
      .sort();
    for (const file of pending) {
      const sql = await readFile(join(dir, file), 'utf8');
      try {
        await client.query('begin');
        await client.query(sql);
        await client.query('insert into schema_migrations (name) values ($1)', [
          file,
        ]);
        await client.query('commit');
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query('rollback');
        throw new Error(`Migration ${file} failed: ${error.message}`);
      }
    }
    console.log(pending.length ? 'Done.' : 'Nothing to apply.');
  } finally {
    await client.end();
  }
}

try {
  await (cmd === 'new' ? create(arg) : migrate());
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
