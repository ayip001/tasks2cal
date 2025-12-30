import { defaultLocale, isValidLocale, type Locale } from '@/i18n/config';

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year
export const LOCALE_STORAGE_KEY = 'user-locale';

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
 * Get the locale from localStorage (client-side, synchronous)
 * This is used to avoid flash of wrong language on page load
 */
export function getLocaleFromStorage(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  try {
    const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedLocale && isValidLocale(storedLocale)) {
      return storedLocale;
    }
  } catch {
    // localStorage might be unavailable
  }
  return defaultLocale;
}

/**
 * Set the locale in localStorage (client-side)
 */
export function setLocaleStorage(locale: Locale): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // localStorage might be unavailable
  }
}

/**
 * Set the locale cookie (client-side)
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  // Also store in localStorage for instant access on page load
  setLocaleStorage(locale);
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
