import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AppProviders } from '@/providers/index';
import '@/styles/globals.css';
import { appConfig } from '@/config/app.config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: appConfig.meta.title,
    template: `%s — ${appConfig.meta.title}`,
  },
  description: appConfig.meta.description,
  keywords: appConfig.meta.keywords,
  authors: appConfig.meta.authors,
  metadataBase: new URL(appConfig.url),
  openGraph: {
    type: 'website',
    siteName: appConfig.name,
    title: appConfig.meta.title,
    description: appConfig.meta.description,
  },
  robots: {
    index: appConfig.isProduction,
    follow: appConfig.isProduction,
  },
};

export const viewport: Viewport = {
  themeColor: appConfig.meta.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
