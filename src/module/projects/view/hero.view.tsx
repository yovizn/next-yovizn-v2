import { TextBlur } from "@/components/animations/text/blur.text";

export function Hero() {
  return <section className="col-span-full grid grid-cols-6 gap-px">
  <h1 className="sr-only">discover all my projects</h1>

  <div className="bg-background col-span-1"></div>

  <div className="bg-background clamp-[p,4,10] before:bg-foreground relative col-span-4 grid place-content-center leading-none font-bold uppercase before:absolute before:top-0 before:h-1 before:w-full before:content-['']">
    <TextBlur text="Discover" className="clamp-[text,2xl,4xl]" />
    <TextBlur text="Projects" delay={0.5} direction="left" className="clamp-[text,4xl,7xl]" />
  </div>

  <div className="bg-background col-span-1"></div>
</section>
}
