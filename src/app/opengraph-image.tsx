import { ImageResponse } from 'next/og';

// Edge runtime: the Node build of @vercel/og resolves its wasm asset through
// fileURLToPath, which throws on Windows project paths containing spaces.
export const runtime = 'edge';

// Inherited by /rutas/[slug] unless that segment defines its own.
export const alt = 'Traveler Map: rutas en moto para tus videos';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: '#0a0a0a',
        padding: 80,
        position: 'relative',
      }}
    >
      <svg
        width="1200"
        height="630"
        viewBox="0 0 1200 630"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path
          d="M-40 470 C 220 470, 240 250, 470 250 S 760 330, 900 180 L 1240 120"
          fill="none"
          stroke="#ff6b1a"
          strokeWidth="6"
          strokeOpacity="0.55"
        />
        <circle cx="470" cy="250" r="12" fill="#ff6b1a" />
        <circle cx="900" cy="180" r="12" fill="#ff6b1a" />
      </svg>

      <div
        style={{
          fontSize: 110,
          letterSpacing: 6,
          color: '#f5f5f5',
          lineHeight: 1,
        }}
      >
        RUTAS
      </div>
      <div
        style={{
          fontSize: 30,
          letterSpacing: 4,
          color: '#ff6b1a',
          marginTop: 18,
          textTransform: 'uppercase',
        }}
      >
        Mapas animados para tus videos
      </div>
    </div>,
    size
  );
}
