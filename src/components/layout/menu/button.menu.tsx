'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'motion/react'
import { handleGoogleEvent } from '@/lib/analytic/googleEvent'
import { duration, easing } from '@/lib/constants/animation.constant'
import { useMenu } from '@/hooks/stores/useMenu.hook'

export function MenuHeader() {
  const {
    menu: { isOpen },
    setMenu: setIsActive,
  } = useMenu()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    handleGoogleEvent({ event: 'buttonClicked', name: 'Menu', value: isOpen ? 'close' : 'open' })
    setIsActive({ isOpen: !isOpen })
  }

  const transition = `all ${duration.medium}s cubic-bezier(${easing.out.join(', ')}) 0.075s`

  return (
    <button
      name="Menu"
      aria-label="Menu"
      onClick={handleClick}
      className="bg-foreground text-background relative z-50 flex cursor-pointer flex-col items-center justify-center overflow-clip rounded-xs px-2 py-1 uppercase transition-all sm:w-16 sm:px-3"
    >
      <span
        data-open={isOpen}
        className="font-helvetica block transform-gpu font-medium uppercase data-[open=true]:-translate-y-full data-[open=true]:opacity-0"
        style={{ transition }}
      >
        Menu
      </span>
      <span
        data-open={isOpen}
        className="font-helvetica absolute block translate-y-full transform-gpu font-medium uppercase opacity-0 data-[open=true]:translate-y-0 data-[open=true]:opacity-100"
        style={{ transition }}
      >
        Close
      </span>
    </button>
  )
}
