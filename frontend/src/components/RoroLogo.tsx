import { cn } from '../lib/utils'

type RoroLogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  showMark?: boolean
}

export function RoroLogo({
  className,
  size = 'md',
  showSubtitle = true,
  showMark = true,
}: RoroLogoProps) {
  const scale = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-125' : 'scale-100'

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none origin-left', scale, className || '')}>
      {/* Visual Logo Mark / Emblem */}
      {showMark && (
        <div className="relative flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-stone-900 to-stone-950 dark:from-slate-900 dark:to-slate-950 p-1.5 shadow-sm border border-stone-300 dark:border-slate-800 flex items-center justify-center group">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Left Bar */}
            <rect x="18" y="52" width="16" height="34" rx="4" className="fill-emerald-500" />
            {/* Middle Bar */}
            <rect x="42" y="34" width="16" height="52" rx="4" className="fill-emerald-400 dark:fill-lime-400" />
            {/* Right Bar */}
            <rect x="66" y="18" width="16" height="68" rx="4" className="fill-[#1b4313] dark:fill-[#b7eb4d]" />
            {/* Pulse Node atop tallest bar */}
            <circle cx="74" cy="8" r="5" className="fill-[#1b4313] dark:fill-[#b7eb4d]" />
          </svg>
        </div>
      )}

      {/* Brand Wordmark: roro. */}
      <div className="inline-flex flex-col">
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
    </div>
  )
}

export default RoroLogo
