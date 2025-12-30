import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCalendars, getEventsForDay, getEventsForMonth, createCalendarEvents } from '@/lib/google/calendar';
import { getUserSettings } from '@/lib/kv';
import { normalizeIanaTimeZone } from '@/lib/timezone';
import { TaskPlacement } from '@/types';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  getRetryAfterSeconds,
} from '@/lib/rate-limit';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.accessToken || !session?.user?.email) {
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

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const date = searchParams.get('date');
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const calendarId = searchParams.get('calendarId') || 'primary';
  const requestedTimeZone = searchParams.get('timeZone');

  try {
    const settings = await getUserSettings(session.user.email);
    const effectiveTimeZone = normalizeIanaTimeZone(settings.timezone ?? requestedTimeZone ?? 'UTC');

    if (type === 'calendars') {
      const calendars = await getCalendars(session.accessToken);
      return NextResponse.json(calendars, {
        headers: createRateLimitHeaders(rateLimitResult),
      });
    }

    // Month-based events fetching
    if (type === 'events' && year && month) {
      const events = await getEventsForMonth(
        session.accessToken,
        calendarId,
        parseInt(year, 10),
        parseInt(month, 10),
        effectiveTimeZone
      );
      return NextResponse.json({ events }, {
        headers: createRateLimitHeaders(rateLimitResult),
      });
    }

    // Day-based events fetching (legacy, still used by day view)
    if (type === 'events' && date) {
      const events = await getEventsForDay(session.accessToken, calendarId, date, effectiveTimeZone);
      return NextResponse.json(events, {
        headers: createRateLimitHeaders(rateLimitResult),
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, {
      status: 400,
      headers: createRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      {
        status: 500,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting (write operations are more restricted)
  const identifier = getClientIdentifier(request, session.user?.email ?? undefined);
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
    const { calendarId, placements, taskColor, listColors } = body as {
      calendarId: string;
      placements: TaskPlacement[];
      taskColor: string;
      listColors?: Record<string, string>;
    };

    if (!calendarId || !placements || !Array.isArray(placements) || !taskColor) {
      return NextResponse.json({ error: 'Invalid request body' }, {
        status: 400,
        headers: createRateLimitHeaders(rateLimitResult),
      });
    }

    const result = await createCalendarEvents(session.accessToken, calendarId, placements, taskColor, listColors);

    return NextResponse.json({
      success: true,
      savedCount: result.success.length,
      events: result.success,
      errors: result.errors,
    }, {
      headers: createRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error creating calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar events' },
      {
        status: 500,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }
}
