import { NextResponse } from 'next/server';
import { getStarredTasks, setStarredTasks } from '@/lib/kv';
import { validate, StarredTasksDataSchema } from '@/lib/validation';
import { withAuth } from '@/lib/api-utils';
import { createRateLimitHeaders } from '@/lib/rate-limit';

export const GET = withAuth(async (request, { session }) => {
  try {
    const starredData = await getStarredTasks(session.user!.email!);
    return NextResponse.json(starredData);
  } catch (error) {
    console.error('Error fetching starred tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch starred tasks' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(
  async (request, { session, rateLimitResult }) => {
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

      await setStarredTasks(session.user!.email!, validationResult.data);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating starred tasks:', error);
      return NextResponse.json(
        { error: 'Failed to update starred tasks' },
        { status: 500 }
      );
    }
  },
  { limitType: 'write' }
);
