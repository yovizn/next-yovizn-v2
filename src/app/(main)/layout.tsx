import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PageTransition } from '@/components/transitions/page.transition'
import { FirstRenderTransition } from '@/components/transitions/firstRender.transition'

import DeviceChrome from '@/components/animations/device-chrome'
import { Cursor } from '@/components/animations/cursor'

export default function MainLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      {/* Lenis is JS-gated to fine pointers client-side; the cursor is
          always rendered and CSS-hidden on coarse pointers (Task 4). */}
      <DeviceChrome />
      <Cursor />

      <Header />

      <div className="bg-accent/5 [container-type:inline-size] flex w-full flex-[1_0_100%] flex-col gap-px">
        {children}
      </div>

      <Footer />

      <FirstRenderTransition />
      <PageTransition />
    </>
  )
}
