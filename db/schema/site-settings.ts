import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const siteSettings = pgTable('site_settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  type: text('type').notNull().default('text'), // text, number, boolean, json
  description: text('description'), // Description of the setting
  category: text('category').notNull().default('general'), // general, seo, social, contact, etc.
  public: boolean('public').notNull().default(false), // Whether this setting is publicly accessible
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const siteSettingsRelations = relations(siteSettings, ({ one }) => ({
  author: one(users, {
    fields: [siteSettings.authorId],
    references: [users.id],
  }),
}));

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;