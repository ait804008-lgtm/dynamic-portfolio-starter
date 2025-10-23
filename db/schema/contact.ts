import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const contactMessages = pgTable('contact_messages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  phone: text('phone'), // Optional phone number
  company: text('company'), // Optional company name
  website: text('website'), // Optional website URL
  newsletter: boolean('newsletter').notNull().default(false), // Subscribe to newsletter
  source: text('source'), // How they found you (e.g., "Google", "LinkedIn")
  status: text('status').notNull().default('pending'), // pending, read, replied, archived
  ip: text('ip'), // IP address for spam protection
  userAgent: text('user_agent'), // User agent string
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;