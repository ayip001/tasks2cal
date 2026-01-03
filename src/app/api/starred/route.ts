import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStarredTasks, setStarredTasks } from '@/lib/kv';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  getRetryAfterSeconds,
} from '@/lib/rate-limit';
import { validate, StarredTasksDataSchema } from '@/lib/validation';

// GET - Fetch starred data with timestamp
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
    const starredData = await getStarredTasks(session.user.email);
    return NextResponse.json(starredData, {
      headers: createRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error fetching starred tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch starred tasks' },
      {
        status: 500,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }
}

// PUT - Update starred data (full replace with timestamp)
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

    // Validate input with Zod schema (includes size limits)
    const validationResult = validate(StarredTasksDataSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        {
          status: 400,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    await setStarredTasks(session.user.email, validationResult.data);
    return NextResponse.json({ success: true }, {
      headers: createRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error updating starred tasks:', error);
    return NextResponse.json(
      { error: 'Failed to update starred tasks' },
      {
        status: 500,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }
}
