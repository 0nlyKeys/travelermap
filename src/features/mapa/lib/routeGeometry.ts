import type { Parada, LatLng } from '@features/mapa/types/ruta';

/**
 * Interpolación Catmull-Rom para suavizar una ruta y que parezca carretera de montaña.
 * Toma una lista de puntos y devuelve una versión con muchos más puntos curvos entre ellos.
 */
export function smoothPath(points: LatLng[], segments = 16): LatLng[] {
  if (points.length < 2) return points.slice();
  const result: LatLng[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    for (let t = 0; t < segments; t++) {
      const s = t / segments;
      const s2 = s * s;
      const s3 = s2 * s;
      const lat =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * s +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s3);
      const lng =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * s +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s3);
      result.push([lat, lng]);
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

/**
 * Resultado de obtener la ruta: lista de coordenadas y distancia opcional.
 */
export interface RouteResult {
  coords: LatLng[];
  distance: number | null;
}

/**
 * Intenta obtener la ruta real desde OSRM (servidor público de routing).
 * Si falla o tarda más de 3.5s, usa una versión suavizada de las paradas.
 */
export async function fetchRoute(paradas: Parada[]): Promise<RouteResult> {
  if (paradas.length < 2) return { coords: [], distance: 0 };

  const coordStr = paradas.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await res.json();

    if (data.routes && data.routes[0]) {
      const coords: LatLng[] = data.routes[0].geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]] as LatLng
      );
      return { coords, distance: data.routes[0].distance };
    }
  } catch (e) {
    console.warn('OSRM no disponible, usando ruta aproximada');
  }

  // Fallback: suavizar las paradas directamente
  const pts: LatLng[] = paradas.map((p) => [p.lat, p.lng]);
  return { coords: smoothPath(pts, 24), distance: null };
}
