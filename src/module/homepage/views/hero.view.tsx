import { RevealText } from '@/components/animations/text/reveal.text'
import WhiteOne from '@public/images/white-one.jpg'
import Image from 'next/image'

export async function Hero() {
  return (
    <header className="grid grid-cols-4 gap-px lg:grid-cols-6 xl:grid-cols-8">
      <div className="col-span-full grid grid-cols-subgrid gap-px">
        <div className="col-span-full row-span-1 grid grid-cols-8 gap-px">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-background col-span-4 h-24" />
          ))}
        </div>

        <div className="relative z-20 col-span-full grid aspect-[8/calc(400/180)] w-full grid-cols-subgrid gap-px">
          <h1 className="sr-only">Yovizn, Frontend Developer</h1>

          <div
            aria-hidden
            className="bg-background clamp-[text,3xl,11rem] z-20 col-span-2 grid place-content-center px-4 md:place-content-end lg:col-span-3 xl:col-span-4"
          >
            <RevealText
              text="yovizn."
              className={{
                text: 'font-sans leading-none font-bold uppercase',
              }}
            />
          </div>

          <div
            aria-hidden
            className="bg-background text-hero z-10 col-span-2 flex flex-col justify-center p-4 sm:items-center lg:col-span-3 xl:col-span-4"
          >
            <RevealText
              text="frontend"
              className={{
                text: 'font-mono text-[0.5em] leading-none tracking-wider capitalize sm:text-[0.35em]',
              }}
              delay={0.3}
            />
            <RevealText
              text="dev"
              className={{
                text: 'font-nohemi text-[0.65em] leading-none font-bold tracking-wider uppercase sm:text-[0.4em]',
              }}
              delay={0.4}
            />
          </div>
        </div>
        <div className="col-span-full row-span-1 grid grid-cols-3 gap-px lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-background grid aspect-square place-content-center">
              <div className="font-mono text-xs uppercase">company-{index + 1}</div>
            </div>
          ))}
        </div>

        <div className="relative col-span-full grid grid-cols-4 gap-[1px] lg:auto-rows-[12.5cqi] lg:grid-cols-8">
          <div className="bg-background clamp-[p,4,14] @container col-span-4 lg:row-span-2">
            <h2 className="mt-2 mb-4 font-mono leading-none font-light uppercase sm:mb-6 sm:text-lg">
              <span className="sr-only">Hello, I'm Yovi.</span>
              <RevealText text="Hello, I'm Yovi." />
            </h2>

            <p className="clamp-[text,xs,5xl,@xs,@7xl] font-medium">
              <span className="sr-only">
                I'm a front-end developer who loves working on web interactions, responsive design,
                and slick animations. Still got a lot to learn, but hey—we all start somewhere.
              </span>
              <RevealText
                text="I'm a front-end developer who loves working on web interactions, responsive design, and slick animations. Still got a lot to learn, but hey—we all start somewhere."
                amount={[40, 50]}
                delay={0.5}
              />
            </p>
          </div>

          <div className="bg-background p-fluid-24-40 relative col-span-4 aspect-video lg:aspect-auto h-auto lg:row-span-2">
            <Image src={WhiteOne} alt="Image White One" fill className="object-cover" />
          </div>
        </div>
      </div>
    </header>
  )
}
