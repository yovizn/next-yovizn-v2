'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { Li } from '@/components/animations/li.animation'
import { Button } from '@/components/ui/button'
import { RevealText } from '@/components/animations/text/reveal.text'
import { SlidingNumber } from '@/components/animations/number/slidingNumber'

import { experiences } from '@/lib/constants/experience.constant'
import { mountAnim, TRANSITION } from '@/lib/constants/animation.constant'

export function ExperienceDetail() {
  const [value, setValue] = useState(experiences[0].value)

  return (
    <div className="col-span-full grid grid-cols-1 gap-px lg:grid-cols-8">
      <div className="clamp-[pt,20,24] bg-background clamp-[px,4,5] clamp-[pb,4,5] grid lg:col-span-4">
        <span className="clamp-[text,6xl,15rem] font-nohemi flex w-fit justify-self-end leading-none font-bold">
          <SlidingNumber value={value} decimal />
          <span
            className="clamp-[text,base,4rem] clamp-[w,20,50] block leading-none capitalize"
            style={{ clipPath: 'inset(0 0 0 0)' }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {value > 1 && (
                <motion.span
                  key="years"
                  layoutId="years"
                  {...mountAnim(yearVariant)}
                  transition={TRANSITION}
                  className="block"
                >
                  years
                </motion.span>
              )}
              {value <= 1 && (
                <motion.span
                  key="year"
                  layoutId="year"
                  {...mountAnim(yearVariant)}
                  transition={TRANSITION}
                  className="block"
                >
                  year
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </span>
      </div>

      <div className="grid grid-cols-subgrid gap-px lg:col-span-4">
        <ul className="col-span-full grid grid-cols-subgrid gap-px">
          {experiences.map((exp) => {
            return (
              <Li key={exp.label} className="bg-background col-span-full h-full w-full outline-none">
                <Button
                  name={exp.label}
                  onClick={() => setValue(exp.value)}
                  className="h-full w-full justify-start ring-0 focus-visible:outline-0! focus-visible:outline-none!"
                >
                  <span className="sr-only">{exp.label}</span>
                  <RevealText
                    text={'— ' + exp.label}
                    className={{ text: 'clamp-[text,base,xl] font-nohemi uppercase' }}
                  />
                </Button>
              </Li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

const yearVariant = {
  initial: { opacity: 0, y: '100%' },
  enter: { opacity: 1, y: '0%' },
  exit: { opacity: 0, y: '-100%' },
}
