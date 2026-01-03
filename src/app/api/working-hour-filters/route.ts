import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getWorkingHourFilters, setWorkingHourFilters } from '@/lib/kv';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  getRetryAfterSeconds,
} from '@/lib/rate-limit';
import { validate, WorkingHourFiltersDataSchema } from '@/lib/validation';

// GET - Fetch working hour filters with timestamp
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
    const filtersData = await getWorkingHourFilters(session.user.email);
    return NextResponse.json(filtersData, {
      headers: createRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error fetching working hour filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch working hour filters' },
      {
        status: 500,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }
}

// PUT - Update working hour filters (full replace with timestamp)
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
    const validationResult = validate(WorkingHourFiltersDataSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        {
          status: 400,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    await setWorkingHourFilters(session.user.email, validationResult.data);
    return NextResponse.json({ success: true }, {
      headers: createRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error updating working hour filters:', error);
    return NextResponse.json(
      { error: 'Failed to update working hour filters' },
      {
        status: 500,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }
}
