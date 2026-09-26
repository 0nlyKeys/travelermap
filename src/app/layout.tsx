import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Manrope, Space_Mono } from 'next/font/google';
import '@styles/globals.scss';

// Self-hosted at build time by next/font: no render-blocking request to
// fonts.googleapis.com, no layout shift from a late swap.
const display = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-display',
});

const body = Manrope({
  subsets: ['latin'],
  weight: ['300', '500', '700'],
  display: 'swap',
  variable: '--font-body',
});

const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-mono',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Ruta App',
  description: 'Mapas animados para videos de viajes en moto',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Ruta App',
    title: 'Ruta App',
    description: 'Mapas animados para videos de viajes en moto',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ruta App',
    description: 'Mapas animados para videos de viajes en moto',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
