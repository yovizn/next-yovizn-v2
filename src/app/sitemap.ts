import { env } from '@/configs/env.config'
import { getProjectsAll } from '@/services/getProjects.service'
import { MetadataRoute } from 'next'

export async function generateSitemaps() {
  const [data] = await getProjectsAll()
  const totalProjects = data?.length || 0

  const projectsPerSitemap = 10000
  const totalSitemaps = Math.ceil(totalProjects / projectsPerSitemap)

  return Array.from({ length: totalSitemaps }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NODE_ENV === 'production' ? env.NEXT_PUBLIC_WEBSITE_URL : 'http://localhost:3000'
  const [allProjects] = await getProjectsAll()

  const projects = allProjects || []

  const projectsPerSitemap = 10000
  const start = id * projectsPerSitemap
  const end = start + projectsPerSitemap
  const sitemapProjects = projects.slice(start, end)

  const staticRoutes = (
    id === 0
      ? [
          {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
          },
          {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          },
          {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          },
        ]
      : []
  ) as MetadataRoute.Sitemap

  const projectRoutes = sitemapProjects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug.current}`,
    lastModified: new Date(project._updatedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) as MetadataRoute.Sitemap

  return [...staticRoutes, ...projectRoutes]
}
