'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { setLocaleCookie } from '@/lib/locale';
import type { Locale } from '@/i18n/config';

interface FooterProps {
  locale?: Locale;
}

const translations = {
  en: {
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
  },
  'zh-hk': {
    privacyPolicy: '私隱政策',
    termsOfService: '服務條款',
  },
};

const languageNames: Record<Locale, string> = {
  en: 'English',
  'zh-hk': '繁體中文',
};

export function Footer({ locale = 'en' }: FooterProps) {
  const pathname = usePathname();
  const t = translations[locale];

  // Get the base path for links (with or without /zh-hk prefix)
  const basePath = locale === 'zh-hk' ? '/zh-hk' : '';

  // Determine if we're on a public page (not dashboard/day)
  const isPublicPage = !pathname.startsWith('/dashboard') && !pathname.startsWith('/day/');

  // Get the equivalent path in another locale for public pages
  const getLocalizedPath = (targetLocale: Locale): string => {
    if (!isPublicPage) {
      // For app pages, just return current path (will use cookie)
      return pathname;
    }

    // For public pages, swap the locale prefix
    if (targetLocale === 'zh-hk') {
      // Going to Chinese
      if (pathname.startsWith('/zh-hk')) {
        return pathname; // Already Chinese
      }
      return `/zh-hk${pathname === '/' ? '' : pathname}`;
    } else {
      // Going to English
      if (pathname.startsWith('/zh-hk')) {
        const pathWithoutLocale = pathname.replace('/zh-hk', '') || '/';
        return pathWithoutLocale;
      }
      return pathname; // Already English
    }
  };

  const handleLanguageChange = async (targetLocale: Locale) => {
    // Set the cookie first for immediate effect
    setLocaleCookie(targetLocale);

    // Update Redis settings so useSettings doesn't override the cookie
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: targetLocale }),
      });
    } catch {
      // Continue anyway - cookie is set
    }

    // Navigate to the appropriate page
    const newPath = getLocalizedPath(targetLocale);
    window.location.href = newPath;
  };

  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/ayip001/tasks2cal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <img
              src="https://img.shields.io/github/stars/ayip001/tasks2cal?style=social"
              alt="GitHub Stars"
            />
          </a>
          <a
            href="https://buymeacoffee.com/angusflies"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black"
              alt="Buy Me A Coffee"
            />
          </a>
        </div>

        <div className="flex items-center gap-6">
          <Link href={`${basePath}/privacy`} className="hover:text-foreground transition-colors">
            {t.privacyPolicy}
          </Link>
          <Link href={`${basePath}/terms`} className="hover:text-foreground transition-colors">
            {t.termsOfService}
          </Link>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{languageNames[locale]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleLanguageChange('en')}
                className={locale === 'en' ? 'bg-accent' : ''}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('zh-hk')}
                className={locale === 'zh-hk' ? 'bg-accent' : ''}
              >
                繁體中文
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </footer>
  );
}
