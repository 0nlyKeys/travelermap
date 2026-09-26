import { listarRutas } from '@features/rutas/api/rutas';
import { RutaList } from '@features/rutas/components/RutaList';
import styles from './page.module.scss';

export default async function HomePage() {
  const rutas = await listarRutas();

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <h1 className={styles.title}>RUTAS</h1>
        <p className={styles.tagline}>Mapas animados para tus videos</p>
      </header>

      <section className={styles.catalog} aria-label="Rutas disponibles">
        <div className={styles.rule}>
          <span className={styles.count}>
            {rutas.length} {rutas.length === 1 ? 'disponible' : 'disponibles'}
          </span>
        </div>
        <RutaList rutas={rutas} />
      </section>
    </main>
  );
}
