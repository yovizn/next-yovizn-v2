import { PortableText } from '@/components/common/portableText'
import { BlockContent } from '@/types/sanity.types'

export function ProjectDetailContent({ content }: { content: BlockContent | undefined }) {
  return (
    <article className="col-span-full grid grid-cols-subgrid gap-px">
      <div className="bg-background col-span-1 hidden lg:block"></div>
      <div className="bg-background clamp-[p,4,10] clamp-[py,6,12] col-span-full lg:col-span-4">
        <h2 className="clamp-[text,2xl,4xl] font-helvetica before:bg-foreground relative mb-6 px-2 leading-none font-bold before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:-translate-x-full">
          Description
        </h2>

        <div className="prose-sm lg:prose-2xl">
          {content && <PortableText content={content} />}
        </div>
      </div>
      <div className="bg-background col-span-1 hidden lg:block"></div>
    </article>
  )
}
