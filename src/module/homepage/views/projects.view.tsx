import { ViewCursor, ViewCursorTrigger } from '@/components/animations/cursor/view.cursor'
import { TextBlur } from '@/components/animations/text/blur.text'
import { urlFor } from '@/sanity/lib/image'
import { QueryProjectsOverviewResult } from '@/types/sanity.types'
import { ArrowDown } from 'lucide-react'
import Image from 'next/image'

export function Projects({ data }: { data: QueryProjectsOverviewResult }) {
  return (
    <section className="col-span-full grid grid-cols-subgrid gap-px">
      <div className="col-span-full row-span-1 grid grid-cols-8 gap-px">
        {Array.from({ length: 8 }).map((_, index) => {
          return (
            <div key={index} className="bg-background grid aspect-square place-content-center" />
          )
        })}
      </div>

      <div className="relative z-20 col-span-full grid aspect-[8/calc(200/180)] w-full grid-cols-4 gap-px">
        <h3 className="sr-only">Here&apos;s my recent projects</h3>

        <div
          aria-hidden
          className="bg-background z-20 col-span-1 grid place-content-end p-1 sm:p-4"
        ></div>

        <div
          aria-hidden
          className="bg-background before:bg-foreground relative z-10 col-span-2 flex flex-col justify-center p-4 before:absolute before:bottom-0 before:left-0 before:h-full before:w-1 before:content-[''] sm:items-center"
        >
          <TextBlur
            text="Recent"
            className="clamp-[text,xl,2xl] font-sans leading-none font-bold uppercase"
          />

          <TextBlur
            text="Projects"
            className="clamp-[text,3xl,7xl] font-sans leading-none font-bold uppercase"
          />
        </div>

        <div
          aria-hidden
          className="bg-background z-20 col-span-1 grid place-content-end p-1 sm:p-4"
        >
          <ArrowDown className="clamp-[size,1rem,3rem]" />
        </div>
      </div>
      <div className="bg-background sticky top-0 z-30 col-span-full h-24"></div>

      <ViewCursor as="ul" className="col-span-full grid gap-px lg:grid-cols-2">
        {data.map((project) => {
          return (
            <li
              key={project.slug.current}
              className="bg-background relative aspect-video overflow-clip"
            >
              <ViewCursorTrigger
                key={project.slug.current}
                href={`/projects/${project.slug.current}`}
                className="size-full"
              >
                <Image
                  fill
                  src={urlFor(project.cover).url()}
                  alt={project.cover.alt}
                  sizes="(max-width: 640px) 640px,(max-width: 1024px) 1024px,(max-width: 1280px) 1280px, 100vw"
                  className="size-full object-cover grayscale-100"
                />
              </ViewCursorTrigger>
            </li>
          )
        })}
      </ViewCursor>
    </section>
  )
}
