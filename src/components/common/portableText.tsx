"use client"

import { PortableTextComponents, PortableText as PortableTextSanity } from 'next-sanity'

import { cn } from '@/lib/utils/cn'
import { BlockContent } from '@/types/sanity.types'

type PortableTextProps = {
  content: BlockContent
  className?: {
    paragraph?: string
    link?: string
    emphasis?: string
    strong?: string
    h2?: string
    h3?: string
    h4?: string
    list?: string
    listItem?: string
    br?: string
  }
}

export function PortableText({ content, className }: PortableTextProps) {
  const components: PortableTextComponents = {
    marks: {
      strong: ({ children }) => (
        <strong className={cn('text-foreground font-medium', className?.strong)}>{children}</strong>
      ),
      em: ({ children }) => (
        <em className={cn('text-foreground italic', className?.emphasis)}>{children}</em>
      ),
      link: ({ children, value }) => (
        <a
          href={value.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('underline underline-offset-4', className?.link)}
        >
          {children}
        </a>
      ),
    },
    block: {
      normal: ({ children }) => <p className={cn('text-base', className?.paragraph)}>{children}</p>,
      h2: ({ children }) => (
        <h2 className={cn('font-helvetica text-2xl font-bold', className?.h2)}>{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className={cn('font-helvetica text-xl font-bold', className?.h3)}>{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className={cn('font-helvetica text-lg font-bold', className?.h4)}>{children}</h4>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className={cn('grid list-disc gap-2.5 px-5 md:text-lg 2xl:gap-5', className?.list)}>
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className={cn('grid list-decimal gap-2.5 px-5 md:text-lg 2xl:gap-5', className?.list)}>
          {children}
        </ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => (
        <li className={cn('text-muted-foreground marker:text-primary', className?.listItem)}>
          {children}
        </li>
      ),
      number: ({ children }) => (
        <li className={cn('text-muted-foreground marker:text-foreground', className?.listItem)}>
          {children}
        </li>
      ),
    },
    hardBreak: () => <br className={cn('block h-4', className?.br)} />,
  }

  return <PortableTextSanity value={content} components={components} />
}
