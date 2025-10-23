import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const personalInfo = pgTable('personal_info', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  title: text('title'), // Professional title (e.g., "Full Stack Developer")
  bio: text('bio'), // Professional bio/description
  avatar: text('avatar'), // Profile photo URL
  location: text('location'), // Location (e.g., "San Francisco, CA")
  phone: text('phone'), // Phone number
  email: text('email'), // Public contact email
  website: text('website'), // Personal website URL
  resumeUrl: text('resume_url'), // Resume/CV download URL
  socialLinks: jsonb('social_links'), // Social media links as JSON object
  skills: text('skills'), // Summary of key skills
  languages: jsonb('languages'), // Languages known as JSON array
  interests: text('interests'), // Professional interests
  isPublic: boolean('is_public').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const personalInfoRelations = relations(personalInfo, ({ one }) => ({
  user: one(users, {
    fields: [personalInfo.userId],
    references: [users.id],
  }),
}));

export type PersonalInfo = typeof personalInfo.$inferSelect;
export type NewPersonalInfo = typeof personalInfo.$inferInsert;