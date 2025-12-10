/**
 * Prisma Client Singleton
 *
 * This pattern prevents multiple Prisma Client instances in development
 * due to Next.js hot reloading. In production, a single instance is used.
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		// Connection URL is configured in prisma.config.ts
		// Prisma Client will read DATABASE_URL from environment variables
		log:
			process.env.NODE_ENV === 'development'
				? ['query', 'error', 'warn']
				: ['error'],
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

export default prisma;
