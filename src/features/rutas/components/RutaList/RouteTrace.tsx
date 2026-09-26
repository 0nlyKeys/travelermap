import type { Parada } from '@features/mapa/types/ruta';
import styles from './RutaList.module.scss';

interface Props {
  paradas: Parada[];
  /** Wide cards get a longer box so the trace reads differently per cell. */
  wide?: boolean;
}

const VIEW_W = 100;
const VIEW_H = 42;
const PAD = 8;

/**
 * Route shape drawn from the real coordinates in the JSON. Not decoration:
 * every vertex is a parada, so two routes never look alike.
 *
 * Plain equirectangular projection with a cos(lat) correction on x. Exact
 * enough for a thumbnail at this latitude span.
 */
export function RouteTrace({ paradas, wide }: Props) {
  const points = project(paradas, wide ? VIEW_W : VIEW_W * 0.72);
  if (points.length === 0)
    return <div className={styles.traceEmpty} aria-hidden="true" />;

  const width = wide ? VIEW_W : VIEW_W * 0.72;
  const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  const [startX, startY] = points[0];
  const [endX, endY] = points[points.length - 1];

  return (
    <svg
      className={styles.trace}
      viewBox={`0 0 ${width} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Trazado de ${paradas.length} paradas`}
    >
      <path d={d} className={styles.tracePath} />
      {points.slice(1, -1).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.1} className={styles.traceDot} />
      ))}
      <circle cx={startX} cy={startY} r={2.2} className={styles.traceStart} />
      <circle cx={endX} cy={endY} r={2.2} className={styles.traceEnd} />
    </svg>
  );
}

function project(paradas: Parada[], width: number): [number, number][] {
  if (paradas.length === 0) return [];

  const latRad = (paradas[0].lat * Math.PI) / 180;
  const xs = paradas.map((p) => p.lng * Math.cos(latRad));
  const ys = paradas.map((p) => p.lat);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = maxX - minX || 1e-6;
  const spanY = maxY - minY || 1e-6;

  // Uniform scale keeps the real aspect of the ride instead of stretching it.
  const scale = Math.min((width - PAD * 2) / spanX, (VIEW_H - PAD * 2) / spanY);
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (VIEW_H - spanY * scale) / 2;

  return paradas.map((_, i) => [
    round(offsetX + (xs[i] - minX) * scale),
    // Flip Y: north goes up.
    round(VIEW_H - (offsetY + (ys[i] - minY) * scale)),
  ]);
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export default RouteTrace;
