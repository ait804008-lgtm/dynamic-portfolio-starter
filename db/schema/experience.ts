import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const experience = pgTable('experience', {
  id: text('id').primaryKey(),
  company: text('company').notNull(),
  position: text('position').notNull(),
  location: text('location'),
  description: text('description').notNull(),
  responsibilities: text('responsibilities'), // Array or JSON of responsibilities
  achievements: text('achievements'), // Key achievements in the role
  companyLogo: text('company_logo'), // URL to company logo
  currentJob: boolean('current_job').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'), // null if current job
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const experienceRelations = relations(experience, ({ one }) => ({
  author: one(users, {
    fields: [experience.authorId],
    references: [users.id],
  }),
}));

export type Experience = typeof experience.$inferSelect;
export type NewExperience = typeof experience.$inferInsert;