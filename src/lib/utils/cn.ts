import clsx from 'clsx'
import { ClassValue } from 'clsx'

export function cn(...classValue: ClassValue[]) {
  return clsx(classValue)
}
