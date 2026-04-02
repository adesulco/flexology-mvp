import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const domain = headersList.get('host') || 'jemariapp.com'
  const isProd = process.env.NODE_ENV === 'production'

  // If local dev or Vercel preview, block indexing.
  if (!isProd || domain.includes('vercel.app')) {
    return {
      rules: { userAgent: '*', disallow: '/' }
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/', '/ jemari-hub/', '/profile/', '/login/', '/register/'],
    },
    sitemap: `https://${domain}/sitemap.xml`,
  }
}
