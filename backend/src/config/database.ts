// Database configuration - mock only for now
// Prisma disabled until DATABASE_URL is properly configured

export const prisma = null;
export const getPrisma = () => null;
export const parseJsonField = <T>(value: any, defaultValue: T): T => defaultValue;
export const checkDatabaseConnection = async () => false;
export const isDatabaseConnected = () => false;
