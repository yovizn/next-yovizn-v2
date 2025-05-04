import { MetadataRoute } from 'next'
import { env } from '@/configs/env.config'

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NODE_ENV === 'production' ? env.NEXT_PUBLIC_WEBSITE_URL : 'http://localhost:3000'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/about', '/projects', '/projects/*'],
      disallow: ['/workspace'],
    },
    // Reference only the sitemap index
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
