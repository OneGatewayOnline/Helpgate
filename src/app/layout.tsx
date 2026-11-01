import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://helpgate.in'),
  title: {
    default: 'HelpGate — Free Technology. For Everyone.',
    template: '%s | HelpGate',
  },
  description: 'Globally accessible, 100% free digital tools, document utilities, developer formatters, and business calculators. Powered by client-first in-browser processing with zero file uploads.',
  keywords: [
    'free online tools',
    'free pdf merger',
    'json formatter',
    'gst calculator india',
    'invoice generator',
    'private developer tools',
    'client side tools',
    'One Gateway Online',
    'HelpGate'
  ],
  authors: [{ name: 'One Gateway Online Pvt Ltd', url: 'https://helpgate.in' }],
  creator: 'One Gateway Online Pvt Ltd',
  publisher: 'One Gateway Online Pvt Ltd',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://helpgate.in',
    siteName: 'HelpGate',
    title: 'HelpGate — Free Technology. For Everyone.',
    description: '100% free digital utilities and developer tools. Process files locally with zero cloud uploads.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HelpGate — Free Technology. For Everyone.',
    description: '100% free digital utilities and developer tools. Zero subscriptions, zero paywalls.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <ThemeProvider>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
