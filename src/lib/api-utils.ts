/**
 * API route utilities
 *
 * Provides wrappers and utilities for API routes to reduce boilerplate
 * for authentication and rate limiting.
 */

import { NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { auth } from '@/lib/auth';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  getRetryAfterSeconds,
  RateLimitResult,
} from '@/lib/rate-limit';
import { RateLimitType } from '@/lib/constants';

/**
 * Extended session type that includes accessToken
 */
interface ExtendedSession extends Session {
  accessToken?: string;
}

/**
 * Context provided to API handlers
 */
export interface ApiContext {
  session: ExtendedSession;
  rateLimitResult: RateLimitResult;
}

/**
 * API handler function type
 */
type ApiHandler = (
  request: Request,
  context: ApiContext
) => Promise<Response>;

/**
 * Options for withAuth wrapper
 */
interface WithAuthOptions {
  /** Rate limit type to apply (default: 'read') */
  limitType?: RateLimitType;
  /** Whether to require accessToken (for Google API calls) */
  requireAccessToken?: boolean;
}

/**
 * Add rate limit headers to a Response
 */
export function addRateLimitHeaders(
  response: Response,
  rateLimitResult: RateLimitResult
): Response {
  const headers = new Headers(response.headers);
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Create an unauthorized response
 */
function createUnauthorizedResponse(): Response {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/**
 * Create a rate limit exceeded response
 */
function createRateLimitResponse(rateLimitResult: RateLimitResult): Response {
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

/**
 * Wrapper for API route handlers that handles authentication and rate limiting
 *
 * @param handler - The API handler function
 * @param options - Configuration options
 * @returns Wrapped handler function
 *
 * @example
 * ```ts
 * export const GET = withAuth(async (request, { session, rateLimitResult }) => {
 *   const data = await getData(session.user.email);
 *   return NextResponse.json(data);
 * });
 *
 * export const POST = withAuth(
 *   async (request, { session }) => {
 *     const body = await request.json();
 *     await saveData(session.user.email, body);
 *     return NextResponse.json({ success: true });
 *   },
 *   { limitType: 'write' }
 * );
 * ```
 */
export function withAuth(
  handler: ApiHandler,
  options: WithAuthOptions = {}
): (request: Request) => Promise<Response> {
  const { limitType = 'read', requireAccessToken = false } = options;

  return async (request: Request): Promise<Response> => {
    // Authenticate
    const session = (await auth()) as ExtendedSession | null;

    // Check basic auth
    if (!session?.user?.email) {
      return createUnauthorizedResponse();
    }

    // Check accessToken if required
    if (requireAccessToken && !session.accessToken) {
      return createUnauthorizedResponse();
    }

    // Rate limiting
    const identifier = getClientIdentifier(request, session.user.email);
    const rateLimitResult = await checkRateLimit(identifier, limitType);

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Call the handler
    try {
      const response = await handler(request, { session, rateLimitResult });
      return addRateLimitHeaders(response, rateLimitResult);
    } catch (error) {
      console.error('API handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        {
          status: 500,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }
  };
}
