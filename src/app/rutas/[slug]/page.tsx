import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { cargarRuta, listarRutas } from '@features/rutas/api/rutas';
import styles from './page.module.scss';

// Leaflet usa `window` y no funciona en SSR.
// `dynamic` con `ssr: false` carga el componente solo en el cliente.
const MapaAnimado = dynamic(() => import('@features/mapa/components/MapaAnimado'), {
  ssr: false,
});

// Pre-generar las rutas en build time (mejor performance)
export async function generateStaticParams() {
  const rutas = await listarRutas();
  return rutas.map((r) => ({ slug: r.slug }));
}

// Generar metadata por ruta (SEO)
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const ruta = await cargarRuta(params.slug);
  if (!ruta) return { title: 'Ruta no encontrada' };

  const title = `${ruta.titulo} · Ruta App`;
  const description = `${ruta.subtitulo}. Recorrido animado con ${ruta.paradas.length} paradas.`;

  return {
    title,
    description,
    alternates: { canonical: `/rutas/${ruta.slug}` },
    openGraph: { type: 'article', title, description },
    twitter: { card: 'summary_large_image' as const, title, description },
  };
}

export default async function RutaPage({ params }: { params: { slug: string } }) {
  const ruta = await cargarRuta(params.slug);
  if (!ruta) notFound();
  return (
    <>
      <h1 className={styles.srOnly}>{ruta.titulo}</h1>
      <MapaAnimado ruta={ruta} />
    </>
  );
}
