import { client } from '@/sanity/lib/client'
import { queryClientsView } from '@/sanity/queries'
import { tryCatch } from '@/lib/utils/tryCatch'

export async function getClientsView() {
  // Tags for the Sanity webhook (/api/revalidate → revalidateTag(_type)): the
  // view doc itself + the dereferenced `clients[]->` docs it embeds.
  const res = tryCatch(client.fetch(queryClientsView, {}, { next: { tags: ['clientsView', 'clients'] } }))
  return res
}
