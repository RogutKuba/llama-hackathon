import { text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const siteTable = pgTable('sites', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  name: text('name').notNull(),
  url: text('url').notNull(),
});

export type SiteEntity = typeof siteTable.$inferSelect;
