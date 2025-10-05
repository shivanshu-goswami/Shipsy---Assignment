// Import the PrismaClient from the @prisma/client package.
import { PrismaClient } from '@/app/generated/prisma';

// Instantiate a single, shared instance of the PrismaClient.
// In development, use a global variable to prevent multiple instances
// In production, create a new instance
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Export the prisma instance to be used in your API routes.
export default prisma;
