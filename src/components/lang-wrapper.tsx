'use client';

import { useEffect } from 'react';

interface LangWrapperProps {
  lang: string;
  children: React.ReactNode;
}

export function LangWrapper({ lang, children }: LangWrapperProps) {
  useEffect(() => {
    // Set the document's lang attribute
    document.documentElement.lang = lang;

    // Cleanup: restore to English when unmounting
    return () => {
      document.documentElement.lang = 'en';
    };
  }, [lang]);

  return <>{children}</>;
}
