import { Cue } from '@/components/common/cue'
import { getClientsView } from '@/services/getClientsView.service'

type Client = { name: string | null }

function MarqueeTrack({ clients, ariaHidden }: { clients: Client[]; ariaHidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {clients.map((client, index) => (
        <li key={index} className="flex items-center">
          <span className="font-data text-paper px-8 py-6 text-sm tracking-[0.12em] whitespace-nowrap uppercase">
            {client.name}
          </span>
          <span className="text-signal select-none" aria-hidden>
            ·
          </span>
        </li>
      ))}
    </ul>
  )
}

export async function CompanyList() {
  const [data, error] = await getClientsView()

  if (error || !data?.clients?.length) return null

  const clients: Client[] = data.clients

  return (
    <section
      aria-labelledby="clients-heading"
      // KEEP IN SYNC with the eyebrow below — TransportRail scroll-spies data-cue.
      data-cue="CUE 03 · CLIENTS"
      className="col-span-full"
    >
      {/* CUE 03 eyebrow — mirrors data-cue on the <section> (TransportRail reads it) */}
      <Cue aria-hidden className="px-6 pt-16 pb-4 lg:px-10">
        CUE 03 &nbsp;·&nbsp; CLIENTS
      </Cue>

      <h2 id="clients-heading" className="sr-only">
        Clients
      </h2>

      {/* Seamless mono marquee — two identical tracks shifted -50% (see globals.css) */}
      <div className="border-hairline overflow-clip border-y">
        <div className="marquee-track flex w-max">
          <MarqueeTrack clients={clients} />
          <MarqueeTrack clients={clients} ariaHidden />
        </div>
      </div>
    </section>
  )
}
