import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function checkDbConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma ORM successfully.');
    return true;
  } catch (err: any) {
    console.error('❌ Could not connect to PostgreSQL database:', err.message);
    return false;
  }
}
