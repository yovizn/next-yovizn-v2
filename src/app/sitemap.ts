import { env } from '@/configs/env.config'
import { getProjectsAll } from '@/services/getProjects.service'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NODE_ENV === 'production' ? env.NEXT_PUBLIC_WEBSITE_URL : 'http://localhost:3000'
  const [allProjects] = await getProjectsAll()

  const projects = allProjects || []

  const projectRoutes = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug.current}`,
    lastModified: new Date(project._updatedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
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
    ...projectRoutes,
  ]
}
