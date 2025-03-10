import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { list } from './schema';
import 'dotenv/config';
import { eq } from 'drizzle-orm/expressions';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client);

export interface UserInput {
  name: string;
  encrypwd: string;
}

export interface PasswordEntry {
  id: number;
  name: string;
  password: string;
}

export async function AddPassword(data: UserInput) {
  try {
    await db.insert(list).values(data);
    return true;
  } catch (error) {
    console.error('Error adding password:', error);
    throw error;
  }
}

export async function GetPasswords(decrypt: (text: string) => string): Promise<PasswordEntry[]> {
  try {
    const passwords = await db.select().from(list);
    return passwords.map(entry => ({
      id: entry.id,
      name: entry.name ?? '',
      password: decrypt(entry.encrypwd ?? '')
    }));
  } catch (error) {
    console.error('Error fetching passwords:', error);
    throw error;
  }
}

export async function DeletePassword(id: number): Promise<boolean> {
  try {
    await db.delete(list).where(eq(list.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting password:', error);
    throw error;
  }
}

export default db;
