import Link from 'next/link';
import { Footer } from '@/components/ui/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Tasks2Cal</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl flex-1">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <section className="space-y-4 text-muted-foreground">
          <p>Last Updated: December 26, 2025</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">1. Introduction</h2>
          <p>
            Tasks2Cal ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web application.
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

          <h2 className="text-xl font-semibold text-foreground pt-4">4. Data Security</h2>
          <p>
            We use industry-standard security measures to protect your information. Your authentication tokens are stored securely in an encrypted session. We do not sell or share your personal data with third parties.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="mt-2">
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='30'%3E%3Ctext x='0' y='20' font-family='Arial' font-size='16' fill='%23666'%3Eayip002@gmail.com%3C/text%3E%3C/svg%3E" 
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

