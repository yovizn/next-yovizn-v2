import { cn } from '@/lib/utils/cn'
import { urlFor } from '@/sanity/lib/image'
import { QueryProjectsBySlugResult } from '@/types/sanity.types'
import Image from 'next/image'

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
    <section
      aria-labelledby="gallery-heading"
      className="col-span-full grid grid-cols-subgrid gap-px"
    >
      {/* Transport divider — marks the Overview→Gallery cut as a deliberate
          instrument strip (ruler + frame readout + signal edge). Replaces the
          old empty spacer squares, which read as unfilled gallery cells. */}
      <div className="bg-graphite-2 relative col-span-full flex h-16 items-center gap-5 px-6 lg:px-10">
        {/* Ruler ticks — film-strip cadence, decorative gauge */}
        <div
          aria-hidden
          className="h-2.5 flex-1 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--color-paper-dim) 0px, var(--color-paper-dim) 1px, transparent 1px, transparent 14px)',
          }}
        />
        {/* Instrument readout — real frame total. aria-hidden: decorative chrome,
            consistent with the ruler + the CUE eyebrows; gallery images carry
            their own alt text and the "Showcase" heading announces the section. */}
        {frameCount > 0 && (
          <p
            className="font-data text-paper-dim shrink-0 text-[11px] tracking-[0.12em] uppercase tabular-nums"
            aria-hidden
          >
            {String(frameCount).padStart(2, '0')} Frames
          </p>
        )}
        {/* Signal hairline — bottom edge, ties to hero + gallery-bar signal lines */}
        <span aria-hidden className="bg-signal absolute inset-x-0 bottom-0 h-px" />
      </div>

      {/* Sticky gallery bar — TRANSPORT restyle; subgrid child kept intact */}
      <div className="sticky top-0 z-20 col-span-full grid h-24 grid-cols-subgrid gap-px">
        <div className="bg-graphite col-span-1 hidden lg:block" />

        <div className="bg-graphite relative col-span-4 grid place-content-center p-4">
          {/* Signal bar — bottom edge */}
          <div className="bg-signal absolute bottom-0 left-0 h-px w-full" aria-hidden />

          {/* CUE eyebrow */}
          <p
            className="font-data text-paper-dim text-[11px] tracking-[0.12em] uppercase"
            aria-hidden
          >
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
        {projects?.images.map((item) => (
          <div
            key={item._key}
            className={cn('relative clamp-[p,4,10] bg-graphite-2', layout[item.layout])}
          >
            <div className={cn('relative overflow-hidden rounded-sm', aspect[item.layout])}>
              <Image
                src={urlFor(item.image).width(1600).auto('format').url()}
                alt={item.image.alt}
                fill
                sizes={sizes[item.layout]}
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Side gutter */}
      <div className="bg-graphite col-span-1 hidden lg:block" />

      {/* Closing divider — quiet terminator band; mirrors the opening divider
          with the signal edge on top to "shut" the gallery before the next case. */}
      <div className="bg-graphite-2 relative col-span-full flex h-16 items-center px-6 lg:px-10">
        <div
          aria-hidden
          className="h-2.5 w-full opacity-[0.12]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--color-paper-dim) 0px, var(--color-paper-dim) 1px, transparent 1px, transparent 14px)',
          }}
        />
        {/* Signal hairline — top edge, closes the gallery */}
        <span aria-hidden className="bg-signal absolute inset-x-0 top-0 h-px" />
      </div>
    </section>
  )
}
