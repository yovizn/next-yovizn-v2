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

  // A seamless -50% loop needs a single track at least as wide as the strip, or a
  // blank gap opens at the right edge on wide screens. The body is capped at
  // 2048px, so repeat the (few, short) client names until one track clears it.
  const MAX_STRIP = 2048
  const EST_ITEM = 120 // conservative px per item (padding + short mono name + dot)
  const repeats = Math.max(2, Math.ceil(MAX_STRIP / (clients.length * EST_ITEM)))
  const track: Client[] = Array.from({ length: repeats }, () => clients).flat()

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

      {/* The animated marquee is decorative; expose the real client list once,
          statically, so assistive tech reads each name a single time. */}
      <ul className="sr-only">
        {clients.map((client, index) => (
          <li key={index}>{client.name}</li>
        ))}
      </ul>

      {/* Seamless mono marquee — two identical repeated tracks shifted -50% (see
          globals.css). Pauses on hover so a reader can settle on a name. */}
      <div className="border-hairline overflow-clip border-y">
        <div className="marquee-track flex w-max hover:[animation-play-state:paused]">
          <MarqueeTrack clients={track} ariaHidden />
          <MarqueeTrack clients={track} ariaHidden />
        </div>
      </div>
    </section>
  )
}
