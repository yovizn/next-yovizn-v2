import { defineQuery } from 'next-sanity'

export const queryClientsView = defineQuery(
  `*[_type == "clientsView"][0]{
        clients[]->{
            name,
            logo,
            link
        }
    }`,
)

export const queryProjectsOverview = defineQuery(
  `*[_type == 'projects'][0...4] | order(date desc){
        slug,
        cover,
    }`,
)

export const queryProjectsAll = defineQuery(
  `*[_type == 'projects'] | order(date desc){
        slug,
        cover,
        title,
        service,
        date,
        _updatedAt,
        _createdAt,
    }`,
)

export const queryProjectsBySlug = defineQuery(
  `*[_type == 'projects' && slug.current == $slug][0]{
        ...,
        client->{
            logo,
            link
        },
    }`,
)
