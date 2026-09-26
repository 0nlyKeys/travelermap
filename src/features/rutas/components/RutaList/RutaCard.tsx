import Link from 'next/link';
import type { Ruta } from '@features/mapa/types/ruta';
import { RouteTrace } from './RouteTrace';
import styles from './RutaList.module.scss';

interface Props {
  ruta: Ruta;
  /** Spans both columns: used for the odd tail so the grid never has a gap. */
  wide?: boolean;
  /** Stagger index for the load-in cascade. */
  index?: number;
}

export function RutaCard({ ruta, wide, index = 0 }: Props) {
  const cls = [styles.card, wide ? styles.cardWide : ''].filter(Boolean).join(' ');

  return (
    <Link
      href={`/rutas/${ruta.slug}`}
      className={cls}
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className={styles.cardVisual}>
        <RouteTrace paradas={ruta.paradas} wide={wide} />
      </div>

      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{ruta.titulo}</h2>
        <p className={styles.cardSubtitle}>{ruta.subtitulo}</p>

        <dl className={styles.cardMeta}>
          <div className={styles.metaItem}>
            <dt>Paradas</dt>
            <dd>{ruta.paradas.length}</dd>
          </div>
          {ruta.metadata?.fecha && (
            <div className={styles.metaItem}>
              <dt>Fecha</dt>
              <dd>{ruta.metadata.fecha}</dd>
            </div>
          )}
          {ruta.metadata?.moto && (
            <div className={styles.metaItem}>
              <dt>Moto</dt>
              <dd>{ruta.metadata.moto}</dd>
            </div>
          )}
        </dl>
      </div>
    </Link>
  );
}

export default RutaCard;
