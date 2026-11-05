import { defineRelations } from 'drizzle-orm';
import * as schema from './schema/index.js';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const relations = defineRelations(schema, (r) => ({}));

export type Database = NodePgDatabase<typeof relations>;
