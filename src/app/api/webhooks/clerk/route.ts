/**
 * Clerk Webhook Handler
 *
 * Syncs Clerk user events with the database through Prisma.
 *
 * Supported events:
 * - user.created: Creates a new user in the database
 * - user.updated: Updates user information
 * - user.deleted: Removes user from the database
 *
 * @see https://clerk.com/docs/integrations/webhooks/sync-data
 */

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import {
	createUser,
	updateUserByClerkId,
	deleteUserByClerkId,
} from '@/lib/services/db';

export async function POST(req: Request) {
	const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
		return new Response('Webhook secret not configured', { status: 500 });
	}

	// Get the headers
	const headerPayload = await headers();
	const svix_id = headerPayload.get('svix-id');
	const svix_timestamp = headerPayload.get('svix-timestamp');
	const svix_signature = headerPayload.get('svix-signature');

	// Verify required headers are present
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response('Missing svix headers', { status: 400 });
	}

	// Get the body
	const payload = await req.json();
	const body = JSON.stringify(payload);

	// Create Svix instance with secret
	const wh = new Webhook(WEBHOOK_SECRET);

	let evt: WebhookEvent;

	// Verify the payload
	try {
		evt = wh.verify(body, {
			'svix-id': svix_id,
			'svix-timestamp': svix_timestamp,
			'svix-signature': svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error('Webhook verification failed:', err);
		return new Response('Webhook verification failed', { status: 400 });
	}

	// Handle the webhook event
	const eventType = evt.type;

	try {
		switch (eventType) {
			case 'user.created': {
				const {
					id,
					email_addresses,
					first_name,
					last_name,
					image_url,
					primary_email_address_id,
				} = evt.data;

				// Find primary email, or fall back to first email address
				let primaryEmail = email_addresses.find(
					(email) => email.id === primary_email_address_id
				);

				// Fallback: use the first email if no primary is set (common in test events)
				if (!primaryEmail && email_addresses.length > 0) {
					primaryEmail = email_addresses[0];
					console.log(
						`Using fallback email for user ${id}: ${primaryEmail.email_address}`
					);
				}

				if (!primaryEmail) {
					// Test events from Clerk don't include email data - acknowledge and skip
					console.log(
						`[Webhook] Test event detected - no email for user: ${id}. Skipping.`
					);
					return new Response(
						'Test event acknowledged (no email data)',
						{
							status: 200,
						}
					);
				}

				const name =
					[first_name, last_name].filter(Boolean).join(' ') || null;

				await createUser({
					clerkId: id,
					email: primaryEmail.email_address,
					name: name || undefined,
					avatar: image_url || undefined,
				});

				console.log(
					`User created: ${id} with email: ${primaryEmail.email_address}`
				);
				break;
			}

			case 'user.updated': {
				const {
					id,
					email_addresses,
					first_name,
					last_name,
					image_url,
					primary_email_address_id,
				} = evt.data;

				// Find primary email, or fall back to first email address
				let primaryEmail = email_addresses.find(
					(email) => email.id === primary_email_address_id
				);

				if (!primaryEmail && email_addresses.length > 0) {
					primaryEmail = email_addresses[0];
				}

				const name =
					[first_name, last_name].filter(Boolean).join(' ') || null;

				await updateUserByClerkId(id, {
					email: primaryEmail?.email_address,
					name: name || undefined,
					avatar: image_url || undefined,
				});

				console.log(`User updated: ${id}`);
				break;
			}

			case 'user.deleted': {
				const { id } = evt.data;

				if (id) {
					await deleteUserByClerkId(id);
					console.log(`User deleted: ${id}`);
				}
				break;
			}

			default:
				console.log(`Unhandled webhook event: ${eventType}`);
		}

		return new Response('Webhook processed', { status: 200 });
	} catch (error) {
		console.error(`Error processing webhook ${eventType}:`, error);
		return new Response('Error processing webhook', { status: 500 });
	}
}
