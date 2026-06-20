import { GAnchor } from '@/components/common/googleAnchor'
import { KineticText } from '@/components/animations/text/kinetic.text'
import { urlFor } from '@/sanity/lib/image'
import { getClientsView } from '@/services/getClientsView.service'
import { Image } from 'next-sanity/image'

export async function CompanyList() {
  const [data, error] = await getClientsView()

  if (error || !data?.clients) return null

  return (
    <section aria-labelledby="clients-heading" className="col-span-full">
      {/* CUE 03 eyebrow */}
      <p
        className="font-data text-paper-dim px-6 pt-16 pb-4 text-[11px] tracking-[0.12em] uppercase lg:px-10"
        aria-hidden
      >
        CUE 03 &nbsp;·&nbsp; CLIENTS
      </p>

      {/* Section header: sr-only first, KineticText second (a11y requirement) */}
      <h2 id="clients-heading" className="sr-only">
        Clients
      </h2>
      <div aria-hidden className="px-6 pb-8 lg:px-10">
        <KineticText
          text="Clients"
          by="char"
          stagger={0.035}
          className="font-nohemi text-paper clamp-[text,3xl,7xl] leading-none font-bold uppercase"
        />
      </div>

      {/* Logo wall — DOM/SVG, staggered reveal via animation-delay CSS */}
      <div className="border-graphite-2 grid grid-cols-3 gap-px border-t lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => {
          const client = data.clients?.[index]
          if (!client)
            return (
              <div
                key={index}
                className="bg-graphite-2 grid aspect-square place-content-center"
              />
            )

          const logo = (
            <Image
              src={urlFor(client.logo).url()}
              alt={client.logo.alt}
              width={100}
              height={100}
              // Quiet monochrome wall at rest (grayscale + dim) so mixed-brand
              // logos read as one cohesive row on the dark theme; hover/focus
              // brings the real client to life in full colour. Opacity+filter
              // only — no scale (a tight grid + everything-scales reads as noise).
              className="clamp-[size,56px,70px] aspect-video object-contain opacity-60 grayscale transition-[opacity,filter] duration-500 group-hover:opacity-100 group-hover:grayscale-0 group-focus-within:opacity-100 group-focus-within:grayscale-0"
            />
          )
          const cellClass =
            'bg-graphite-2 group grid aspect-square place-content-center transition-colors duration-300 hover:bg-graphite'

          // Only emit an anchor when there's a real destination — a linkless
          // client previously rendered a focusable href="#" no-op (dead link).
          return client.link ? (
            <GAnchor
              key={index}
              href={client.link}
              className={cellClass}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {logo}
            </GAnchor>
          ) : (
            <div key={index} className={cellClass} style={{ animationDelay: `${index * 0.08}s` }}>
              {logo}
            </div>
          )
        })}
      </div>
    </section>
  )
}
