'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { useEffect } from 'react'

import { TLink } from '@/components/common/transitionLink'
import { useCursor } from '@/hooks/stores/useCursor.hook'
import { cn } from '@/lib/utils/cn'
import { urlFor } from '@/sanity/lib/image'
import { QueryProjectsAllResult } from '@/types/sanity.types'

const size = {
  width: 400,
  height: 400,
}

export function ProjectsList({ data }: { data: QueryProjectsAllResult }) {
  const { setCursor } = useCursor()

  useEffect(() => {
    setCursor({ size, children: <RenderCursor data={data} /> })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <section className="col-span-full grid gap-px md:grid-cols-6">
      <div className="bg-background col-span-1 hidden md:block"></div>

      <div
        className="col-span-4 grid grid-cols-subgrid gap-px"
        onMouseLeave={() => setCursor({ isVisible: false })}
      >
        {data.map((project, index) => {
          return (
            <TLink
              href={`/projects/${project.slug.current}`}
              key={project.slug.current}
              onMouseOver={() => {
                setCursor({ index, isVisible: true })
              }}
              className="col-span-full grid grid-cols-6 gap-px md:grid-cols-4"
            >
              {/* <div className="bg-background col-span-2 hidden md:block md:col-span-1 px-4 py-3 sm:py-10"></div> */}
              <div className="bg-background before:bg-foreground font-helvetica clamp-[px,4,10] clamp-[py,6,12] relative col-span-4 font-medium before:absolute before:top-0 before:left-0 before:h-1/2 before:w-1 before:content-[''] md:col-span-3">
                <span className="clamp-[text,sm,4xl] line-clamp-1">{project.title}</span>
              </div>
              <p className="bg-background clamp-[px,4,10] clamp-[py,6,12] col-span-2 md:col-span-1">
                <span className="clamp-[text,xs,xl] line-clamp-1 leading-none md:line-clamp-none">
                  {project.service}
                </span>
              </p>
            </TLink>
          )
        })}
      </div>

      <div className="bg-background col-span-1 hidden md:block"></div>
    </section>
  )
}

const RenderCursor = ({ data }: { data: QueryProjectsAllResult }) => {
  const { height, width } = size
  const {
    cursor: { index },
  } = useCursor()

  const colors = {
    0: 'bg-blue-300',
    1: 'bg-neutral-500',
    2: 'bg-accent',
    3: 'bg-orange-200',
  }

  return (
    <div className="pointer-events-none relative overflow-hidden" style={{ height, width }}>
      <motion.ul animate={{ y: `${index * -100}%` }} transition={{ duration: 0.2 }}>
        {data.map((project, idx) => {
          const randomColor = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3
          const color = colors[randomColor]

          return (
            <li
              key={project.slug.current}
              className={cn(
                'relative grid place-content-center p-6 transition-colors duration-500',
                color,
                idx !== 0 ? 'absolute left-0' : '',
              )}
              style={{ width, height, top: idx !== 0 ? `${idx * 100}%` : '' }}
            >
              <Image
                src={urlFor(project.cover).url()}
                alt={project.cover.alt}
                width={width}
                height={height}
                className="aspect-video size-auto object-contain"
              />
            </li>
          )
        })}
      </motion.ul>
    </div>
  )
}
