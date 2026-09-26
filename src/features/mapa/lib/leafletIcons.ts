import type * as L from 'leaflet';

/**
 * DivIcons for Leaflet markers. Kept here so the styling lives in one place
 * instead of being interpolated into JSX strings.
 *
 * These read the same custom properties as the stylesheets (--accent,
 * --surface-panel, --font-display…): the markers sit inside the map root, so
 * they pick up the light/dark swap and the next/font families for free.
 * Literal fallbacks are kept in case a marker is ever mounted outside it.
 */

const FONT_DISPLAY = "var(--font-display, 'Bebas Neue'), sans-serif";
const ACCENT = 'var(--accent, #ff6b1a)';

export function createMotoIcon(LL: typeof L): L.DivIcon {
  return LL.divIcon({
    html: `<div style="width:28px;height:28px;position:relative;">
      <div style="position:absolute;inset:0;border-radius:50%;background:${ACCENT};opacity:0.4;animation:pulse 2s infinite ease-out;"></div>
      <div style="position:absolute;inset:9px;border-radius:50%;background:${ACCENT};box-shadow:0 0 12px ${ACCENT}, 0 0 24px ${ACCENT}, 0 0 40px rgba(255,107,26,0.4);border:2px solid #fff;"></div>
    </div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function createStopLabelIcon(
  LL: typeof L,
  index: number,
  name: string
): L.DivIcon {
  const num = String(index + 1).padStart(2, '0');
  const upper = name.toUpperCase();
  return LL.divIcon({
    html: `<div style="background:var(--surface-panel, rgba(10,10,10,0.92));border:1px solid var(--border, rgba(255,255,255,0.08));border-left:2px solid ${ACCENT};padding:4px 10px;font-family:${FONT_DISPLAY};font-size:13px;letter-spacing:0.08em;color:var(--text-primary, #f5f5f5);white-space:nowrap;border-radius:2px;transform:translateY(-30px);">${num} ${upper}</div>`,
    className: '',
    iconSize: undefined,
    iconAnchor: [0, 0],
  });
}

export function createPuntoInteresIcon(
  LL: typeof L,
  name: string,
  lightMap = false
): L.DivIcon {
  const upper = name.toUpperCase();
  const color = lightMap ? 'rgba(10,10,10,0.85)' : 'rgba(245,245,245,0.9)';
  return LL.divIcon({
    html: `<div style="border-left:2px solid ${color};padding:4px 10px;font-family:${FONT_DISPLAY};font-size:12px;letter-spacing:0.08em;color:${color};white-space:nowrap;border-radius:2px;transform:translateY(-30px);">◆ ${upper}</div>`,
    className: '',
    iconSize: undefined,
    iconAnchor: [0, 0],
  });
}
