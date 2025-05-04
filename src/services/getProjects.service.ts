import { tryCatch } from "@/lib/utils/tryCatch";
import { client } from "@/sanity/lib/client";
import { queryProjectsOverview, queryProjectsAll, queryProjectsBySlug } from "@/sanity/queries";

export async function getProjectsOverview() {
    const res = await tryCatch(client.fetch(queryProjectsOverview))
    return res
}

export async function getProjectsAll() {
    const res = await tryCatch(client.fetch(queryProjectsAll))
    return res
}

export async function getProjectsBySlug(slug: string) {
    const res = await tryCatch(client.fetch(queryProjectsBySlug, { slug }))
    return res
}