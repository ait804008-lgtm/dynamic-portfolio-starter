import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { projectSkills } from './project-skills';

export const skills = pgTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  category: text('category').notNull(), // e.g., "Frontend", "Backend", "Tools"
  proficiency: integer('proficiency').notNull(), // 1-5 scale
  description: text('description'),
  icon: text('icon'), // URL to skill icon or image
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  tags: jsonb('tags'), // Array of related tags
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const skillsRelations = relations(skills, ({ one, many }) => ({
  author: one(users, {
    fields: [skills.authorId],
    references: [users.id],
  }),
  projects: many(projectSkills),
}));

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;