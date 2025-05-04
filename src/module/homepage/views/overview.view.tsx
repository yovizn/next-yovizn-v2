import { TextReveal } from '@/components/animations/text/reveal.text'
import { OverviewImage } from './overview-image.view'

export function Overview() {
  return (
    <div className="relative col-span-full grid grid-cols-subgrid gap-px">
      <div className="bg-foreground relative col-span-full grid grid-cols-4 gap-14 lg:auto-rows-[12.5cqi] lg:grid-cols-8">
        <div className="bg-foreground sticky block sm:hidden top-0 z-20 col-span-full h-24"></div>

        <div className="text-background clamp-[p,4,14] @container col-span-4 lg:row-span-2">
          <h2 className="clamp-[text,lg,xl,@xs,@7xl] mt-2 mb-4 leading-none font-light sm:mb-6">
            <span className="sr-only">Hello, I&apos;m Yovi.</span>
            <TextReveal text="Hello, I'm Yovi." />
          </h2>

          <p className="clamp-[text,base,5xl,@xs,@7xl] font-medium">
            <span className="sr-only">
              I&apos;m a front-end developer who loves working on web interactions, responsive
              design, and slick animations. Still got a lot to learn, but hey—we all start
              somewhere.
            </span>
            <TextReveal
              text="I'm a front-end developer who loves working on web interactions, responsive design, and slick animations. Still got a lot to learn, but hey—we all start somewhere."
              highlight={['start somewhere.']}
              amount={[40, 50]}
              delay={0.5}
            />
          </p>
        </div>

        <OverviewImage />
      </div>
    </div>
  )
}
