import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { cargarRuta, listarRutas } from '@features/rutas/api/rutas';

// Leaflet usa `window` y no funciona en SSR.
// `dynamic` con `ssr: false` carga el componente solo en el cliente.
const MapaAnimado = dynamic(
  () => import('@features/mapa/components/MapaAnimado'),
  { ssr: false }
);

// Pre-generar las rutas en build time (mejor performance)
export async function generateStaticParams() {
  const rutas = await listarRutas();
  return rutas.map((r) => ({ slug: r.slug }));
}

// Generar metadata por ruta (SEO)
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const ruta = await cargarRuta(params.slug);
  return {
    title: ruta ? `${ruta.titulo} · Ruta App` : 'Ruta no encontrada',
  };
}

export default async function RutaPage({ params }: { params: { slug: string } }) {
  const ruta = await cargarRuta(params.slug);
  if (!ruta) notFound();
  return <MapaAnimado ruta={ruta} />;
}
