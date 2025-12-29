'use client';

import { useMemo } from 'react';
import type { Locale } from '@/i18n/config';
import enMessages from '@/i18n/messages/en.json';
import zhHkMessages from '@/i18n/messages/zh-hk.json';
import { enUS, zhTW } from 'date-fns/locale';
import type { Locale as DateFnsLocale } from 'date-fns';

type Messages = typeof enMessages;
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? (T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K) : never }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<Messages>;

const messages: Record<Locale, Messages> = {
  en: enMessages,
  'zh-hk': zhHkMessages,
};

/**
 * Get a nested value from an object using a dot-separated path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // Return the key if not found
    }
  }

  return typeof result === 'string' ? result : path;
}

/**
 * Replace placeholders in a translation string
 * e.g., "Hello {name}" with { name: "World" } becomes "Hello World"
 */
function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return key in values ? String(values[key]) : `{${key}}`;
  });
}

export function useTranslations(locale: Locale) {
  const t = useMemo(() => {
    const localeMessages = messages[locale] || messages.en;

    return function translate(
      key: TranslationKey | string,
      values?: Record<string, string | number>
    ): string {
      const translation = getNestedValue(localeMessages as unknown as Record<string, unknown>, key);
      return values ? interpolate(translation, values) : translation;
    };
  }, [locale]);

  return t;
}

/**
 * Get the date locale string for Intl APIs
 */
export function getDateLocale(locale: Locale): string {
  switch (locale) {
    case 'zh-hk':
      return 'zh-HK';
    default:
      return 'en-US';
  }
}

/**
 * Get the date-fns locale object for react-day-picker
 */
export function getDateFnsLocale(locale: Locale): DateFnsLocale {
  switch (locale) {
    case 'zh-hk':
      return zhTW; // Use Traditional Chinese (Taiwan) as closest to HK
    default:
      return enUS;
  }
}

/**
 * Get the FullCalendar locale code
 */
export function getFullCalendarLocale(locale: Locale): string {
  switch (locale) {
    case 'zh-hk':
      return 'zh-tw'; // Traditional Chinese
    default:
      return 'en';
  }
}
