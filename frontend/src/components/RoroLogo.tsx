import { cn } from '../lib/utils'

type RoroLogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
}

export function RoroLogo({ className, size = 'md', showSubtitle = true }: RoroLogoProps) {
  const scale = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-125' : 'scale-100'

  return (
    <div className={cn('inline-flex flex-col select-none origin-left', scale, className || '')}>
      {/* Brand Wordmark: roro. */}
      <div className="flex items-baseline">
        <span
          className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-[#1b4313] dark:text-[#b7eb4d] transition-colors"
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: '-0.04em',
            fontWeight: 900,
          }}
        >
          roro
        </span>
        <span
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ml-1 bg-[#1b4313] dark:bg-[#b7eb4d] transition-colors self-baseline inline-block"
          style={{ transform: 'translateY(-1px)' }}
        />
      </div>

      {/* Subtitle: r a t h o d */}
      {showSubtitle && (
        <span
          className="text-[10px] sm:text-[11px] font-normal tracking-[0.38em] text-[#2c3e1e] dark:text-[#b7eb4d]/85 uppercase transition-colors pl-0.5 mt-0.5"
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          rathod
        </span>
      )}
    </div>
  )
}

export default RoroLogo
