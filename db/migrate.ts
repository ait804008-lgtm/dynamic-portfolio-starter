import { db } from './index';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');

    // Create migrations table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Read and execute migration file
    const migrationPath = path.join(process.cwd(), 'drizzle', '0001_comprehensive_schema.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Check if migration already exists
    const migrationName = '0001_comprehensive_schema';
    const existingMigration = await db.execute(sql`
      SELECT name FROM _migrations WHERE name = ${migrationName}
    `);

    if (existingMigration.rowCount === 0) {
      // Execute migration
      await db.execute(sql.raw(migrationSql));

      // Record migration
      await db.execute(sql`
        INSERT INTO _migrations (name) VALUES (${migrationName})
      `);

      console.log('✅ Migration completed successfully!');
    } else {
      console.log('⏭️ Migration already executed, skipping...');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('🎉 Database migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration process failed:', error);
      process.exit(1);
    });
}

export { runMigration };