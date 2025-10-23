import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const education = pgTable('education', {
  id: text('id').primaryKey(),
  institution: text('institution').notNull(),
  degree: text('degree').notNull(),
  field: text('field').notNull(),
  location: text('location'),
  description: text('description'),
  gpa: text('gpa'), // GPA or grade
  honors: text('honors'), // Any honors or distinctions
  institutionLogo: text('institution_logo'), // URL to institution logo
  currentStudent: boolean('current_student').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'), // null if current student
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const educationRelations = relations(education, ({ one }) => ({
  author: one(users, {
    fields: [education.authorId],
    references: [users.id],
  }),
}));

export type Education = typeof education.$inferSelect;
export type NewEducation = typeof education.$inferInsert;