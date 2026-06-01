import type { ReactNode } from 'react';

/**
 * Icon registry. Add new icons here — never inline an <svg> in a component.
 * Each entry encodes its own fill/stroke since the legacy assets mix both
 * conventions (transport buttons use fill, outline icons use stroke).
 */

export type IconName =
  | 'edit'
  | 'eye'
  | 'reset'
  | 'play'
  | 'pause'
  | 'target'
  | 'sun';

interface IconDef {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  body: ReactNode;
}

export const ICONS: Record<IconName, IconDef> = {
  edit: {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    body: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </>
    ),
  },
  eye: {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    body: (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  reset: {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    body: (
      <>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </>
    ),
  },
  play: {
    fill: 'currentColor',
    body: <path d="M8 5v14l11-7z" />,
  },
  pause: {
    fill: 'currentColor',
    body: (
      <>
        <rect x="6" y="5" width="4" height="14" />
        <rect x="14" y="5" width="4" height="14" />
      </>
    ),
  },
  target: {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    body: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  sun: {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    body: (
      <>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </>
    ),
  },
};
