import { ImageResponse } from 'next/og'

export const alt = 'yovizn logo'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <svg
          id="b"
          xmlns="http://www.w3.org/2000/svg"
          fill="black"
          style={{ width: '500px', height: '500px' }}
          viewBox="0 0 1000 1000"
        >
          <g id="c">
            <g>
              <rect width="1000" height="1000" fill="none" opacity="0" strokeWidth="0" />
              <polygon
                points="395.46 828.6 696.03 308 94.89 308 395.46 828.6"
                fill="currentColor"
                strokeWidth="0"
              />
              <rect
                x="717.6"
                y="162.83"
                width="83.56"
                height="438.15"
                transform="translate(292.69 -328.53) rotate(30)"
                fill="currentColor"
                strokeWidth="0"
              />
            </g>
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    },
  )
}
