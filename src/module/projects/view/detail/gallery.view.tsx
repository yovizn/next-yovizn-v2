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

  return (
    <section className="col-span-full grid grid-cols-subgrid gap-px">
      <div className="col-span-full grid grid-cols-6 gap-px">
        {Array.from({ length: 6 }).map((_, index) => {
          return <div key={index} className="bg-background aspect-square"></div>
        })}
      </div>

      <div className="sticky top-0 z-20 col-span-full grid h-24 grid-cols-subgrid gap-px">
        <div className="bg-background col-span-1 hidden lg:block"></div>
        <div className="bg-background before:bg-foreground relative col-span-4 grid place-content-center p-4 uppercase before:absolute before:bottom-0 before:left-0 before:h-1 before:w-full">
          <h3 className="clamp-[text,2xl,4xl] font-helvetica px-2 leading-none font-bold">
            Showcase
          </h3>
        </div>
        <div className="bg-background col-span-1 hidden lg:block"></div>
      </div>

      <div className="bg-background col-span-1 hidden lg:block"></div>

      <div className="col-span-4 grid grid-cols-6 gap-px">
        {projects?.images.map((item) => {
          return (
            <div key={item._key} className={cn('relative clamp-[p,4,10] bg-background', layout[item.layout])}>
              <div className={cn('relative rounded-sm overflow-hidden', aspect[item.layout])}>
                <Image
                  src={urlFor(item.image).url()}
                  alt={item.image.alt}
                  fill
                  sizes={sizes[item.layout]}
                  className="object-cover"
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-background col-span-1 hidden lg:block"></div>
      <div className="col-span-full grid grid-cols-4 gap-px">
        {Array.from({ length: 4 }).map((_, index) => {
          return <div key={index} className="bg-background aspect-square"></div>
        })}
      </div>
    </section>
  )
}
