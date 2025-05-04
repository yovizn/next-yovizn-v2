import type { Metadata } from 'next'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'

import { env } from '@/configs/env.config'
import { fontVariables } from '@/fonts'

import '@/styles/globals.css'

import GlobalStoreProvider from '@/providers/global-store.provider'

const isDev = process.env.NODE_ENV === 'development'
const baseUrl = isDev ? 'http://localhost:3000' : env.NEXT_PUBLIC_WEBSITE_URL

export const metadata: Metadata = {
  title: {
    default: 'Yovi Zulkarnaen — Frontend Developer',
    template: `%s — ${env.NEXT_PUBLIC_WEBSITE_NAME}`,
  },
  description: env.NEXT_PUBLIC_WEBSITE_DESCRIPTION,
  appleWebApp: {
    title: env.NEXT_PUBLIC_WEBSITE_NAME,
    statusBarStyle: 'black',
  },
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    siteName: env.NEXT_PUBLIC_WEBSITE_NAME,
    title: 'Yovi Zulkarnaen — Frontend Developer',
    description: env.NEXT_PUBLIC_WEBSITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yovi Zulkarnaen — Frontend Developer',
    description: env.NEXT_PUBLIC_WEBSITE_DESCRIPTION,
  },
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
        className="tailwind min-h-screen font-sans antialiased"
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
