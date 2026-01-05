import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/ui/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Tasks2Cal',
  description: 'Tasks2Cal Privacy Policy - Learn how we collect, use, and protect your information.',
  alternates: {
    canonical: 'https://tasks2cal.com/privacy',
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
          <Link href="/" className="flex items-center gap-2">
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
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <section className="space-y-4 text-muted-foreground">
          <p>Last Updated: January 5, 2026</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">1. Introduction</h2>
          <p>
            Tasks2Cal (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web application.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">2. Information We Access</h2>
          <p>
            Tasks2Cal is a utility that helps you schedule your Google Tasks into your Google Calendar. To provide this service, we request access to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your Google Calendar events (to show your current schedule and add new tasks as events).</li>
            <li>Your Google Tasks (to show your task list so you can schedule them).</li>
          </ul>
          <p>
            We access this data through Google OAuth. We do not store your tasks or calendar events on our permanent servers. Data is processed in real-time or cached temporarily in your browser and a secure session store (Redis) for the duration of your session.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. How We Use Information</h2>
          <p>
            We use the data accessed from your Google account solely to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Display your tasks and calendar events in our interface.</li>
            <li>Allow you to drag and drop tasks onto your calendar.</li>
            <li>Automatically find available time slots for your tasks.</li>
            <li>Commit the scheduled tasks back to your Google Calendar as new events.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">4. Data Retention</h2>
          <p>
            We retain Google user data only for the minimum time necessary to provide our service:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Session data:</strong> Your authentication session persists until you sign out or revoke access. We use OAuth refresh tokens to maintain your session securely.</li>
            <li><strong>Cached data:</strong> Task and calendar data is cached locally in your browser for up to 15 minutes to improve performance. This cache is automatically cleared when it expires or when you sign out.</li>
            <li><strong>User preferences:</strong> Settings you configure (such as default task duration, working hours, and calendar preferences) are stored securely and retained until you delete your account or request deletion.</li>
            <li><strong>No permanent storage of Google content:</strong> We do not permanently store your Google Tasks content or Google Calendar events on our servers. This data is fetched in real-time from Google&apos;s APIs when you use the application.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. Data Deletion</h2>
          <p>
            You can delete your data at any time through the following methods:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Sign out:</strong> Signing out of Tasks2Cal will immediately invalidate your session and clear cached data.</li>
            <li><strong>Revoke access:</strong> You can revoke Tasks2Cal&apos;s access to your Google account at any time through your <a href="https://myaccount.google.com/permissions" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Account permissions page</a>. This will prevent Tasks2Cal from accessing your data.</li>
            <li><strong>Request deletion:</strong> To request complete deletion of all data associated with your account (including stored preferences), please contact us using the email below. We will process your request within 30 days.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">6. Data Security</h2>
          <p>
            We use industry-standard security measures to protect your information. Your authentication tokens are stored securely in an encrypted session. We do not sell or share your personal data with third parties.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="mt-2">
            <img 
              src="/contact-email.png" 
              alt="Contact Email"
              className="h-6 w-auto"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

