import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserSettings, setUserSettings } from '@/lib/kv';
import { UserSettings } from '@/types';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  getRetryAfterSeconds,
} from '@/lib/rate-limit';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const identifier = getClientIdentifier(request, session.user.email);
  const rateLimitResult = await checkRateLimit(identifier, 'read');

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          'Retry-After': getRetryAfterSeconds(rateLimitResult).toString(),
        },
      }
    );
  }

  try {
    const settings = await getUserSettings(session.user.email);
    return NextResponse.json(settings, {
      headers: createRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      {
        status: 500,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting (write operations are more restricted)
  const identifier = getClientIdentifier(request, session.user.email);
  const rateLimitResult = await checkRateLimit(identifier, 'write');

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          'Retry-After': getRetryAfterSeconds(rateLimitResult).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const updates = body as Partial<UserSettings>;

    const settings = await setUserSettings(session.user.email, updates);
    return NextResponse.json(settings, {
      headers: createRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      {
        status: 500,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }
}
