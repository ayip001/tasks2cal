import { NextResponse } from 'next/server';
import { getWorkingHourFilters, setWorkingHourFilters } from '@/lib/kv';
import { validate, WorkingHourFiltersDataSchema } from '@/lib/validation';
import { withAuth } from '@/lib/api-utils';
import { createRateLimitHeaders } from '@/lib/rate-limit';

export const GET = withAuth(async (request, { session }) => {
  try {
    const filtersData = await getWorkingHourFilters(session.user!.email!);
    return NextResponse.json(filtersData);
  } catch (error) {
    console.error('Error fetching working hour filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch working hour filters' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(
  async (request, { session, rateLimitResult }) => {
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

      await setWorkingHourFilters(session.user!.email!, validationResult.data);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating working hour filters:', error);
      return NextResponse.json(
        { error: 'Failed to update working hour filters' },
        { status: 500 }
      );
    }
  },
  { limitType: 'write' }
);
