import type { Ruta } from '@features/mapa/types/ruta';

/**
 * Texto SEO derivado de los datos de cada ruta. Funciones puras: no leen el
 * filesystem ni el DOM, así que sirven igual en generateMetadata (servidor)
 * que en los tests.
 *
 * Una ruta puede saltarse la generación poniendo `seoTitle` / `seoDescription`
 * en su JSON.
 */

export const SITE_NAME = 'Traveler Map';

const TITLE_SUFFIX = ` | ${SITE_NAME}`;
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;
const MAX_VIAS = 3;

/** Segunda frase de la descripción. Solo promete lo que la app ya hace hoy. */
const DESCRIPTION_TAIL =
  'Mira el mapa animado, las paradas y los kilómetros de cada tramo.';

/**
 * Título de la página de una ruta.
 *
 * Forma completa:
 *   "{titulo} en moto: {origen} → {destino} ({X} km) | Traveler Map"
 *
 * Si pasa de 60 caracteres se recorta por etapas: primero cae "en moto",
 * después los km y por último el tramo. El nombre de la ruta y el sufijo de
 * marca nunca se tocan.
 */
export function buildRouteTitle(ruta: Ruta): string {
  if (ruta.seoTitle) return ruta.seoTitle;

  const leg = formatLeg(ruta);
  const km = ruta.metadata?.distanciaKm;
  // Sin distancia guardada no se inventa un número.
  const kmPart = typeof km === 'number' && km > 0 ? ` (${Math.round(km)} km)` : '';
  const tramo = leg ? `: ${leg}` : '';

  const candidates = [
    `${ruta.titulo} en moto${tramo}${kmPart}`,
    `${ruta.titulo}${tramo}${kmPart}`,
    `${ruta.titulo}${tramo}`,
    ruta.titulo,
  ].map((head) => `${head}${TITLE_SUFFIX}`);

  return (
    candidates.find((c) => c.length <= TITLE_MAX) ?? candidates[candidates.length - 1]
  );
}

/**
 * Descripción de la página de una ruta.
 *
 * "Recorrido en moto de {origen} a {destino} pasando por {hasta 3 paradas}.
 *  Mira el mapa animado, las paradas y los kilómetros de cada tramo."
 */
export function buildRouteDescription(ruta: Ruta): string {
  if (ruta.seoDescription) return ruta.seoDescription;

  const lead = formatLead(ruta);
  const vias = ruta.paradas.slice(1, -1).map((p) => p.nombre);
  const via = vias.length > 0 ? ` pasando por ${formatVias(vias)}` : '';

  const full = `${lead}${via}. ${DESCRIPTION_TAIL}`;
  if (full.length <= DESCRIPTION_MAX) return full;

  // Primero se sacrifica el listado de paradas intermedias, no la frase final.
  const short = `${lead}. ${DESCRIPTION_TAIL}`;
  if (short.length <= DESCRIPTION_MAX) return short;

  return truncateWords(short, DESCRIPTION_MAX);
}

// ─── Helpers ───────────────────────────────────────────────────────────

/** "Bogotá → Murillo", o solo el nombre si hay una parada, o null si no hay. */
function formatLeg(ruta: Ruta): string | null {
  const { paradas } = ruta;
  if (paradas.length === 0) return null;
  if (paradas.length === 1) return paradas[0].nombre;
  return `${paradas[0].nombre} → ${paradas[paradas.length - 1].nombre}`;
}

function formatLead(ruta: Ruta): string {
  const { paradas } = ruta;
  if (paradas.length === 0) return 'Recorrido en moto';
  if (paradas.length === 1) return `Recorrido en moto por ${paradas[0].nombre}`;
  return `Recorrido en moto de ${paradas[0].nombre} a ${paradas[paradas.length - 1].nombre}`;
}

/** "A", "A y B", "A, B y C", "A, B, C y más". */
function formatVias(vias: string[]): string {
  if (vias.length === 1) return vias[0];

  const shown = vias.slice(0, MAX_VIAS);
  if (vias.length > MAX_VIAS) return `${shown.join(', ')} y más`;

  return `${shown.slice(0, -1).join(', ')} y ${shown[shown.length - 1]}`;
}

/** Recorta a `max` sin partir una palabra por la mitad. */
function truncateWords(text: string, max: number): string {
  if (text.length <= max) return text;

  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const body = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;

  return `${body.replace(/[.,;:]+$/, '')}…`;
}
