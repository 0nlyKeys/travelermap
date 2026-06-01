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
        No hay rutas todavía. Agrega un JSON en <code>data/rutas/</code>.
      </div>
    );
  }
  return (
    <div className={styles.grid}>
      {rutas.map((r) => (
        <RutaCard key={r.slug} ruta={r} />
      ))}
    </div>
  );
}

export default RutaList;
