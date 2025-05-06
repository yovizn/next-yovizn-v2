import { Header1 } from '@/components/ui/header-1'
import { CompanyList } from '@/module/homepage/views/company-list.view'
import { Hero } from '@/module/homepage/views/hero.view'
import { Overview } from '@/module/homepage/views/overview.view'
import { Projects } from '@/module/homepage/views/projects.view'
import { getProjectsOverview } from '@/services/getProjects.service'
import { notFound } from 'next/navigation'

export default async function HomePage() {
  const [data, error] = await getProjectsOverview()

  if (error || !data) notFound()

  return (
    <main className="grid grid-cols-4 gap-px lg:grid-cols-6 xl:grid-cols-8">
      <Header1 />

      <Hero />

      <CompanyList />

      <Overview />

      <Projects data={data} />
    </main>
  )
}
