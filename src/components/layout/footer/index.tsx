import { TextBlur } from '@/components/animations/text/blur.text'
import HoverText from '@/components/animations/text/hover.text'
import { GAnchor } from '@/components/common/googleAnchor'
import { socials } from '@/lib/constants/social.constant'

// Ultra-light down-left arrow (stroke 1.5), replacing the stock lucide glyph so
// the footer's one icon matches the rest of the hand-drawn chrome.
function ArrowDownLeft({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M17 7 7 17" />
      <path d="M15 17H7V9" />
    </svg>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-hairline bg-hairline grid grid-cols-4 gap-px border-t pb-12 sm:pb-0 lg:grid-cols-6">
      <div className="col-span-full grid grid-cols-6 gap-px">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-graphite text-paper grid place-content-end">
            {index === 5 && <ArrowDownLeft className="clamp-[size,3rem,7rem] justify-self-end" />}
          </div>
        ))}
      </div>

      <div className="col-span-full grid grid-cols-subgrid gap-px">
        <div className="hidden grid-rows-2 gap-px lg:grid">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bg-graphite aspect-square" />
          ))}
        </div>

        <div className="bg-graphite text-paper before:bg-signal relative col-span-full grid place-content-center before:absolute before:h-1 before:w-full before:content-[''] lg:col-span-4">
          <h3 className="text-display-xl font-nohemi flex flex-col py-4 leading-none font-bold uppercase">
            {/* Accessible name: every TextBlur child is aria-hidden, so without
                this the h3 would expose no name to assistive tech. */}
            <span className="sr-only">Get in touch</span>
            <span aria-hidden className="flex gap-4 self-start md:gap-10">
              <TextBlur text="Get" delay={0.3} />
              <TextBlur text="In" delay={0.5} />
            </span>
            <span className="block self-end">
              <TextBlur text="Touch" direction="left" delay={0.8} />
            </span>
          </h3>

          <div className="flex w-full flex-col gap-10">
            <GAnchor
              href="mailto:contact@yovizn.com"
              target="_blank"
              className="group bg-paper text-graphite active:scale-[0.98] flex w-full items-center justify-center rounded-xs px-6 py-4 font-data text-sm tracking-[0.08em] uppercase transition-transform duration-300 ease-out-quint"
            >
              <HoverText>contact@yovizn.com</HoverText>
            </GAnchor>
          </div>
        </div>

        <div className="hidden grid-rows-2 gap-px lg:grid">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bg-graphite aspect-square" />
          ))}
        </div>
      </div>

      <div className="bg-graphite text-paper-dim col-span-full flex flex-col items-center justify-between px-4 py-3 sm:flex-row">
        <p className="font-data text-[11px] tracking-[0.12em] text-nowrap uppercase">
          {year} &copy; Yovi Zulkarnaen
        </p>

        <ul className="hidden gap-5 sm:flex">
          {socials.map(
            (social) =>
              social.id !== 'email' && (
                <li key={social.id}>
                  <GAnchor
                    href={social.href}
                    target="_blank"
                    className="group font-data hover:text-paper block text-[11px] tracking-[0.12em] uppercase transition-colors duration-300"
                  >
                    <HoverText>{social.name}</HoverText>
                  </GAnchor>
                </li>
              ),
          )}
        </ul>
      </div>
    </footer>
  )
}
