import { cn } from '@/lib/utils/cn'

export function LogoHeader({ className }: { className?: string }) {
  return (
    <svg
      id="b"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 1000 1000"
      className={cn('group', className)}
    >
      <g id="c" className="origin-center transition-all duration-500 group-hover:rotate-60">
        <g>
          <rect width="1000" height="1000" fill="none" opacity="0" strokeWidth="0" />
          <polygon
            points="395.46 828.6 696.03 308 94.89 308 395.46 828.6"
            fill="currentColor"
            strokeWidth="20"
            className="stroke-foreground transition-all duration-300 group-hover:fill-transparent"
          />
          <rect
            x="717.6"
            y="162.83"
            width="83.56"
            height="438.15"
            transform="translate(292.69 -328.53) rotate(30)"
            fill="currentColor"
            strokeWidth="20"
            className="stroke-foreground transition-all duration-300 group-hover:-translate-x-32 group-hover:translate-y-[25%] group-hover:fill-transparent"
          />
        </g>
      </g>
    </svg>
  )
}
