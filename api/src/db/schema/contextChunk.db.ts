import { siteTable } from './site.db';
import {
  text,
  pgTable,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';

export const contextChunkTable = pgTable('context_chunks', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  siteId: text('site_id')
    .notNull()
    .references(() => siteTable.id),
  content: text('content').notNull(),
  position: integer('position').notNull(),
  sourceId: text('source_id').notNull(),
  sourceType: text('source_type').notNull(),
  processed: boolean('processed').notNull().default(false),
});

export type ContextChunkEntity = typeof contextChunkTable.$inferSelect;
