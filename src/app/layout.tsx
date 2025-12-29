import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/session-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Tasks2Cal - Timebox Google Tasks',
  description: 'The no-nonsense utility for Google Task timeboxing. Drag tasks onto your Google Calendar and fill your day in seconds.',
  icons: {
    icon: '/tasks2cal-favicon.png',
    apple: '/tasks2cal-webclip.png',
  },
  alternates: {
    canonical: 'https://tasks2cal.com',
    languages: {
      en: 'https://tasks2cal.com',
      'zh-HK': 'https://tasks2cal.com/zh-hk',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
