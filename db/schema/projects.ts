import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { projectSkills } from './project-skills';

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  longDescription: text('long_description'),
  imageUrl: text('image_url'), // Main project image
  images: jsonb('images'), // Additional project images as JSON array
  technologies: jsonb('technologies'), // Array of technology names
  projectUrl: text('project_url'), // Live demo URL
  githubUrl: text('github_url'), // GitHub repository URL
  featured: boolean('featured').notNull().default(false),
  published: boolean('published').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  author: one(users, {
    fields: [projects.authorId],
    references: [users.id],
  }),
  skills: many(projectSkills),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;