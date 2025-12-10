/**
 * API Authentication Utilities
 *
 * Helper functions for authenticating API requests using Clerk.
 * Bridges Clerk authentication with our database user records.
 */

import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, getUserByEmail, createUser } from '@/lib/services/db';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export interface AuthenticatedUser {
	id: string;
	clerkId: string;
	email: string;
	name: string | null;
	avatar: string | null;
}

export interface AuthResult {
	user: AuthenticatedUser | null;
	error: string | null;
}

/**
 * Get the authenticated user from an API request.
 * Creates the user in the database if they don't exist yet.
 *
 * @returns The authenticated user or null with an error message
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
	try {
		const { userId: clerkId } = await auth();

		if (!clerkId) {
			return { user: null, error: 'Authentication required' };
		}

		// Try to get existing user from database
		let dbUser = await getUserByClerkId(clerkId);

		// If user doesn't exist in DB (webhook hasn't fired yet), create them
		if (!dbUser) {
			console.log(`[Auth] User not found in DB for clerkId: ${clerkId}, attempting to create...`);
			
			const clerkUser = await currentUser();

			if (!clerkUser) {
				console.error('[Auth] Failed to get current user from Clerk');
				return { user: null, error: 'Unable to retrieve user information' };
			}

			const primaryEmail = clerkUser.emailAddresses.find(
				(email) => email.id === clerkUser.primaryEmailAddressId
			);

			if (!primaryEmail) {
				console.error('[Auth] No primary email found for Clerk user:', clerkId);
				return { user: null, error: 'No primary email found for user' };
			}

			const name =
				[clerkUser.firstName, clerkUser.lastName]
					.filter(Boolean)
					.join(' ') || null;

			try {
				dbUser = await createUser({
					clerkId,
					email: primaryEmail.emailAddress,
					name: name || undefined,
					avatar: clerkUser.imageUrl || undefined,
				});
				console.log(`[Auth] Created new user in DB: ${dbUser.id}`);
			} catch (createError) {
				console.error('[Auth] Failed to create user:', createError);
				
				// User might have been created by webhook while we were checking
				dbUser = await getUserByClerkId(clerkId);
				if (!dbUser) {
					// Check if user exists with same email (possible clerkId mismatch from previous account)
					console.log(`[Auth] Checking if user exists by email: ${primaryEmail.emailAddress}`);
					const existingUserByEmail = await getUserByEmail(primaryEmail.emailAddress);
					
					if (existingUserByEmail) {
						console.log(`[Auth] Found existing user by email with different clerkId. Updating clerkId...`);
						// Update the existing user's clerkId to the new one
						try {
							dbUser = await prisma.user.update({
								where: { id: existingUserByEmail.id },
								data: { 
									clerkId,
									name: name || existingUserByEmail.name,
									avatar: clerkUser.imageUrl || existingUserByEmail.avatar,
								},
								include: { platformProfiles: true },
							});
							console.log(`[Auth] Updated user clerkId: ${dbUser.id}`);
						} catch (updateError) {
							console.error('[Auth] Failed to update user clerkId:', updateError);
							return { 
								user: null, 
								error: `Failed to link user account: ${updateError instanceof Error ? updateError.message : 'Unknown error'}` 
							};
						}
					} else {
						console.error(`[Auth] User not found by clerkId or email for clerkId: ${clerkId}`);
						return { 
							user: null, 
							error: `Failed to create user record: ${createError instanceof Error ? createError.message : 'Unknown error'}` 
						};
					}
				} else {
					console.log(`[Auth] Found user after race condition: ${dbUser.id}`);
				}
			}
		}

		return {
			user: {
				id: dbUser.id,
				clerkId: dbUser.clerkId,
				email: dbUser.email,
				name: dbUser.name,
				avatar: dbUser.avatar,
			},
			error: null,
		};
	} catch (error) {
		console.error('[Auth] Unexpected error in getAuthenticatedUser:', error);
		return { 
			user: null, 
			error: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}` 
		};
	}
}

/**
 * Require authentication for an API route.
 * Throws an error if the user is not authenticated.
 *
 * @returns The authenticated user
 * @throws Error if not authenticated
 */
export async function requireApiAuth(): Promise<AuthenticatedUser> {
	const { user, error } = await getAuthenticatedUser();

	if (!user) {
		throw new Error(error || 'Authentication required');
	}

	return user;
}

