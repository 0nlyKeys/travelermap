import Link from 'next/link';
import type { Ruta } from '@features/mapa/types/ruta';
import styles from './RutaList.module.scss';

interface Props {
  ruta: Ruta;
}

export function RutaCard({ ruta }: Props) {
  return (
    <Link href={`/rutas/${ruta.slug}`} className={styles.card}>
      <div className={styles.cardTitle}>{ruta.titulo}</div>
      <div className={styles.cardSubtitle}>{ruta.subtitulo}</div>
      <div className={styles.cardMeta}>{ruta.paradas.length} paradas</div>
    </Link>
  );
}

export default RutaCard;
