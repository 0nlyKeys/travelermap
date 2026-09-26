import styles from './MapaHeader.module.scss';

interface Props {
  titulo: string;
  subtitulo: string;
  distanceKm: string;
  totalKm: string;
  hidden?: boolean;
}

/**
 * Top bar: brand on the left, km stats on the right.
 * Uses pointer-events: none on the container so the map remains draggable
 * everywhere except over the actual brand / stats blocks.
 */
export function MapaHeader({ titulo, subtitulo, distanceKm, totalKm, hidden }: Props) {
  return (
    <header className={`${styles.topBar} ${hidden ? styles.hidden : ''}`}>
      <div className={styles.brand}>
        {/* The real <h1> lives in the server page: the map is ssr:false, so a
            heading rendered here would be missing from the static HTML. This
            one is the visible copy, hidden from the a11y tree to avoid a
            duplicate announcement. */}
        <div className={styles.brandTitle} aria-hidden="true">
          {titulo.toUpperCase()}
        </div>
        <div className={styles.brandSubtitle}>{subtitulo}</div>
      </div>
      <div className={styles.stats}>
        <Stat value={`${distanceKm} KM`} label="Recorrido" />
        <Stat value={`${totalKm} KM`} label="Total" />
      </div>
    </header>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export default MapaHeader;
