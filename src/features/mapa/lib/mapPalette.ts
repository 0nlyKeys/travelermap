/**
 * Colors handed to Leaflet's vector API.
 *
 * Leaflet writes these straight onto SVG presentation attributes
 * (`stroke`, `fill`), where `var(--accent)` does not resolve. So the map
 * geometry cannot read the CSS theme layer and needs literals — this module
 * is the single place they live, mirroring styles/abstracts/_tokens.scss.
 */

export const MAP_ACCENT = '#ff6b1a';
export const MAP_SURFACE = '#0a0a0a';

/** Un-ridden part of the route: readable over both tile themes. */
export const MAP_ROUTE_PENDING = '#666666';
