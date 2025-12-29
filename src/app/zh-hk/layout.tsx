import type { Metadata } from 'next';
import { LangWrapper } from '@/components/lang-wrapper';

export const metadata: Metadata = {
  title: 'Tasks2Cal - 在 Google 日曆上進行時間盒管理',
  description: '完全免費的時間盒工具。將 Google Tasks 直接拖放到日曆上，數秒內安排好整天的工作。',
  icons: {
    icon: '/tasks2cal-favicon.png',
    apple: '/tasks2cal-webclip.png',
  },
  alternates: {
    canonical: 'https://tasks2cal.com/zh-hk',
    languages: {
      en: 'https://tasks2cal.com',
      'zh-HK': 'https://tasks2cal.com/zh-hk',
    },
  },
};

export default function ZhHkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LangWrapper lang="zh-HK">{children}</LangWrapper>;
}
