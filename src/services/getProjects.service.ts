import { tryCatch } from "@/lib/utils/tryCatch";
import { client } from "@/sanity/lib/client";
import { queryProjectsOverview, queryProjectsAll, queryProjectsBySlug } from "@/sanity/queries";

// Cache tags drive on-demand revalidation: the Sanity webhook (/api/revalidate)
// calls revalidateTag(_type) on edit. 'projects' covers every projects query;
// the by-slug detail also dereferences a `client->`, so it additionally carries
// 'clients' to purge when a referenced client doc changes.

export async function getProjectsOverview() {
    const res = await tryCatch(client.fetch(queryProjectsOverview, {}, { next: { tags: ['projects'] } }))
    return res
}

export async function getProjectsAll() {
    const res = await tryCatch(client.fetch(queryProjectsAll, {}, { next: { tags: ['projects'] } }))
    return res
}

export async function getProjectsBySlug(slug: string) {
    const res = await tryCatch(client.fetch(queryProjectsBySlug, { slug }, { next: { tags: ['projects', 'clients'] } }))
    return res
}