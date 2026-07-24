import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Provide a dummy URL so `neon()` doesn't crash during build or local dev if .env is missing.
// It will throw an error when a query is actually executed if the URL is invalid.
const databaseUrl = process.env.DATABASE_URL || "postgresql://dummy:dummy@ep-dummy-db.neon.tech/neondb?sslmode=require";

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
