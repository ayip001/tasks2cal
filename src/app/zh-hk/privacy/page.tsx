import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/ui/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '私隱政策 - Tasks2Cal',
  description: 'Tasks2Cal 私隱政策 - 了解我們如何收集、使用及保護您的資料。',
  alternates: {
    canonical: 'https://tasks2cal.com/zh-hk/privacy',
    languages: {
      en: 'https://tasks2cal.com/privacy',
      'zh-HK': 'https://tasks2cal.com/zh-hk/privacy',
    },
  },
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-6">私隱政策</h1>

        <section className="space-y-4 text-muted-foreground">
          <p>最後更新日期：2025 年 12 月 26 日</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">1. 簡介</h2>
          <p>
            Tasks2Cal（「我們」）致力於保護您的私隱。本私隱政策說明當您使用我們的網絡應用程式時，我們如何收集、使用及保護您的資料。
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">2. 我們存取的資料</h2>
          <p>
            Tasks2Cal 是一個工具，協助您將 Google Tasks 安排到 Google 日曆中。為提供此服務，我們會請求存取：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>您的 Google 日曆事件（用於顯示您目前的行程並新增任務作為事件）。</li>
            <li>您的 Google Tasks（用於顯示您的任務清單以便安排）。</li>
          </ul>
          <p>
            我們透過 Google OAuth 存取這些資料。我們不會將您的任務或日曆事件儲存在我們的永久伺服器上。資料會即時處理，或在您的會話期間暫時緩存於瀏覽器及安全的會話存儲（Redis）中。
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. 我們如何使用資料</h2>
          <p>
            我們僅將從您的 Google 帳戶存取的資料用於：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>在我們的介面中顯示您的任務和日曆事件。</li>
            <li>讓您將任務拖放到日曆上。</li>
            <li>自動為您的任務尋找可用的時段。</li>
            <li>將已安排的任務作為新事件提交回您的 Google 日曆。</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">4. 資料安全</h2>
          <p>
            我們採用業界標準的安全措施來保護您的資料。您的驗證權杖會安全地儲存在加密的會話中。我們不會向第三方出售或分享您的個人資料。
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. 聯絡我們</h2>
          <p>
            如您對本私隱政策有任何疑問，請透過以下方式聯絡我們：
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
