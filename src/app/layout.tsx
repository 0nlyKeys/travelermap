import type { Metadata } from 'next';
import '@styles/globals.scss';

export const metadata: Metadata = {
  title: 'Ruta App',
  description: 'Mapas animados para videos de viajes en moto',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
