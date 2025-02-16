import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './schema';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client);

export interface UserInput {
  name: string;
  encrypass: string;
}

export async function createUser(user: UserInput) {
  try {
    await db.insert(users).values(user);
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export default db;
