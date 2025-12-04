/**
 * Auth Utilities
 *
 * Helper functions for authentication and getting the current user from the database.
 * Bridges Clerk authentication with our database user records.
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId, createUser } from '@/lib/services/db';

/**
 * Get the current authenticated user from the database.
 * If the user doesn't exist in the database yet, creates them.
 *
 * Use this in Server Components and Server Actions to get the database user.
 *
 * @returns The database user or null if not authenticated
 */
export async function getCurrentUser() {
	const { userId } = await auth();

	if (!userId) {
		return null;
	}

	// Try to get existing user from database
	let dbUser = await getUserByClerkId(userId);

	// If user doesn't exist in DB (webhook hasn't fired yet), create them
	if (!dbUser) {
		const clerkUser = await currentUser();

		if (!clerkUser) {
			return null;
		}

		const primaryEmail = clerkUser.emailAddresses.find(
			(email) => email.id === clerkUser.primaryEmailAddressId
		);

		if (!primaryEmail) {
			console.error('No primary email found for Clerk user:', userId);
			return null;
		}

		const name =
			[clerkUser.firstName, clerkUser.lastName]
				.filter(Boolean)
				.join(' ') || null;

		try {
			dbUser = await createUser({
				clerkId: userId,
				email: primaryEmail.emailAddress,
				name: name || undefined,
				avatar: clerkUser.imageUrl || undefined,
			});
		} catch (error) {
			// User might have been created by webhook while we were checking
			dbUser = await getUserByClerkId(userId);
			if (!dbUser) {
				throw error;
			}
		}
	}

	return dbUser;
}

/**
 * Require authentication - throws if not authenticated.
 * Use this when you need to ensure a user is logged in.
 *
 * @returns The database user
 * @throws Error if not authenticated
 */
export async function requireAuth() {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('Authentication required');
	}

	return user;
}

/**
 * Get the current user's ID from Clerk (without database lookup).
 * Use this when you only need the Clerk user ID for quick checks.
 *
 * @returns The Clerk user ID or null
 */
export async function getClerkUserId() {
	const { userId } = await auth();
	return userId;
}
