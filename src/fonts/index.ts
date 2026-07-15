import { Geist_Mono } from 'next/font/google'
import { nohemi } from '@/fonts/Nohemi'
import { satoshi } from '@/fonts/Satoshi'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const fontVariables = `${satoshi.variable} ${geistMono.variable} ${nohemi.variable}`
