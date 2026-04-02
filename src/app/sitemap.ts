import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const domain = headersList.get('host') || 'jemariapp.com'
  const slug = headersList.get('x-tenant-slug') || 'flex'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${domain}`

  const now = new Date()

  // 1. ROOT MARKETPLACE ENGINE
  if (slug === 'root') {
    return [
      {
        url: baseUrl,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
         url: `${baseUrl}/login`,
         lastModified: now,
         changeFrequency: 'monthly',
         priority: 0.8,
       },
       {
         url: `${baseUrl}/register`,
         lastModified: now,
         changeFrequency: 'monthly',
         priority: 0.8,
       }
    ]
  }

  // 2. ISOLATED TENANT ENGINE
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  
  if (!tenant) {
     return [ { url: baseUrl, lastModified: now, changeFrequency: 'yearly', priority: 0.1 } ]
  }

  const sitemapData: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: tenant.updatedAt,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Map Active Therapists to Public Deep-Dives
  const therapists = await prisma.flexologist.findMany({ 
     where: { tenantId: tenant.id, isActive: true },
     select: { id: true }
  })

  therapists.forEach(t => {
     sitemapData.push({
        url: `${baseUrl}/therapist/${t.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
     })
  })

  // Expose the global booking loop specifically for this tenant
  sitemapData.push({
    url: `${baseUrl}/book`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  })

  return sitemapData
}
