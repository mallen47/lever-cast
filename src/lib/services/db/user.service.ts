/**
 * User Database Service
 *
 * Handles all user-related database operations through Prisma.
 * Following database-integration rules: Use Prisma as the ONLY database client.
 */

import { prisma } from '@/lib/prisma';
import { Prisma, Platform } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

export type CreateUserInput = {
	clerkId: string;
	email: string;
	name?: string;
	avatar?: string;
};

export type UpdateUserInput = {
	email?: string;
	name?: string;
	avatar?: string;
};

export type CreatePlatformProfileInput = {
	userId: string;
	platform: Platform;
	handle?: string;
	headline?: string;
	profileUrl?: string;
};

// =============================================================================
// USER OPERATIONS
// =============================================================================

/**
 * Create a new user (typically called from Clerk webhook)
 */
export async function createUser(data: CreateUserInput) {
	try {
		return await prisma.user.create({
			data: {
				clerkId: data.clerkId,
				email: data.email,
				name: data.name,
				avatar: data.avatar,
			},
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			// P2002: Unique constraint violation
			if (error.code === 'P2002') {
				throw new Error(
					`User with this ${error.meta?.target} already exists`
				);
			}
		}
		throw error;
	}
}

/**
 * Find user by their internal ID
 */
export async function getUserById(id: string) {
	return await prisma.user.findUnique({
		where: { id },
		include: {
			platformProfiles: true,
		},
	});
}

/**
 * Find user by their Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
	return await prisma.user.findUnique({
		where: { clerkId },
		include: {
			platformProfiles: true,
		},
	});
}

/**
 * Find user by email
 */
export async function getUserByEmail(email: string) {
	return await prisma.user.findUnique({
		where: { email },
		include: {
			platformProfiles: true,
		},
	});
}

/**
 * Update user by Clerk ID (used by Clerk webhook)
 */
export async function updateUserByClerkId(
	clerkId: string,
	data: UpdateUserInput
) {
	try {
		return await prisma.user.update({
			where: { clerkId },
			data,
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			// P2025: Record not found
			if (error.code === 'P2025') {
				throw new Error(`User with clerkId ${clerkId} not found`);
			}
		}
		throw error;
	}
}

/**
 * Delete user by Clerk ID (used by Clerk webhook)
 */
export async function deleteUserByClerkId(clerkId: string) {
	try {
		return await prisma.user.delete({
			where: { clerkId },
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				throw new Error(`User with clerkId ${clerkId} not found`);
			}
		}
		throw error;
	}
}

// =============================================================================
// PLATFORM PROFILE OPERATIONS
// =============================================================================

/**
 * Create or update a platform profile for a user
 */
export async function upsertPlatformProfile(data: CreatePlatformProfileInput) {
	return await prisma.platformProfile.upsert({
		where: {
			userId_platform: {
				userId: data.userId,
				platform: data.platform,
			},
		},
		update: {
			handle: data.handle,
			headline: data.headline,
			profileUrl: data.profileUrl,
		},
		create: {
			userId: data.userId,
			platform: data.platform,
			handle: data.handle,
			headline: data.headline,
			profileUrl: data.profileUrl,
		},
	});
}

/**
 * Get all platform profiles for a user
 */
export async function getUserPlatformProfiles(userId: string) {
	return await prisma.platformProfile.findMany({
		where: { userId },
	});
}

/**
 * Delete a platform profile
 */
export async function deletePlatformProfile(
	userId: string,
	platform: Platform
) {
	return await prisma.platformProfile.delete({
		where: {
			userId_platform: {
				userId,
				platform,
			},
		},
	});
}
