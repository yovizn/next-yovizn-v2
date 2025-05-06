'use client'

import dynamic from 'next/dynamic'

export const HeroImage = dynamic(() => import('./hero-image.view').then((mod) => mod.HeroImage))
export const HeroSection = dynamic(() =>
  import('./hero-section.view').then((mod) => mod.HeroSection),
)
