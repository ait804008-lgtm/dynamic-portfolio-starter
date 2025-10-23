import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { schema } from './schema';

export const db = drizzle(process.env.DATABASE_URL!, { schema });

// Export schema for easy access
export * from './schema';