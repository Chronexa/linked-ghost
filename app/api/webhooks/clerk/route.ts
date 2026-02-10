/**
 * Clerk Webhook Handler
 * POST /api/webhooks/clerk - Handle Clerk user events
 * Syncs user data from Clerk to our database
 */

import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errors, responses } from '@/lib/api/response';

/**
 * POST /api/webhooks/clerk
 * Handle Clerk webhook events
 */
export async function POST(req: NextRequest) {
  try {
    // Get webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not set');
      return errors.internal('Webhook configuration error');
    }

    // Get headers
    const headerPayload = headers();
    const svixId = headerPayload.get('svix-id');
    const svixTimestamp = headerPayload.get('svix-timestamp');
    const svixSignature = headerPayload.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return errors.badRequest('Missing webhook headers');
    }

    // Get body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return errors.unauthorized('Invalid webhook signature');
    }

    // Handle different event types
    const eventType = evt.type;

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt);
        break;

      case 'user.updated':
        await handleUserUpdated(evt);
        break;

      case 'user.deleted':
        await handleUserDeleted(evt);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return responses.ok({ received: true, eventType });
  } catch (error) {
    console.error('Webhook error:', error);
    return errors.internal('Webhook processing failed');
  }
}

/**
 * Handle user.created event
 */
async function handleUserCreated(evt: WebhookEvent) {
  if (evt.type !== 'user.created') return;

  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  // Create user in database
  const [newUser] = await db
    .insert(users)
    .values({
      id,
      email: email_addresses[0]?.email_address || '',
      fullName: `${first_name || ''} ${last_name || ''}`.trim() || null,
      avatarUrl: image_url || null,
      status: 'active',
    })
    .returning();

  // Create profile for user
  await db.insert(profiles).values({
    userId: newUser.id,
  });

  console.log('User created:', newUser.id);
}

/**
 * Handle user.updated event
 */
async function handleUserUpdated(evt: WebhookEvent) {
  if (evt.type !== 'user.updated') return;

  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  // Update user in database
  await db
    .update(users)
    .set({
      email: email_addresses[0]?.email_address || '',
      fullName: `${first_name || ''} ${last_name || ''}`.trim() || null,
      avatarUrl: image_url || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));

  console.log('User updated:', id);
}

/**
 * Handle user.deleted event
 */
async function handleUserDeleted(evt: WebhookEvent) {
  if (evt.type !== 'user.deleted') return;

  const { id } = evt.data;

  // Delete user (cascade will handle related records)
  await db.delete(users).where(eq(users.id, id as string));

  console.log('User deleted:', id);
}
