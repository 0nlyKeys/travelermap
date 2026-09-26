import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Manrope, Space_Mono } from 'next/font/google';
import { SITE_NAME } from '@features/rutas/lib/seo';
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://travelermap.vercel.app';

const siteName = SITE_NAME;
const homeTitle = 'Rutas en moto por Colombia | Traveler Map';
const description =
  'Cada ruta, recorrida en moto y animada en el mapa. Mira por dónde pasamos, dónde paramos y cuántos kilómetros son. Síguela o crea la tuya.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // `template` le pega la marca a cualquier página hija que entregue un título
  // suelto. /rutas/[slug] arma el suyo completo y usa `absolute` para saltárselo.
  title: { default: homeTitle, template: `%s | ${siteName}` },
  description,
  applicationName: siteName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: '/',
    siteName,
    title: homeTitle,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description,
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
