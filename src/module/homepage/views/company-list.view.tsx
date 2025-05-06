import { GAnchor } from '@/components/common/googleAnchor'
import { urlFor } from '@/sanity/lib/image'
import { getClientsView } from '@/services/getClientsView.service'
import { Image } from 'next-sanity/image'

export async function CompanyList() {
  const [data, error] = await getClientsView()

  if (error || !data?.clients) return null

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-px">
      <div className="col-span-full row-span-1 grid grid-cols-3 gap-px lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => {
          const clients = data.clients?.[index]
          if (!clients)
            return (
              <div key={index} className="bg-background grid aspect-square place-content-center" />
            )

          return (
            <GAnchor
              key={index}
              href={clients.link || '#'}
              className="bg-background group grid aspect-square place-content-center"
            >
              <Image
                src={urlFor(clients.logo).url()}
                alt={clients.logo.alt}
                width={100}
                height={100}
                className="clamp-[size,60px,70px] aspect-video object-contain transition-opacity duration-500 group-hover:opacity-70"
              />
            </GAnchor>
          )
        })}
      </div>
    </div>
  )
}
