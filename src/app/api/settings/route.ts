import { NextResponse } from 'next/server';
import { getUserSettings, setUserSettings } from '@/lib/kv';
import { validate, UserSettingsUpdateSchema } from '@/lib/validation';
import { withAuth } from '@/lib/api-utils';
import { createRateLimitHeaders } from '@/lib/rate-limit';

export const GET = withAuth(async (_request, { session }) => {
  try {
    const settings = await getUserSettings(session.user!.email!);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(
  async (request, { session, rateLimitResult }) => {
    try {
      const body = await request.json();

      // Validate input with Zod schema
      const validationResult = validate(UserSettingsUpdateSchema, body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: validationResult.error },
          {
            status: 400,
            headers: createRateLimitHeaders(rateLimitResult),
          }
        );
      }

      const settings = await setUserSettings(session.user!.email!, validationResult.data);
      return NextResponse.json(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }
  },
  { limitType: 'write' }
);
