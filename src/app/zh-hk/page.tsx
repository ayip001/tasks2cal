'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/ui/footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertCircle, Zap, Bot, Save, Clock, Lock, Github } from 'lucide-react';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function SignInButton({ size = 'lg', className = '' }: { size?: 'default' | 'lg'; className?: string }) {
  return (
    <Button
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      size={size}
      className={`bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <GoogleIcon className="mr-2 h-5 w-5" />
      登入
    </Button>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(66,133,244,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(52,168,83,0.06)_0%,transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="space-y-8 animate-fade-in">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              更快地使用{' '}
              <span className="bg-gradient-to-r from-[#4285f4] via-[#ea4335] to-[#fbbc05] bg-clip-text text-transparent">
                Google Tasks
              </span>
              {' '}在{' '}
              <span className="bg-gradient-to-r from-[#4285f4] to-[#34a853] bg-clip-text text-transparent">
                Google 行事曆
              </span>
              {' '}上進行時間箱管理{' '}
              
            </h1>

            {/* Sub-headline */}
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              <strong>按你的規則，一鍵將代辦事項填滿行事曆</strong>。設定規則（如：早上只排「工作」，晚上只排「副業」），瞬間將代辦清單變成完美的時間表。
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <SignInButton className="text-base px-8 py-6 h-auto" />
              <p className="text-sm text-gray-500 self-center">
                永久免費，無需信用卡。
              </p>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative animate-fade-in-delayed">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 bg-white">
              <Image
                src="/tasks2cal-hero.avif"
                alt="左側的「任務」側邊欄列出開發項目，如「修復 auth.ts 錯誤」和「更新依賴項」。游標將其中一個任務拖曳到右側的「日曆」視圖，懸停在以綠色標示的空閒時段上，顯示「放下以安排時間」，直觀地展示拖放排程功能。"
                width={800}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>
            {/* Floating decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl opacity-10 blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-10 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              更方便地進行時間箱管理
            </h2>
          </div>

          {/* Drake meme grid */}
          <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            {/* Before: Top row */}
            <div className="bg-white p-0">
              <Image
                src="/drake-top.avif"
                alt="Drake 表示不贊同"
                width={400}
                height={400}
                className="w-full h-auto"
              />
            </div>
            <div className="bg-white p-8 flex flex-col justify-center border-l border-gray-100">
              <h3 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">😤</span> O(n) 的方式
              </h3>
              <ol className="space-y-2 text-gray-500">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">1</span>
                  <span>開啟 Google Tasks 側邊欄</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">2</span>
                  <span>將任務拖到行事曆</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">3</span>
                  <span><em>發現時間與會議衝突</em></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">4</span>
                  <span>手動調整任務長度</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">5</span>
                  <span>重複以上步驟 15 次</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">6</span>
                  <span><em>因為太麻煩而放棄時間箱管理</em></span>
                </li>
              </ol>
            </div>

            {/* After: Bottom row */}
            <div className="bg-white p-0 border-t border-gray-100">
              <Image
                src="/drake-bottom.avif"
                alt="Drake 表示贊同"
                width={400}
                height={400}
                className="w-full h-auto"
              />
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white p-8 flex flex-col justify-center border-l border-t border-gray-100">
              <h3 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">😎</span> O(1) 的方式
              </h3>
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm flex items-center justify-center font-medium">1</span>
                  <span className="font-medium">開啟 Tasks2Cal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm flex items-center justify-center font-medium">2</span>
                  <span className="font-medium">按下自動排程</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm flex items-center justify-center font-medium">3</span>
                  <span className="font-medium">按下儲存</span>
                </li>
              </ol>
              <div className="mt-6 pt-4 border-t border-emerald-100">
                <p className="text-sm text-emerald-600 font-medium">
                  👍 一鍵將代辦事項填入你的工作時間，自動避開現有會議。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGridSection() {
  const features = [
    {
      icon: Zap,
      emoji: '⚡',
      title: '拖放操作',
      description: '將 Google Tasks 的代辦事項拖放到 Google 行事曆上。',
      color: 'from-amber-400 to-orange-500',
    },
    {
      icon: Bot,
      emoji: '🤖',
      title: '規則導向自動排程',
      description: '不只是填滿空檔，而是精準控制。設定早上專注於「深度工作」，下午 4 點後才處理「雜務」。讓排程邏輯完全配合你的工作習慣。',
      color: 'from-purple-400 to-indigo-500',
    },
    {
      icon: Save,
      emoji: '💾',
      title: '批量儲存',
      description: '在 Tasks2Cal 規劃整天行程，然後一次過儲存到 Google 行事曆。',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      icon: Clock,
      emoji: '⚙️',
      title: '尊重你的時間',
      description: '自訂工作時間，並讓自動排程避開行事曆上已安排的會議。',
      color: 'from-emerald-400 to-teal-500',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(66,133,244,0.03)_0%,transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            早該內建的功能
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient accent on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] rounded-2xl transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DevTransparencySection() {
  return (
    <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
      {/* Terminal-style background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            {/* Left: Copy */}
            <div className="md:col-span-3 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                為何要做這個小工具？
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                開發此工具是因為我厭倦了手動為每日為每一項代辦事項建立行事曆事件。既然可以自動化，我便花了整個週末來自動化一個只需 3 分鐘的流程（然後又花了好幾天把它打磨到可以公開使用）🤦‍♀️。
              </p>
            </div>

            {/* Right: XKCD */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg p-4 shadow-xl">
                <Image
                  src="https://imgs.xkcd.com/comics/automation.png"
                  alt="XKCD：自動化漫畫，展示花時間自動化任務的諷刺"
                  width={400}
                  height={300}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
              <a
                href="https://xkcd.com/1319/"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 text-gray-500 text-sm hover:text-gray-300 transition-colors text-center"
              >
                Relevant XKCD →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechnicalProofSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              私隱優先。開源。永久免費。
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Privacy First */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">私隱優先</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                我們不會儲存你的任何資料。我們使用 Redis 進行短期會話緩存，其他所有資料都保留在你的 Google 帳戶中。
              </p>
            </div>

            {/* Open Source */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">開源</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                採用 GPL-3.0 授權。閱讀原始碼、分叉或自行架設。
              </p>
              <a
                href="https://github.com/ayip001/tasks2cal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
              >
                在 GitHub 上查看
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: '這有什麼用？',
      answer:
        '使用 Google 的工具進行時間箱/時間盒管理（Timeboxing）需要花點時間，而我認為過程不應該這麼複雜。Tasks2Cal 是一個工具，讓你可以將 Google Tasks 直接拖放到 Google 行事曆的時段中，為深度工作預留時間。只要你設定好工作時間，並且已經在使用 Google 行事曆和 Tasks，它就能在幾秒內將冗長的待辦清單變成切實可行的時間表。',
    },
    {
      question: '這是免費的嗎？',
      answer:
        '是的。我開發這個是不想因為只為了在兩個 Google 應用程式之間移動資料而付費。這是一個免費、開源的生產力工具，專為效率而設計，而非推銷升級。',
    },
    {
      question: '你們會儲存我的資料嗎？',
      answer:
        '不會。這個應用程式使用臨時緩存（Redis）來讓拖放排程介面更流暢，但你的任務和行事曆事件嚴格保留在你的 Google 帳戶中。此工具只是協助資料傳遞，不會保留檔案。',
    },
    {
      question: '「自動排程」是如何運作的？是 AI 嗎？',
      answer:
        '這是一個遵循你的指令集的排程優化器。你定義時間槽（例如：上午 9 點至 12 點）和篩選條件（例如：只有「工作」清單）。它會遍歷你的規則，在尊重現有會議的同時，用合適的任務填充可用時間。就像是你的行事曆專用 cron job。',
    },
    {
      question: '為什麼不直接在 Google 行事曆上用 X/Y 方法來進行時間箱管理？',
      answer:
        'Google 側邊欄雖然允許你手動拖放任務，但無法自動為你規劃時間。Tasks2Cal 能依據你設定的優先順序，一鍵將任務填入會議之間的空檔，省去手動「玩俄羅斯方塊」安排時間的煩惱。',
    },
    {
      question: '我有功能建議 / 發現了 bug / 想要貢獻。',
      answer:
        '這是一個開源專案，所以請在 GitHub 上提交 issue 或 pull request。歡迎任何貢獻，無論是修復 bug 還是新增你認為缺少的功能。',
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              常見問題
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-xl border border-gray-100 px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          準備好更快地使用 Google 工具進行時間箱管理了嗎？
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          加入其他生產力愛好者，解鎖（稍微）更高效的時間箱排程吧。
        </p>
        <Button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          size="lg"
          className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <GoogleIcon className="mr-2 h-5 w-5" />
          免費開始使用
        </Button>
      </div>
    </section>
  );
}

function LandingContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Compute error from URL params (avoids setState in effect)
  const error = searchParams.get('error')
    ? '登入時發生錯誤，請重試。'
    : null;

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/tasks2cal-logo.svg"
              alt="Tasks2Cal Logo"
              width={48}
              height={24}
              className="h-6 w-12"
            />
            <h1 className="text-xl font-semibold">Tasks2Cal</h1>
          </div>
          <SignInButton size="default" />
        </div>
      </nav>

      {/* Error banner */}
      {error && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-red-50 border-b border-red-200">
          <div className="container mx-auto px-6 py-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main content with padding for fixed nav */}
      <main className="flex-1 pt-16">
        <HeroSection />
        <BeforeAfterSection />
        <FeatureGridSection />
        <DevTransparencySection />
        <TechnicalProofSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer locale="zh-hk" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">載入中...</div>
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
