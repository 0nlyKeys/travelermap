import type { SVGProps } from 'react';
import { ICONS, type IconName } from './paths';

interface Props extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  name: IconName;
  /** Square size in px. Defaults to 18. */
  size?: number;
}

/**
 * Single-source-of-truth SVG renderer. All app icons live in ./paths.
 * Inherits color via `currentColor` — set CSS `color` on the parent to recolor.
 */
export function Icon({ name, size = 18, ...rest }: Props) {
  const def = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={def.fill}
      stroke={def.stroke}
      strokeWidth={def.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {def.body}
    </svg>
  );
}

export default Icon;
