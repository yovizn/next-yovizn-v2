import { Geist_Mono } from 'next/font/google'
import { nohemi } from '@/fonts/Nohemi'
import { satoshi } from '@/fonts/Satoshi'
import { helvetica } from './Helvetica'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// `helvetica` stays in the chain only until Task A3: its `font-helvetica`
// call sites are migrated in A2, then the family + loader are deleted in A3.
export const fontVariables = `${satoshi.variable} ${geistMono.variable} ${nohemi.variable} ${helvetica.variable}`
