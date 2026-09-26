import { describe, expect, it } from 'vitest';
import type { Parada, Ruta } from '@features/mapa/types/ruta';
import { buildRouteDescription, buildRouteTitle } from './seo';

const parada = (nombre: string): Parada => ({ nombre, lat: 0, lng: 0 });

const ruta = (over: Partial<Ruta> = {}): Ruta => ({
  slug: 'demo',
  titulo: 'Ruta Demo',
  subtitulo: 'A → B',
  paradas: [parada('Bogotá'), parada('Murillo')],
  ...over,
});

describe('buildRouteTitle', () => {
  it('arma la forma completa cuando cabe en 60 caracteres', () => {
    const title = buildRouteTitle(ruta({ metadata: { distanciaKm: 190 } }));
    expect(title).toBe('Ruta Demo en moto: Bogotá → Murillo (190 km) | Traveler Map');
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('omite los km cuando la ruta no tiene distancia guardada', () => {
    expect(buildRouteTitle(ruta())).toBe(
      'Ruta Demo en moto: Bogotá → Murillo | Traveler Map'
    );
  });

  it('quita "en moto" antes que los km cuando se pasa de 60', () => {
    const title = buildRouteTitle(
      ruta({
        titulo: 'Ruta de los Nevados',
        paradas: [parada('Bogotá'), parada('PNN Los Nevados')],
      })
    );
    expect(title).toBe('Ruta de los Nevados: Bogotá → PNN Los Nevados | Traveler Map');
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('nunca pierde el nombre de la ruta ni el sufijo de marca', () => {
    const title = buildRouteTitle(
      ruta({
        titulo: 'Travesía larguísima por el eje cafetero y alrededores',
        paradas: [
          parada('Un origen con nombre largo'),
          parada('Un destino con nombre largo'),
        ],
        metadata: { distanciaKm: 420 },
      })
    );
    expect(title).toBe(
      'Travesía larguísima por el eje cafetero y alrededores | Traveler Map'
    );
    expect(title.startsWith('Travesía larguísima')).toBe(true);
    expect(title.endsWith(' | Traveler Map')).toBe(true);
  });

  it('usa seoTitle tal cual cuando existe', () => {
    expect(buildRouteTitle(ruta({ seoTitle: 'Título a mano' }))).toBe('Título a mano');
  });

  it('funciona sin paradas', () => {
    expect(buildRouteTitle(ruta({ paradas: [] }))).toBe(
      'Ruta Demo en moto | Traveler Map'
    );
  });
});

describe('buildRouteDescription', () => {
  it('lista hasta 3 paradas intermedias', () => {
    const desc = buildRouteDescription(
      ruta({
        paradas: [
          parada('Bogotá'),
          parada('Vianí'),
          parada('Líbano'),
          parada('Murillo'),
          parada('PNN Los Nevados'),
        ],
      })
    );
    expect(desc).toContain('pasando por Vianí, Líbano y Murillo');
    expect(desc.length).toBeLessThanOrEqual(160);
  });

  it('cierra con "y más" cuando hay más de 3 intermedias', () => {
    const desc = buildRouteDescription(
      ruta({
        titulo: 'R',
        paradas: [
          parada('A'),
          parada('B'),
          parada('C'),
          parada('D'),
          parada('E'),
          parada('F'),
        ],
      })
    );
    expect(desc).toContain('pasando por B, C, D y más');
  });

  it('omite "pasando por" cuando no hay paradas intermedias', () => {
    const desc = buildRouteDescription(ruta());
    expect(desc).toBe(
      'Recorrido en moto de Bogotá a Murillo. Mira el mapa animado, las paradas y los kilómetros de cada tramo.'
    );
  });

  it('respeta el límite de 160 sin cortar palabras', () => {
    const desc = buildRouteDescription(
      ruta({
        paradas: [
          parada('Un origen con un nombre francamente interminable para una parada'),
          parada('Un destino con un nombre igual de interminable para otra parada'),
        ],
      })
    );
    expect(desc.length).toBeLessThanOrEqual(160);
    expect(desc.endsWith('…')).toBe(true);
    expect(desc).not.toMatch(/\s…$/);
  });

  it('no promete funciones que no existen', () => {
    const desc = buildRouteDescription(ruta());
    expect(desc.toLowerCase()).not.toContain('descarga');
    expect(desc.toLowerCase()).not.toContain('gpx');
  });

  it('usa seoDescription tal cual cuando existe', () => {
    expect(buildRouteDescription(ruta({ seoDescription: 'Descripción a mano' }))).toBe(
      'Descripción a mano'
    );
  });
});
