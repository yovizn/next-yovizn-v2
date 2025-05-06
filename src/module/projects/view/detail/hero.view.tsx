import { GAnchor } from '@/components/common/googleAnchor'
import { urlFor } from '@/sanity/lib/image'
import { QueryProjectsBySlugResult } from '@/types/sanity.types'
import Image from 'next/image'

export function Hero({ projects }: { projects: QueryProjectsBySlugResult | undefined }) {
  return (
    <section className="col-span-full grid grid-cols-subgrid gap-px">
      <div className="col-span-full grid grid-cols-subgrid gap-px">
        <div className="bg-background col-span-1"></div>
        
        <div className="col-span-4 grid gap-px">
          <div className="flex w-full flex-col justify-between md:flex-row">
            <h1 className="bg-background clamp-[p,4,10] clamp-[text,3rem,5rem] font-helvetica w-full leading-none font-normal lg:pb-14">
              <span className="block max-w-[14ch]">{projects?.title}</span>
            </h1>
            <p className="bg-background clamp-[p,4,10] clamp-[text,xs,sm] md:max-w-[50ch] whitespace-pre-line">
              {projects?.description}
            </p>
          </div>

          <div className="grid gap-px md:grid-cols-3">
            <div className="bg-background clamp-[px,4,6] py-8 md:min-h-[250px]">
              <p className="clamp-[text,sm,lg] font-nohemi border-b-accent mb-4 border-b opacity-80">
                Service
              </p>
              <p className="clamp-[text,base,xl] font-medium">{projects?.service}</p>
            </div>

            <div className="bg-background clamp-[px,4,6] py-8 md:min-h-[250px]">
              <p className="clamp-[text,sm,lg] font-nohemi border-b-accent mb-4 border-b opacity-80">
                Client
              </p>

              {projects?.client ? (
                <div className="flex items-center justify-between">
                  <Image
                    src={urlFor(projects?.client.logo).url()}
                    alt={projects?.client.logo.alt || ''}
                    width={100}
                    height={100}
                    className="clamp-[w,60px,70px] aspect-video object-contain"
                  />
                  <GAnchor
                    href={projects?.client.link || '#'}
                    target="_blank"
                    className="font-nohemi clamp-[text,base,lg] text-foreground hover:text-primary/80 transition-colors"
                  >
                    Visit
                  </GAnchor>
                </div>
              ) : (
                <div className="opacity-75">—</div>
              )}
            </div>

            <div className="bg-background clamp-[px,4,6] py-8 md:min-h-[250px]">
              <p className="clamp-[text,sm,lg] font-nohemi border-b-accent mb-4 border-b opacity-80">
                Credits
              </p>
              {projects?.credits?.length ? (
                <div className="flex flex-col gap-4">
                  {projects.credits.map((item) => (
                    <p key={item} className="clamp-[text,base,xl] font-medium">
                      {item}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="opacity-75">—</div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-background col-span-1"></div>
      </div>

      <div className="bg-foreground clamp-[px,0,20,sm,xl] relative col-span-full pb-0">
        <div className="bg-foreground sticky top-0 z-30 col-span-full h-24 w-full" />
        <div className="relative aspect-video h-auto w-full overflow-hidden lg:rounded-sm">
          <Image
            src={urlFor(projects?.cover || '').url()}
            alt={projects?.cover.alt || ''}
            fill
            priority
            sizes="(max-width: 640px) 640px,(max-width: 1024px) 1024px,(max-width: 1280px) 1280px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="bg-foreground col-span-full h-24 w-full" />
      </div>
    </section>
  )
}
