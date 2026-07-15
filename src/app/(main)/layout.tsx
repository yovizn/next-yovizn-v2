import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PageTransition } from '@/components/transitions/page.transition'
import { FirstRenderTransition } from '@/components/transitions/firstRender.transition'
import { TransportRail } from '@/components/layout/transport-rail'

import DeviceChrome from '@/components/animations/device-chrome'
import { Cursor } from '@/components/animations/cursor'

export default function MainLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      {/* Lenis is JS-gated to fine pointers client-side; the cursor is
          always rendered and CSS-hidden on coarse pointers (Task 4). */}
      <DeviceChrome />
      <Cursor />

      {/* Transport rail: client island, persists across all (main) routes.
          Layout stays static — the island does not opt the layout into SSR. */}
      <TransportRail />

      <Header />

      {/* Reserve space so content is never occluded by the rail:
          lg:pl-10 matches the 2.5rem (40px / w-10) desktop left column;
          pb-10 matches the 2.5rem (40px / h-10) mobile bottom bar. */}
      <div className="bg-hairline [container-type:inline-size] flex w-full flex-[1_0_100%] flex-col gap-px pb-[calc(2.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-10">
        {children}
      </div>

      <Footer />

      <FirstRenderTransition />
      <PageTransition />
    </>
  )
}
