import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { cargarRuta, listarRutas } from '@features/rutas/api/rutas';
import {
  SITE_NAME,
  buildRouteDescription,
  buildRouteTitle,
} from '@features/rutas/lib/seo';
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

/**
 * Metadata por ruta, derivada de su JSON en build time. Al agregar una ruta
 * nueva no hay que escribir nada aquí: el texto sale de features/rutas/lib/seo.
 *
 * `title.absolute` evita que el template del layout raíz vuelva a pegar
 * " | Traveler Map", que buildRouteTitle ya incluye.
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const ruta = await cargarRuta(params.slug);
  if (!ruta) return { title: 'Ruta no encontrada' };

  const title = buildRouteTitle(ruta);
  const description = buildRouteDescription(ruta);
  const url = `/rutas/${ruta.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      locale: 'es_CO',
      siteName: SITE_NAME,
      url,
      title,
      description,
      // Declarar `openGraph` aquí reemplaza el del layout raíz, incluida la
      // imagen que Next engancha desde app/opengraph-image.tsx. Se referencia
      // a mano para que la vista previa al compartir no quede sin imagen.
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
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
