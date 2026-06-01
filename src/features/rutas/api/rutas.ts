import fs from 'node:fs/promises';
import path from 'node:path';
import type { Ruta } from '@features/mapa/types/ruta';

const RUTAS_DIR = path.join(process.cwd(), 'data', 'rutas');

/**
 * Carga una ruta específica por su slug.
 * Devuelve null si no existe.
 */
export async function cargarRuta(slug: string): Promise<Ruta | null> {
  try {
    const file = path.join(RUTAS_DIR, `${slug}.json`);
    const contenido = await fs.readFile(file, 'utf-8');
    return JSON.parse(contenido) as Ruta;
  } catch {
    return null;
  }
}

/**
 * Lista todas las rutas disponibles (lee los archivos JSON del directorio).
 * Útil para generar la home y los routes estáticos.
 */
export async function listarRutas(): Promise<Ruta[]> {
  try {
    const archivos = await fs.readdir(RUTAS_DIR);
    const rutas = await Promise.all(
      archivos
        .filter((f) => f.endsWith('.json'))
        .map(async (f) => {
          const contenido = await fs.readFile(path.join(RUTAS_DIR, f), 'utf-8');
          return JSON.parse(contenido) as Ruta;
        })
    );
    return rutas;
  } catch {
    return [];
  }
}
