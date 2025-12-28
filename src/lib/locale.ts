import { defaultLocale, isValidLocale, type Locale } from '@/i18n/config';

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Get the locale from cookie (client-side)
 */
export function getLocaleFromCookieClient(): Locale {
  if (typeof document === 'undefined') return defaultLocale;

  const match = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE_NAME}=([^;]+)`));
  const cookieValue = match?.[2];
  return cookieValue && isValidLocale(cookieValue) ? cookieValue : defaultLocale;
}

/**
 * Set the locale cookie (client-side)
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Get locale from URL path (for static pages)
 */
export function getLocaleFromPath(pathname: string): Locale {
  if (pathname.startsWith('/zh-hk')) {
    return 'zh-hk';
  }
  return defaultLocale;
}
