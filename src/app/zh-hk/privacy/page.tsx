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
          <p>最後更新日期：2026 年 1 月 5 日</p>

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

          <h2 className="text-xl font-semibold text-foreground pt-4">4. 資料保留</h2>
          <p>
            我們僅在提供服務所需的最短時間內保留 Google 用戶資料：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>會話資料：</strong>您的驗證會話會持續至您登出或撤銷存取權為止。我們使用 OAuth 更新權杖來安全地維持您的會話。</li>
            <li><strong>緩存資料：</strong>任務和日曆資料會在您的瀏覽器本地緩存最多 15 分鐘，以提升效能。此緩存會在過期或您登出時自動清除。</li>
            <li><strong>用戶偏好設定：</strong>您配置的設定（如預設任務時長、工作時間和日曆偏好）會安全儲存，並保留至您刪除帳戶或請求刪除為止。</li>
            <li><strong>不永久儲存 Google 內容：</strong>我們不會在伺服器上永久儲存您的 Google Tasks 內容或 Google 日曆事件。這些資料會在您使用應用程式時即時從 Google API 獲取。</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. 資料刪除</h2>
          <p>
            您可以隨時通過以下方式刪除您的資料：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>登出：</strong>登出 Tasks2Cal 將立即使您的會話失效並清除緩存資料。</li>
            <li><strong>撤銷存取權：</strong>您可以隨時通過您的 <a href="https://myaccount.google.com/permissions" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google 帳戶權限頁面</a> 撤銷 Tasks2Cal 對您 Google 帳戶的存取權。這將阻止 Tasks2Cal 存取您的資料。</li>
            <li><strong>請求刪除：</strong>如需請求完全刪除與您帳戶相關的所有資料（包括已儲存的偏好設定），請使用下方電郵聯絡我們。我們將在 30 天內處理您的請求。</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">6. 資料安全</h2>
          <p>
            我們採用業界標準的安全措施來保護您的資料。您的驗證權杖會安全地儲存在加密的會話中。我們不會向第三方出售或分享您的個人資料。
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">7. 聯絡我們</h2>
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
