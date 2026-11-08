import { useState } from 'react'
import { cn, formatCurrency, formatPct, getMarketIcon } from '../lib/utils'
import { ArrowUp, ArrowDown } from 'lucide-react'

type MarketCardProps = {
  name: string
  q: {
    price: number
    change?: number
    change_pct?: number
    periods?: Record<string, number>
    currency?: string
    ticker?: string
    high?: number
    low?: number
    open?: number
    volume?: number
  }
  onClick?: () => void
  inrData?: {
    price: number
    unit: string
    sub?: string
    karats?: Record<string, any>
    benchmark?: string
  }
  usdData?: {
    price: number
    unit: string
    sub?: string
  }
  karats?: Record<string, any>
  currencyMode?: 'INR' | 'USD'
  timeframe?: string
  isActiveIndex?: boolean
  actionLabel?: string
}

export function MarketCard({
  name,
  q,
  onClick,
  inrData,
  usdData,
  karats,
  currencyMode = 'INR',
  timeframe = '1D',
  isActiveIndex = false,
  actionLabel,
}: MarketCardProps) {
  const [selectedKarat, setSelectedKarat] = useState<'24K' | '22K' | '18K'>('24K')

  const availableKarats = karats || inrData?.karats

  let displayPrice = q.price
  let displayCurrency = q.currency || 'USD'
  let unit = ''
  let sub = ''

  if (inrData && usdData) {
    if (currencyMode === 'INR') {
      displayCurrency = 'INR'
      unit = inrData.unit
      if (availableKarats && availableKarats[selectedKarat]) {
        const kData = availableKarats[selectedKarat]
        displayPrice = kData.price_per_g
        sub = kData.sub
      } else {
        displayPrice = inrData.price
        sub = inrData.sub || ''
      }
    } else {
      displayPrice = usdData.price
      displayCurrency = 'USD'
      unit = usdData.unit
      sub = usdData.sub || ''
    }
  }

  const changePct = q.periods?.[timeframe] ?? q.change_pct ?? 0
  const up = (changePct || 0) >= 0
  const color = up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
  const Arrow = up ? ArrowUp : ArrowDown
  const Icon = getMarketIcon(name)

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-[#0e1422] border rounded-xl p-3.5 sm:p-4 cursor-pointer transition-colors duration-150 group select-none flex flex-col justify-between',
        isActiveIndex
          ? 'border-emerald-600 dark:border-[#b7eb4d] ring-1 ring-emerald-600 dark:ring-[#b7eb4d]'
          : 'border-stone-200 dark:border-slate-800 hover:border-stone-400 dark:hover:border-slate-700',
      )}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isActiveIndex
                  ? 'bg-stone-900 text-white dark:bg-[#b7eb4d] dark:text-[#0b101b]'
                  : 'bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-300 group-hover:text-stone-900 dark:group-hover:text-white',
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="font-semibold text-xs sm:text-sm text-stone-800 dark:text-slate-200 group-hover:text-stone-950 dark:group-hover:text-white transition-colors">
              {name}
            </span>
          </div>
          <span className="text-[10px] font-mono font-medium text-stone-500 dark:text-slate-400 bg-stone-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-slate-700">
            {timeframe}
          </span>
        </div>

        {/* Karat selector for Indian gold pricing */}
        {currencyMode === 'INR' && availableKarats && (
          <div
            className="flex items-center gap-1 my-2 p-0.5 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-lg w-fit"
            onClick={(e) => e.stopPropagation()}
          >
            {(['24K', '22K', '18K'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSelectedKarat(k)}
                className={cn(
                  'px-2 py-0.5 text-[10px] font-bold rounded transition-colors',
                  selectedKarat === k
                    ? 'bg-amber-500 text-stone-950 dark:bg-amber-400 dark:text-stone-950 shadow-xs'
                    : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
                )}
              >
                {k}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold font-mono text-stone-900 dark:text-white">
              {formatCurrency(displayPrice, displayCurrency)}
            </span>
            {unit && <span className="text-xs font-medium text-stone-500 dark:text-slate-400">{unit}</span>}
          </div>
          {sub && <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5 truncate">{sub}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 dark:border-slate-800/80 text-xs font-mono">
        <div className={cn('flex items-center gap-1 font-semibold', color)}>
          <Arrow className="w-3.5 h-3.5" />
          <span>{formatPct(changePct)}</span>
        </div>
        <span
          className={cn(
            'text-[11px] transition-colors font-sans',
            isActiveIndex
              ? 'text-emerald-700 dark:text-[#b7eb4d] font-semibold'
              : 'text-stone-400 dark:text-slate-400 group-hover:text-stone-700 dark:group-hover:text-slate-200',
          )}
        >
          {actionLabel || (isActiveIndex ? 'Heatmap open' : 'View')}
        </span>
      </div>
    </div>
  )
}

export default MarketCard
