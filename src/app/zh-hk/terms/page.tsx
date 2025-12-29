import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/ui/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '服務條款 - Tasks2Cal',
  description: 'Tasks2Cal 服務條款 - 使用本應用程式的條款及細則。',
  alternates: {
    canonical: 'https://tasks2cal.com/zh-hk/terms',
    languages: {
      en: 'https://tasks2cal.com/terms',
      'zh-HK': 'https://tasks2cal.com/zh-hk/terms',
    },
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/zh-hk" className="flex items-center gap-2">
            <Image
              src="/tasks2cal-logo.svg"
              alt="Tasks2Cal Logo"
              width={48}
              height={24}
              className="h-6 w-12"
            />
            <h1 className="text-xl font-semibold">Tasks2Cal</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl flex-1">
        <h1 className="text-3xl font-bold mb-6">服務條款</h1>

        <section className="space-y-4 text-muted-foreground">
          <p>最後更新日期：2025 年 12 月 26 日</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">1. 條款接受</h2>
          <p>
            存取或使用 Tasks2Cal 即表示您同意受本服務條款約束。如您不同意這些條款，請勿使用本應用程式。
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">2. 服務描述</h2>
          <p>
            Tasks2Cal 是一個生產力工具，旨在透過拖放介面和自動排程邏輯，協助用戶將 Google Tasks 與 Google 日曆同步。
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. 用戶責任</h2>
          <p>
            您有責任維護您的 Google 帳戶安全，並對使用 Tasks2Cal 期間在您帳戶下發生的所有活動負責。您同意不會將本服務用於任何非法或未經授權的目的。
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">4. 責任限制</h2>
          <p>
            Tasks2Cal 按「現狀」和「可用」基礎提供，不作任何保證。我們對因使用或無法使用本服務而導致的任何直接、間接、附帶、特殊或後果性損害不承擔責任，包括但不限於資料遺失或排程錯誤。
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. 服務修改</h2>
          <p>
            我們保留隨時修改或中止服務（暫時或永久）的權利，恕不另行通知。
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">6. 聯絡資料</h2>
          <p>
            如對本條款有任何疑問，請透過以下方式聯絡我們：
          </p>
          <div className="mt-2">
            <img
              src="/contact-email.png"
              alt="聯絡電郵"
              className="h-6 w-auto"
            />
          </div>
        </section>
      </main>

      <Footer locale="zh-hk" />
    </div>
  );
}
