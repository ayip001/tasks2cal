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
      Sign in
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
              Timebox quicker on{' '}
              <span className="bg-gradient-to-r from-[#4285f4] to-[#34a853] bg-clip-text text-transparent">
                Google Calendar
              </span>
              {' '}with{' '}
              <span className="bg-gradient-to-r from-[#4285f4] via-[#ea4335] to-[#fbbc05] bg-clip-text text-transparent">
                Google Tasks
              </span>

            </h1>
            
            {/* Sub-headline */}
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              Auto-fit your to-do list into your calendar, <strong>on your terms</strong>. Define rules like &apos;Work tasks&apos; for 9-5 and &apos;Side projects&apos; for evenings, then let us automatically fill the gaps in your schedule.
            </p>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <SignInButton className="text-base px-8 py-6 h-auto" />
              <p className="text-sm text-gray-500 self-center">
                Free forever. No credit card required.
              </p>
            </div>
          </div>
          
          {/* Right: Hero Image */}
          <div className="relative animate-fade-in-delayed">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 bg-white">
              <Image
                src="/tasks2cal-hero.avif"
                alt="On the left, a 'Tasks' sidebar lists development items like 'Fix auth.ts bug' and 'Update dependencies.' A cursor drags one of these tasks across to the 'Calendar' view on the right, hovering over an open time slot that highlights in green with the text 'Drop to timebox,' visually representing the drag-and-drop scheduling feature."
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
              A simple workflow upgrade you didn&apos;t know you needed
            </h2>
          </div>
          
          {/* Drake meme grid */}
          <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            {/* Before: Top row */}
            <div className="bg-white p-0">
              <Image
                src="/drake-top.avif"
                alt="Drake disapproving"
                width={400}
                height={400}
                className="w-full h-auto"
              />
            </div>
            <div className="bg-white p-8 flex flex-col justify-center border-l border-gray-100">
              <h3 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">😤</span> The O(n) way
              </h3>
              <ol className="space-y-2 text-gray-500">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">1</span>
                  <span>Open Google Tasks Sidebar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">2</span>
                  <span>Drag task to calendar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">3</span>
                  <span><em>Realize it overlaps with a meeting</em></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">4</span>
                  <span>Resize the task block</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">5</span>
                  <span>Repeat for 15 other tasks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center font-medium">6</span>
                  <span><em>Give up because playing calendar Tetris is exhausting</em></span>
                </li>
              </ol>
            </div>
            
            {/* After: Bottom row */}
            <div className="bg-white p-0 border-t border-gray-100">
              <Image
                src="/drake-bottom.avif"
                alt="Drake approving"
                width={400}
                height={400}
                className="w-full h-auto"
              />
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white p-8 flex flex-col justify-center border-l border-t border-gray-100">
              <h3 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">😎</span> The O(1) way
              </h3>
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm flex items-center justify-center font-medium">1</span>
                  <span className="font-medium">Open Tasks2Cal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm flex items-center justify-center font-medium">2</span>
                  <span className="font-medium">Press Auto-fit</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm flex items-center justify-center font-medium">3</span>
                  <span className="font-medium">Press Save</span>
                </li>
              </ol>
              <div className="mt-6 pt-4 border-t border-emerald-100">
                <p className="text-sm text-emerald-600 font-medium">
                  👍 Work smarter, not harder
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
      title: 'Drag & Drop',
      description: 'Move tasks onto 15-minute slots on your actual Google Calendar.',
      color: 'from-amber-400 to-orange-500',
    },
    {
      icon: Bot,
      emoji: '🤖',
      title: 'Rule-Based Auto-Fit',
      description: "Don't just fill gaps—control them. Set specific rules to schedule 'Deep Work' in the morning and 'Admin' tasks only after 4 PM. Your schedule, your logic.",
      color: 'from-purple-400 to-indigo-500',
    },
    {
      icon: Save,
      emoji: '💾',
      title: 'Bulk Commit',
      description: 'Plan your entire day locally, then save to Google in one batch.',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      icon: Clock,
      emoji: '⚙️',
      title: 'Respects Your Time',
      description: "Define your own working hours so the bot doesn't schedule deep work at 3 AM (unless you want it to).",
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
            Features that should&apos;ve been there from the start
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
                Why are we here?
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                I built this because I was tired of manually creating calendar events for my daily tasks. In classic software developer fashion, I spent an entire weekend automating a process that takes about 3 minutes a day (and several more days to polish it for public use).
              </p>
            </div>
            
            {/* Right: XKCD */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg p-4 shadow-xl">
                <Image
                  src="https://imgs.xkcd.com/comics/automation.png"
                  alt="XKCD: Automation comic showing the irony of spending time automating tasks"
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
              Privacy First. Open Source. Free Forever.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Privacy First */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Privacy First</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We don&apos;t store your tasks. We use Redis for short-term session caching and everything else stays in your Google account.
              </p>
            </div>
            
            {/* Open Source */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Open Source</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Licensed under GPL-3.0. Read the code, fork it, or host it yourself.
              </p>
              <a
                href="https://github.com/ayip001/tasks2cal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
              >
                View on GitHub
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
      question: 'What is the point of this?',
      answer:
        "Timeboxing is a lot of work and I thought it doesn't have to be. Tasks2Cal is a utility that lets you drag Google Tasks directly into Google Calendar slots to block out time for deep work. It turns a long to-do list into a realistic, executable schedule in seconds (as long as you define your working hours and already use Google Calendar and Tasks).",
    },
    {
      question: 'Is this free?',
      answer:
        "Yes. I built this because I didn't want to pay a monthly subscription for a bloated SaaS tool just to move data between two Google apps. It is a free, open-source productivity tool designed for efficiency, not upselling.",
    },
    {
      question: 'Do you store my data?',
      answer:
        "No, I don't want your data. The app uses a temporary cache (Redis) to make the drag-and-drop scheduling interface snappy, but your tasks and calendar events stay strictly in your Google account. We facilitate the handshake, we don't keep the files.",
    },
    {
      question: 'How does "Auto-fit" work? Is it AI?',
      answer:
        "It's a schedule optimizer that follows your instruction set. You define the slots (e.g., 9am-12pm) and the filters (e.g., 'Work' list only). It iterates through your rules, filling available time with the right tasks while respecting existing meetings. It's like a cron job for your calendar.",
    },
    {
      question: 'Why not just do X/Y on Google Calendar to timebox?',
      answer:
        "Google's sidebar lets you drag tasks one by one, but it doesn't solve the planning puzzle for you. Tasks2Cal automates the 'calendar tetris'—instantly finding the perfect slots for your tasks based on the priorities you define.",
    },
    {
      question: 'I have a feature request / found a bug / want to contribute.',
      answer:
        "Great! This is an open-source project. Please submit an issue or open a pull request on GitHub. Contributions are welcome, whether it's fixing a bug or adding that feature you think this is missing.",
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
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
          Ready to timebox marginally quicker?
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          Join developers and productivity enthusiasts who&apos;ve reclaimed minutes of their scheduling time (and sanity).
        </p>
        <Button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          size="lg"
          className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <GoogleIcon className="mr-2 h-5 w-5" />
          Get Started Free
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
    ? 'An error occurred during sign in. Please try again.'
    : null;

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
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

      <Footer locale="en" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
