import { client } from '@/sanity/lib/client'
import { queryClientsView } from '@/sanity/queries'
import { tryCatch } from '@/lib/utils/tryCatch'

export async function getClientsView() {
  const res = tryCatch(client.fetch(queryClientsView))
  return res
}
