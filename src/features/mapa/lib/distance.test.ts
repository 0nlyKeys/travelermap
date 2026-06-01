import { describe, expect, it } from 'vitest';
import type { LatLng, Parada } from '@features/mapa/types/ruta';
import {
  cumulativeDistances,
  positionAt,
  findNearestStop,
  computePassedStops,
} from './distance';

// Manhattan distance for a deterministic, unit-less test metric.
const manhattan = (a: LatLng, b: LatLng) =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

describe('cumulativeDistances', () => {
  it('returns [0] for a single point', () => {
    const { distances, total } = cumulativeDistances([[0, 0]], manhattan);
    expect(distances).toEqual([0]);
    expect(total).toBe(0);
  });

  it('accumulates segment distances', () => {
    const route: LatLng[] = [
      [0, 0],
      [0, 1],
      [0, 3],
    ];
    const { distances, total } = cumulativeDistances(route, manhattan);
    expect(distances).toEqual([0, 1, 3]);
    expect(total).toBe(3);
  });
});

describe('positionAt', () => {
  const route: LatLng[] = [
    [0, 0],
    [0, 2],
    [0, 4],
  ];
  const { distances, total } = cumulativeDistances(route, manhattan);

  it('returns first point at t=0', () => {
    expect(positionAt(route, distances, total, 0)).toEqual([0, 0]);
  });

  it('returns last point at t=1', () => {
    expect(positionAt(route, distances, total, 1)).toEqual([0, 4]);
  });

  it('interpolates linearly within a segment', () => {
    expect(positionAt(route, distances, total, 0.25)).toEqual([0, 1]);
    expect(positionAt(route, distances, total, 0.5)).toEqual([0, 2]);
    expect(positionAt(route, distances, total, 0.75)).toEqual([0, 3]);
  });

  it('handles empty route gracefully', () => {
    expect(positionAt([], [], 0, 0.5)).toEqual([0, 0]);
  });
});

describe('findNearestStop', () => {
  const paradas: Parada[] = [
    { nombre: 'A', lat: 0, lng: 0 },
    { nombre: 'B', lat: 0, lng: 10 },
    { nombre: 'C', lat: 10, lng: 10 },
  ];

  it('picks the closest stop by injected distance fn', () => {
    const { idx, distance } = findNearestStop(paradas, [0, 9], manhattan);
    expect(idx).toBe(1);
    expect(distance).toBe(1);
  });
});

describe('computePassedStops', () => {
  it('marks stops whose snapped position is within targetDist', () => {
    const route: LatLng[] = [
      [0, 0],
      [0, 5],
      [0, 10],
    ];
    const paradas: Parada[] = [
      { nombre: 'start', lat: 0, lng: 0 },
      { nombre: 'mid', lat: 0, lng: 5 },
      { nombre: 'end', lat: 0, lng: 10 },
    ];
    const { distances } = cumulativeDistances(route, manhattan);
    // targetDist = 5 → only the first two should be passed
    const passed = computePassedStops(paradas, route, distances, 5, manhattan);
    expect(passed.has(0)).toBe(true);
    expect(passed.has(1)).toBe(true);
    expect(passed.has(2)).toBe(false);
  });
});
