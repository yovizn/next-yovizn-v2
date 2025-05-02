import { TLink } from '@/components/common/transitionLink'

import { LogoHeader } from './logo.header'
import { SocialHeader } from './social.header'
import { MenuHeader } from '../menu/button.menu'
import { Menu } from '../menu'

export function Header() {
  return (
    <>
      <header className="fixed top-0 left-0 z-40 h-24 w-full mix-blend-difference">
        <div className="flex size-full items-center justify-between px-4">
          <TLink className="relative z-40 flex items-center justify-center" href="/">
            <LogoHeader className="text-foreground size-12 md:size-16" />
          </TLink>

          <div className="flex gap-6 sm:pr-4">
            <SocialHeader />

            <MenuHeader />
          </div>
        </div>
      </header>
      
      <Menu />
    </>
  )
}
