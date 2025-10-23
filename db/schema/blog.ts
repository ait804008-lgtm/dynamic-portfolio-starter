import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const blogPosts = pgTable('blog_posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(), // Full blog post content (Markdown)
  featuredImage: text('featured_image'), // URL to featured image
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tags: jsonb('tags'), // Array of tags
  category: text('category'),
  readTime: integer('read_time'), // Estimated reading time in minutes
  views: integer('views').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  published: boolean('published').notNull().default(false),
  metaTitle: text('meta_title'), // SEO meta title
  metaDescription: text('meta_description'), // SEO meta description
  ogImage: text('og_image'), // Open Graph image URL
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
});

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;