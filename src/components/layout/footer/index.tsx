import { ArrowDownLeft } from 'lucide-react'

import { Li } from '@/components/animations/li.animation'
import { TextBlur } from '@/components/animations/text/blur.text'
import { GAnchor } from '@/components/common/googleAnchor'
import { socials } from '@/lib/constants/social.constant'

export function Footer() {
  return (
    <footer className="border-accent/5 bg-accent/5 grid grid-cols-4 gap-px border-t lg:grid-cols-6">
      <div className="col-span-full grid grid-cols-6 gap-px">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-background grid place-content-end">
            {index === 5 && <ArrowDownLeft className="clamp-[size,3rem,7rem] justify-self-end" />}
          </div>
        ))}
      </div>

      <div className="col-span-full grid grid-cols-subgrid gap-px">
        <div className="hidden grid-rows-2 gap-px lg:grid">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bg-background aspect-square" />
          ))}
        </div>

        <div className="bg-background before:bg-foreground relative col-span-full grid place-content-center before:absolute before:h-1 before:w-full before:content-[''] lg:col-span-4">
          <h3 className="clamp-[text,5rem,8rem] font-nohemi flex flex-col py-4 leading-none font-bold uppercase">
            <div className="flex gap-4 self-start md:gap-10">
              <TextBlur text="Get" className="" delay={0.3} />
              <TextBlur text="In" className="" delay={0.5} />
            </div>
            <div className="self-end">
              <TextBlur text="Touch" direction="left" className="" delay={0.8} />
            </div>
          </h3>

          <div className="flex w-full flex-col gap-10">
            <GAnchor
              href="mailto:contact@yovizn.com"
              target="_blank"
              className="clamp-[text,1rem,2rem] bg-foreground text-background hover:bg-foreground/80 w-full rounded-xs tracking-normal transition-colors"
            >
              <span className="block size-fit w-full text-center font-medium">contact@yovizn.com</span>
            </GAnchor>
          </div>
        </div>

        <div className="hidden grid-rows-2 gap-px lg:grid">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bg-background aspect-square" />
          ))}
        </div>
      </div>
      <div className="bg-background text-accent/50 col-span-full flex flex-col items-center justify-between px-4 py-2 sm:flex-row">
        <p className="text-xs text-nowrap uppercase">2025 &copy; Yovi Zulkarnaen.</p>

        <ul className="hidden gap-4 sm:flex">
          {socials.map(
            (social) =>
              social.id !== 'email' && (
                <Li key={social.id}>
                  <GAnchor href={social.href} target="_blank" className="text-xs uppercase">
                    {social.name}
                  </GAnchor>
                </Li>
              ),
          )}
        </ul>
      </div>
    </footer>
  )
}
