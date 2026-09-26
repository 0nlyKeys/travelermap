import type { MetadataRoute } from 'next';
import { listarRutas } from '@features/rutas/api/rutas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rutas = await listarRutas();

  return [
    { url: siteUrl, changeFrequency: 'monthly', priority: 1 },
    ...rutas.map((r) => ({
      url: `${siteUrl}/rutas/${r.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
