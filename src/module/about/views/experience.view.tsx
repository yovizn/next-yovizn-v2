import { TextBlur } from '@/components/animations/text/blur.text'
import { ArrowUpLeft } from 'lucide-react'
import { ExperienceDetail } from './experience-detail.view'

export function Experience() {
  return (
    <div className="grid grid-cols-4 gap-px lg:grid-cols-6 xl:grid-cols-8">
      <section id="experience" className="col-span-full grid grid-cols-subgrid gap-px">
        <div className="relative z-20 col-span-full grid w-full grid-cols-subgrid gap-px">
          <div className="bg-background clamp-[px,4,5] col-span-2 grid gap-px py-5 lg:col-span-3 xl:col-span-4">
            <span className="sr-only">Arrow Up Icon</span>
            <ArrowUpLeft aria-hidden className="clamp-[size,2rem,8rem]" />
          </div>

          <div className="bg-background clamp-[px,4,5] col-span-2 grid gap-px py-5 lg:col-span-3 xl:col-span-4">
            <h3 className="font-helvetica clamp-[text,2xl,9xl] justify-self-end leading-none font-bold lg:tracking-tighter">
              <span className="sr-only">This is my experience</span>
              <TextBlur text="Experience" direction="left" />
            </h3>
          </div>
        </div>

        <ExperienceDetail />
      </section>
    </div>
  )
}
