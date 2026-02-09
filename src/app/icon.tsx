import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1DB954',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22%',
          position: 'relative',
        }}
      >
        {/* Spotify-style music icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
          <path d="M8 16c2.5-1.2 5.5-1.2 8 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9 13c2-1 4-1 6 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 10c1.5-.8 3-.8 4.5 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
