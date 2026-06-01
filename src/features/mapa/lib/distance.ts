import type { LatLng, Parada } from '@features/mapa/types/ruta';

/**
 * Pure geometry helpers. No Leaflet dependency — distance metric is injected
 * so the animation hook can use leaflet's `map.distance` (great-circle meters).
 */

export type DistanceFn = (a: LatLng, b: LatLng) => number;

/**
 * Interpolated lat/lng at progress t ∈ [0, 1] along a polyline with
 * cumulative distances. Returns last point if t >= 1, first if route empty.
 */
export function positionAt(
  route: LatLng[],
  distances: number[],
  total: number,
  t: number
): LatLng {
  if (route.length === 0) return [0, 0];
  if (route.length === 1) return route[0];

  const targetDist = t * total;
  let i = 1;
  while (i < distances.length && distances[i] < targetDist) i++;
  if (i >= distances.length) return route[route.length - 1];

  const segStart = distances[i - 1];
  const segEnd = distances[i];
  const segT = segEnd === segStart ? 0 : (targetDist - segStart) / (segEnd - segStart);
  const [lat1, lng1] = route[i - 1];
  const [lat2, lng2] = route[i];
  return [lat1 + (lat2 - lat1) * segT, lng1 + (lng2 - lng1) * segT];
}

/**
 * Build cumulative distance array for a polyline.
 */
export function cumulativeDistances(
  route: LatLng[],
  dist: DistanceFn
): { distances: number[]; total: number } {
  const distances: number[] = [0];
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += dist(route[i - 1], route[i]);
    distances.push(total);
  }
  return { distances, total };
}

/**
 * Stop closest to `pos`. Returns idx + distance in same unit as `dist` returns.
 */
export function findNearestStop(
  paradas: Parada[],
  pos: LatLng,
  dist: DistanceFn
): { idx: number; distance: number } {
  let idx = -1;
  let distance = Infinity;
  for (let i = 0; i < paradas.length; i++) {
    const d = dist(pos, [paradas[i].lat, paradas[i].lng]);
    if (d < distance) {
      distance = d;
      idx = i;
    }
  }
  return { idx, distance };
}

/**
 * Set of stop indices the moto has already passed at cumulative `targetDist`.
 * Each stop is snapped to its nearest route vertex.
 */
export function computePassedStops(
  paradas: Parada[],
  route: LatLng[],
  distances: number[],
  targetDist: number,
  dist: DistanceFn
): Set<number> {
  const passed = new Set<number>();
  for (let i = 0; i < paradas.length; i++) {
    const stopPos: LatLng = [paradas[i].lat, paradas[i].lng];
    let minD = Infinity;
    let minIdx = 0;
    for (let j = 0; j < route.length; j++) {
      const d = dist(route[j], stopPos);
      if (d < minD) {
        minD = d;
        minIdx = j;
      }
    }
    if (distances[minIdx] <= targetDist) passed.add(i);
  }
  return passed;
}
