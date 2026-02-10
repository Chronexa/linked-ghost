import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialization to support environment variable loading
let _client: postgres.Sql | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getClient() {
  if (!_client) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }

    _client = postgres(process.env.DATABASE_URL, {
      max: 10, // Connection pool size
      idle_timeout: 20, // Close idle connections after 20 seconds
      connect_timeout: 10, // Connection timeout in seconds
    });
  }
  return _client;
}

function getDb() {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}

// Export a proxy that lazily initializes the db
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const database = getDb();
    const value = (database as any)[prop];
    return typeof value === 'function' ? value.bind(database) : value;
  }
});

// Export schema for easy access
export { schema };

// Helper function to test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = getClient();
    await client`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Helper function to close connection (for graceful shutdown)
export async function closeConnection(): Promise<void> {
  const client = getClient();
  await client.end();
  console.log('Database connection closed');
}
