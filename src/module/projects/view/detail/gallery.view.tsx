import { cn } from '@/lib/utils/cn'
import { urlFor } from '@/sanity/lib/image'
import { QueryProjectsBySlugResult } from '@/types/sanity.types'
import { GalleryImage } from './gallery-image.view'

// Film-strip ruler cadence, shared by both transport dividers.
const RULER =
  'repeating-linear-gradient(90deg, var(--color-paper-dim) 0px, var(--color-paper-dim) 1px, transparent 1px, transparent 14px)'

/**
 * TransportDivider — the instrument strip that marks a gallery cut (ruler gauge
 * + optional frame readout + a signal hairline on one edge). Deduplicated from
 * the two near-identical opening/closing dividers.
 */
function TransportDivider({ signalEdge, frames }: { signalEdge: 'top' | 'bottom'; frames?: number }) {
  return (
    <div className="bg-graphite-2 relative col-span-full flex h-16 items-center gap-5 px-6 lg:px-10">
      <div aria-hidden className="h-2.5 flex-1 opacity-20" style={{ backgroundImage: RULER }} />
      {frames ? (
        <p
          className="font-data text-paper-dim shrink-0 text-[11px] tracking-[0.12em] tabular-nums uppercase"
          aria-hidden
        >
          {String(frames).padStart(2, '0')} Frames
        </p>
      ) : null}
      <span
        aria-hidden
        className={cn('bg-signal absolute inset-x-0 h-px', signalEdge === 'top' ? 'top-0' : 'bottom-0')}
      />
    </div>
  )
}

export function ProjectGallery({ projects }: { projects: QueryProjectsBySlugResult | undefined }) {
  const layout = {
    full: 'col-span-full',
    half: 'col-span-full md:col-span-3',
    third: 'col-span-full md:col-span-2',
  }

  const aspect = {
    full: 'aspect-[320/169]',
    half: 'aspect-[320/169]',
    third: 'aspect-[195/422]',
  }

  const sizes = {
    full: '(max-width: 640px) 640px,(max-width: 1024px) 1024px, 100vw',
    half: '(max-width: 640px) 480px,(max-width: 1024px) 720px,(max-width: 1280px) 1024px, 100vw',
    third: '(max-width: 640px) 320px,(max-width: 1024px) 512px,(max-width: 1280px) 768px, 100vw',
  }

  // Real image count drives the opening divider readout (e.g. "06 FRAMES").
  const frameCount = projects?.images?.length ?? 0

  return (
    <section aria-labelledby="gallery-heading" className="col-span-full grid grid-cols-subgrid gap-px">
      {/* Opening divider — marks the Overview→Gallery cut, frame readout + signal edge */}
      <TransportDivider signalEdge="bottom" frames={frameCount} />

      {/* Sticky gallery bar — TRANSPORT restyle; subgrid child kept intact */}
      <div className="sticky top-0 z-20 col-span-full grid h-24 grid-cols-subgrid gap-px">
        <div className="bg-graphite col-span-1 hidden lg:block" />

        <div className="bg-graphite relative col-span-4 grid place-content-center p-4">
          {/* Signal bar — bottom edge */}
          <div className="bg-signal absolute bottom-0 left-0 h-px w-full" aria-hidden />

          {/* CUE eyebrow */}
          <p className="font-data text-paper-dim text-[11px] tracking-[0.12em] uppercase" aria-hidden>
            CUE &nbsp;·&nbsp; GALLERY
          </p>

          {/* Accessible h3 */}
          <h3 id="gallery-heading" className="sr-only">
            Showcase
          </h3>
        </div>

        <div className="bg-graphite col-span-1 hidden lg:block" />
      </div>

      {/* Side gutter */}
      <div className="bg-graphite col-span-1 hidden lg:block" />

      {/* Gallery grid — 6-col subgrid child; DO NOT restructure */}
      <div className="col-span-4 grid grid-cols-6 gap-px">
        {projects?.images.map((item, index) => (
          <div key={item._key} className={cn('clamp-[p,4,10] bg-graphite-2 relative', layout[item.layout])}>
            <GalleryImage
              src={urlFor(item.image).width(1600).auto('format').url()}
              alt={item.image.alt}
              sizes={sizes[item.layout]}
              aspect={aspect[item.layout]}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* Side gutter */}
      <div className="bg-graphite col-span-1 hidden lg:block" />

      {/* Closing divider — quiet terminator, signal edge on top to "shut" the gallery */}
      <TransportDivider signalEdge="top" />
    </section>
  )
}
