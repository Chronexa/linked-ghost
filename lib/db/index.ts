import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Create PostgreSQL connection
// For serverless environments, use connection pooling with max connections
const connectionString = process.env.DATABASE_URL;

// Create postgres client
const client = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Create Drizzle ORM instance
export const db = drizzle(client, { schema });

// Export schema for easy access
export { schema };

// Helper function to test database connection
export async function testConnection(): Promise<boolean> {
  try {
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
  await client.end();
  console.log('Database connection closed');
}
