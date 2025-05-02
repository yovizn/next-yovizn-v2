import LenisProvider from '@/providers/lenis.provider'

import { Cursor } from '@/components/animations/cursor.animation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PageTransition } from '@/components/transitions/page.transition'
import { FirstRenderTransition } from '@/components/transitions/firstRender.transition'

import { getFirstRender } from '@/lib/cookies/getFirstRender.cookie'
import { getDeviceInfo } from '@/lib/device'

export default async function MainLayout({ children }: React.PropsWithChildren) {
  const isFirstRender = await getFirstRender()
  const { isDesktop } = await getDeviceInfo()

  return (
    <>
      {isDesktop && (
        <>
          <LenisProvider />
          <Cursor />
        </>
      )}

      <Header />

      <div className="bg-accent/5 [container-type:inline-size] mb-24 flex w-full flex-[1_0_100%] flex-col gap-px">
        {children}
      </div>

      <Footer />

      <FirstRenderTransition isFirstRender={isFirstRender} />
      <PageTransition />
    </>
  )
}
