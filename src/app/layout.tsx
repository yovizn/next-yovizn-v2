import type { Metadata } from 'next'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'

import { env } from '@/configs/env.config'
import { fontVariables } from '@/fonts'

import '@/styles/globals.css'
import GlobalStoreProvider from '@/providers/global-store.provider'

export const metadata: Metadata = {
  title: {
    default: 'Yovi Zulkarnaen - Frontend Developer',
    template: `${env.NEXT_PUBLIC_WEBSITE_NAME} %s`,
  },
  description: env.NEXT_PUBLIC_WEBSITE_DESCRIPTION,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isProduction = process.env.NODE_ENV === 'production'

  return (
    <html lang="en" className={fontVariables}>
      {isProduction && <GoogleTagManager gtmId={env.NEXT_PUBLIC_GTM_ID} />}
      <body
        className="tailwind font-sans antialiased min-h-screen"
        style={{ overflow: 'auto', scrollbarWidth: 'none' }}
      >
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${env.NEXT_PUBLIC_GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <GlobalStoreProvider>{children}</GlobalStoreProvider>
      </body>

      {isProduction && <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />}
    </html>
  )
}
