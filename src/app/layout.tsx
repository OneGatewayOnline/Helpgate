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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://helpgate.in',
    siteName: 'HelpGate',
    title: 'HelpGate — Free Technology. For Everyone.',
    description: '100% free digital utilities and developer tools. Process files locally with zero cloud uploads.',
    images: [
      {
        url: 'https://helpgate.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HelpGate — Free Technology. For Everyone.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HelpGate — Free Technology. For Everyone.',
    description: '100% free digital utilities and developer tools. Zero subscriptions, zero paywalls.',
    images: ['https://helpgate.in/og-image.png'],
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
