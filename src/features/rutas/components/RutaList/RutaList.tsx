import type { Ruta } from '@features/mapa/types/ruta';
import { RutaCard } from './RutaCard';
import styles from './RutaList.module.scss';

interface Props {
  rutas: Ruta[];
}

export function RutaList({ rutas }: Props) {
  if (rutas.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Todavía no hay rutas</p>
        <p className={styles.emptyHint}>
          Agrega un JSON en <code>data/rutas/</code> y aparecerá aquí.
        </p>
      </div>
    );
  }

  // Two-column grid. An odd count would leave a hole, so the last card spans
  // the full row: N routes always produce exactly N filled cells.
  const oddTail = rutas.length % 2 === 1;

  return (
    <div className={styles.grid}>
      {rutas.map((r, i) => (
        <RutaCard
          key={r.slug}
          ruta={r}
          index={i}
          wide={oddTail && i === rutas.length - 1}
        />
      ))}
    </div>
  );
}

export default RutaList;
