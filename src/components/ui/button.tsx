'use client'

import { handleGoogleEvent } from '@/lib/analytic/googleEvent'
import { cn } from '@/lib/utils/cn'
import { cva, VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-0 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: '',
      },
      size: {
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'name'>,
    VariantProps<typeof buttonVariants> {
  name: string
}

export function Button({ className, variant, size, onClick, ...props }: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleGoogleEvent({ event: 'buttonClicked', name: props.name })
    onClick?.(e)
  }

  return (
    <button
      className={cn('outline-none ring-0 focus-visible:ring-0', buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    />
  )
}
