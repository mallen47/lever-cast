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
				} = evt.data;

				const primaryEmail = email_addresses.find(
					(email) => email.id === evt.data.primary_email_address_id
				);

				if (!primaryEmail) {
					console.error('No primary email found for user:', id);
					return new Response('No primary email found', {
						status: 400,
					});
				}

				const name =
					[first_name, last_name].filter(Boolean).join(' ') || null;

				await createUser({
					clerkId: id,
					email: primaryEmail.email_address,
					name: name || undefined,
					avatar: image_url || undefined,
				});

				console.log(`User created: ${id}`);
				break;
			}

			case 'user.updated': {
				const {
					id,
					email_addresses,
					first_name,
					last_name,
					image_url,
				} = evt.data;

				const primaryEmail = email_addresses.find(
					(email) => email.id === evt.data.primary_email_address_id
				);

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
