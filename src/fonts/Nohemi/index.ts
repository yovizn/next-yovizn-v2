import local from 'next/font/local'

export const nohemi = local({
  src: [
    {
      path: './Nohemi-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: './Nohemi-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './Nohemi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './Nohemi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './Nohemi-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './Nohemi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-nohemi',
  display: 'auto',
  style: 'normal',
})
