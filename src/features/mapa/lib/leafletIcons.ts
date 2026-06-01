import type * as L from 'leaflet';

/**
 * DivIcons for Leaflet markers. Kept here so the styling lives in one place
 * instead of being interpolated into JSX strings.
 */

export function createMotoIcon(LL: typeof L): L.DivIcon {
  return LL.divIcon({
    html: `<div style="width:28px;height:28px;position:relative;">
      <div style="position:absolute;inset:0;border-radius:50%;background:#ff6b1a;opacity:0.4;animation:pulse 2s infinite ease-out;"></div>
      <div style="position:absolute;inset:9px;border-radius:50%;background:#ff6b1a;box-shadow:0 0 12px #ff6b1a, 0 0 24px #ff6b1a, 0 0 40px rgba(255,107,26,0.4);border:2px solid #fff;"></div>
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
    html: `<div style="background:rgba(10,10,10,0.92);border:1px solid rgba(255,255,255,0.08);border-left:2px solid #ff6b1a;padding:4px 10px;font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:0.08em;color:#f5f5f5;white-space:nowrap;border-radius:2px;transform:translateY(-30px);">${num} ${upper}</div>`,
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
    html: `<div style="border-left:2px solid ${color};padding:4px 10px;font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:0.08em;color:${color};white-space:nowrap;border-radius:2px;transform:translateY(-30px);">◆ ${upper}</div>`,
    className: '',
    iconSize: undefined,
    iconAnchor: [0, 0],
  });
}
