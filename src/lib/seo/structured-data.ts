import type {
  BreadcrumbList,
  CreativeWork,
  Graph,
  IdReference,
  Organization,
  Person,
  WebSite,
  WithContext,
} from 'schema-dts'

import { env } from '@/configs/env.config'
import { socials } from '@/lib/constants/social.constant'
import { urlFor } from '@/sanity/lib/image'
import type { QueryProjectsBySlugResult } from '@/types/sanity.types'

const SITE_URL = env.NEXT_PUBLIC_WEBSITE_URL
const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`

const personRef: IdReference = { '@id': PERSON_ID }

/** Stable Person + WebSite entity graph. Entity-only (no rich snippet). */
export function buildPersonGraph(): Graph {
  const sameAs = socials.filter((s) => s.href.startsWith('http')).map((s) => s.href)

  const person: Person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Yovi Zulkarnaen',
    url: SITE_URL,
    jobTitle: 'Frontend Developer',
    description: env.NEXT_PUBLIC_WEBSITE_DESCRIPTION,
    sameAs,
  }

  const website: WebSite = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: env.NEXT_PUBLIC_WEBSITE_NAME,
    description: env.NEXT_PUBLIC_WEBSITE_DESCRIPTION,
    publisher: personRef,
    author: personRef,
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [person, website],
  }
}

export type BreadcrumbItem = { name: string; url: string }

/** The only structured-data type that yields a visible Google rich result. */
export function buildBreadcrumbList(items: BreadcrumbItem[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/** CreativeWork for a project detail page. Authorship via creator/sourceOrganization. */
export function buildCreativeWork(
  project: NonNullable<QueryProjectsBySlugResult>,
): WithContext<CreativeWork> {
  const work: WithContext<CreativeWork> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${SITE_URL}/projects/${project.slug.current}#creativework`,
    name: project.title,
    description: project.description,
    url: `${SITE_URL}/projects/${project.slug.current}`,
    image: urlFor(project.cover).width(1200).height(630).url(),
    genre: project.service,
    dateCreated: project._createdAt,
    dateModified: project._updatedAt,
    datePublished: project.date,
    creator: personRef,
  }

  if (project.client) {
    const organization: Organization = {
      '@type': 'Organization',
      name: project.client.name,
      ...(project.client.link ? { url: project.client.link } : {}),
      ...(project.client.logo ? { logo: urlFor(project.client.logo).url() } : {}),
    }
    work.sourceOrganization = organization
  }

  return work
}
