import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { NotificationProvider } from '@/components/NotificationProvider';
import { FirebaseProvider } from '@/components/FirebaseProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StatLearn - Smart Travel Experience Insights',
  description: 'Real-time intelligent travel insights platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${manrope.variable}`}>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <ErrorBoundary>
          <FirebaseProvider>
            <NotificationProvider>
              <Navigation />
              <div className="flex-grow flex flex-col pt-20">
                {children}
              </div>
              <Footer />
            </NotificationProvider>
          </FirebaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
