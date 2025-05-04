import { TextReveal } from '@/components/animations/text/reveal.text'

export async function Hero() {
  return (
    <section className="col-span-full grid grid-cols-subgrid gap-px">
      <div className="relative z-20 col-span-full grid aspect-[8/calc(400/180)] w-full grid-cols-subgrid gap-px">
        <h1 className="sr-only">Yovizn, Frontend Developer</h1>

        <div
          aria-hidden
          className="bg-background clamp-[text,3xl,11rem] z-20 col-span-2 grid place-content-center px-4 md:place-content-end lg:col-span-3 xl:col-span-4"
        >
          <TextReveal
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
          <TextReveal
            text="frontend"
            className={{
              text: 'font-mono text-[0.5em] leading-none tracking-wider capitalize sm:text-[0.35em]',
            }}
            delay={0.3}
          />
          <TextReveal
            text="dev"
            className={{
              text: 'font-nohemi text-[0.65em] leading-none font-bold tracking-wider uppercase sm:text-[0.4em]',
            }}
            delay={0.4}
          />
        </div>
      </div>
    </section>
  )
}
