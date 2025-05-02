'use client'

import { handleGoogleEvent } from '@/lib/analytic/googleEvent'

type GAnchorProps = Omit<React.HTMLProps<HTMLAnchorElement>, 'classID' | 'onClick'>

export function GAnchor({ href = '#', className, ...props }: GAnchorProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => handleGoogleEvent({ event: 'anchorClicked', url: href })}
      {...props}
    />
  )
}
