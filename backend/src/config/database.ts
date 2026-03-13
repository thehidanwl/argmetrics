import { PrismaClient } from '@prisma/client';

// Initialize Prisma only when a database URL is available.
// Supports both POSTGRES_URL (Supabase) and DATABASE_URL (SQLite or generic).
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

let _prisma: PrismaClient | null = null;
let _connected = false;

if (databaseUrl) {
  try {
    _prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
    _connected = true;
    console.log('✅ Prisma client initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Prisma client:', error);
  }
} else {
  console.warn('⚠️ No database URL configured (POSTGRES_URL / DATABASE_URL). Running in mock mode.');
}

export const prisma = _prisma;

export const getPrisma = (): PrismaClient | null => _prisma;

export const isDatabaseConnected = (): boolean => _connected;

export const checkDatabaseConnection = async (): Promise<boolean> => {
  if (!_prisma) return false;
  try {
    await _prisma.$queryRaw`SELECT 1`;
    _connected = true;
    return true;
  } catch {
    _connected = false;
    return false;
  }
};

// Safely parse a JSON string field, returning defaultValue on failure.
export const parseJsonField = <T>(value: unknown, defaultValue: T): T => {
  if (value === null || value === undefined) return defaultValue;
  try {
    return typeof value === 'string' ? (JSON.parse(value) as T) : (value as T);
  } catch {
    return defaultValue;
  }
};
