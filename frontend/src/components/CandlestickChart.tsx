import { useState, useRef, useMemo } from 'react'
import {
  Plus,
  Trash2,
  BarChart2,
  SlidersHorizontal,
  Shield,
  TrendingDown,
} from 'lucide-react'
import { formatCurrency, cn } from '../lib/utils'

export type Candle = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

type MarkupLine = {
  id: string
  price: number
  type: 'support' | 'resistance'
  label?: string
}

type CandlestickChartProps = {
  candles: Candle[]
  currency?: string
  ticker?: string
  candlestickAi?: {
    patterns: string[]
    sentiment: string
    support?: number
    resistance?: number
    analysis: string
    source?: string
  } | null
  aiLoading?: boolean
}

export function CandlestickChart({
  candles,
  currency = 'INR',
  ticker = '',
  candlestickAi,
  aiLoading = false,
}: CandlestickChartProps) {
  const [markupLines, setMarkupLines] = useState<MarkupLine[]>([])
  const [activeTool, setActiveTool] = useState<'support' | 'resistance' | null>(null)
  const [autoMarkup, setAutoMarkup] = useState<boolean>(true)
  const [hoveredCandle, setHoveredCandle] = useState<{ candle: Candle; x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Determine native currency of candles to prevent showing ₹ on $4,000 USD commodities
  const chartCurrency = useMemo(() => {
    const usdTickers = ['GC=F', 'SI=F', 'CL=F', 'BZ=F', 'NG=F', 'HG=F', 'ALI=F', 'ZINC=F']
    if (usdTickers.includes(ticker) || ticker.startsWith('^') || (!ticker.endsWith('.NS') && !ticker.endsWith('.BO') && currency === 'USD')) {
      return 'USD'
    }
    if (candles.length > 0) {
      const avg = candles[0].close
      // Gold COMEX trades ~3500-5000 USD, while domestic 24K is ~14,000 INR/g or 140,000 INR/10g
      if (ticker.includes('GC=F') && avg < 10000) return 'USD'
    }
    return currency || 'INR'
  }, [ticker, currency, candles])

  // Use the last 32 candles for clean readability on all screens
  const displayCandles = useMemo(() => {
    return candles.slice(-32)
  }, [candles])

  // Chart dimensions & scaling (responsive SVG viewBox)
  const width = 800
  const height = 310
  const padding = { top: 22, right: 82, bottom: 28, left: 10 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const { minPrice, priceRange } = useMemo(() => {
    if (displayCandles.length === 0) return { minPrice: 0, priceRange: 100 }
    let min = Infinity
    let max = -Infinity
    displayCandles.forEach((c) => {
      if (c.low < min) min = c.low
      if (c.high > max) max = c.high
    })

    // Include custom markup lines
    markupLines.forEach((m) => {
      if (m.price < min) min = m.price
      if (m.price > max) max = m.price
    })

    // Include auto markup pivots if enabled
    if (autoMarkup && candlestickAi) {
      if (typeof candlestickAi.support === 'number' && !isNaN(candlestickAi.support)) {
        if (candlestickAi.support < min) min = candlestickAi.support
        if (candlestickAi.support > max) max = candlestickAi.support
      }
      if (typeof candlestickAi.resistance === 'number' && !isNaN(candlestickAi.resistance)) {
        if (candlestickAi.resistance < min) min = candlestickAi.resistance
        if (candlestickAi.resistance > max) max = candlestickAi.resistance
      }
    }

    const buffer = (max - min) * 0.08 || 1
    return {
      minPrice: min - buffer,
      priceRange: max - min + buffer * 2,
    }
  }, [displayCandles, markupLines, autoMarkup, candlestickAi])

  const getY = (price: number) => {
    return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight
  }

  const getPriceFromY = (y: number) => {
    const clampedY = Math.max(padding.top, Math.min(padding.top + chartHeight, y))
    const ratio = (padding.top + chartHeight - clampedY) / chartHeight
    return minPrice + ratio * priceRange
  }

  const candleWidth = Math.max(4, Math.min(18, (chartWidth / (displayCandles.length || 1)) * 0.72))
  const candleGap = chartWidth / (displayCandles.length || 1)

  // Handle clicking to place a manual markup line
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!activeTool || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const clickY = ((e.clientY - rect.top) / rect.height) * height
    const clickedPrice = getPriceFromY(clickY)

    setMarkupLines((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        price: parseFloat(clickedPrice.toFixed(2)),
        type: activeTool,
        label: activeTool === 'support' ? 'Custom Support' : 'Custom Resist',
      },
    ])
    setActiveTool(null)
  }

  const removeMarkupLine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMarkupLines((prev) => prev.filter((l) => l.id !== id))
  }

  // Price grid steps
  const priceGridSteps = useMemo(() => {
    const count = 5
    const step = priceRange / count
    return Array.from({ length: count + 1 }, (_, i) => minPrice + i * step)
  }, [minPrice, priceRange])

  if (displayCandles.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-stone-400 dark:text-slate-500 text-xs">
        No candlestick data available for this timeframe
      </div>
    )
  }

  return (
    <div className="space-y-3 max-w-full overflow-hidden">
      {/* Markup Toolbar & Tooling State */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs max-w-full">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {/* Master Auto Markup Toggle */}
          <button
            type="button"
            onClick={() => setAutoMarkup(!autoMarkup)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 shrink-0',
              autoMarkup
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-xs'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-slate-400 border-stone-200 dark:border-slate-700 hover:text-stone-800 dark:hover:text-white',
            )}
            title="Automatically plot calculated pivot support and resistance levels directly on the chart"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Auto Markup: {autoMarkup ? 'ON' : 'OFF'}</span>
          </button>

          {/* Manual Support Tool */}
          <button
            type="button"
            onClick={() => setActiveTool(activeTool === 'support' ? null : 'support')}
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 shrink-0',
              activeTool === 'support'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:border-emerald-500',
            )}
          >
            <Plus className="w-3 h-3 text-emerald-500" />
            <span>+ Support</span>
          </button>

          {/* Manual Resistance Tool */}
          <button
            type="button"
            onClick={() => setActiveTool(activeTool === 'resistance' ? null : 'resistance')}
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 shrink-0',
              activeTool === 'resistance'
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:border-rose-500',
            )}
          >
            <Plus className="w-3 h-3 text-rose-500" />
            <span>+ Resistance</span>
          </button>

          {markupLines.length > 0 && (
            <button
              type="button"
              onClick={() => setMarkupLines([])}
              className="px-2 py-1 text-stone-400 hover:text-rose-500 text-xs flex items-center gap-1 transition-colors shrink-0"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear ({markupLines.length})</span>
            </button>
          )}
        </div>

        {activeTool && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium animate-pulse shrink-0">
            Click chart to plot {activeTool} level
          </span>
        )}
      </div>

      {/* Candlestick SVG Container */}
      <div className="relative w-full max-w-full bg-stone-50 dark:bg-[#070b14] rounded-xl border border-stone-200 dark:border-slate-800/80 p-1 sm:p-2 overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className={cn(
            'w-full h-60 xs:h-64 sm:h-72',
            activeTool ? 'cursor-crosshair' : 'cursor-default',
          )}
          onClick={handleSvgClick}
          onMouseLeave={() => setHoveredCandle(null)}
        >
          {/* Horizontal Grid lines & Price Labels */}
          {priceGridSteps.map((p, idx) => {
            const y = getY(p)
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-stone-200 dark:text-slate-800/80"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <text
                  x={width - padding.right + 5}
                  y={y + 3.5}
                  fontSize={10}
                  className="fill-stone-400 dark:fill-slate-500 font-mono"
                >
                  {p.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </text>
              </g>
            )
          })}

          {/* AUTOMATIC MARKUP: Support Level (from Technical Analysis) */}
          {autoMarkup && candlestickAi?.support && typeof candlestickAi.support === 'number' && (
            <g className="auto-markup-support">
              <line
                x1={padding.left}
                y1={getY(candlestickAi.support)}
                x2={width - padding.right}
                y2={getY(candlestickAi.support)}
                stroke="#10b981"
                strokeWidth={1.8}
                strokeDasharray="6 3"
              />
              <rect
                x={width - padding.right + 2}
                y={getY(candlestickAi.support) - 8}
                width={76}
                height={16}
                rx={3}
                fill="#10b981"
                className="opacity-95"
              />
              <text
                x={width - padding.right + 6}
                y={getY(candlestickAi.support) + 3.5}
                fontSize={9}
                fill="#ffffff"
                fontWeight="bold"
                className="font-mono"
              >
                S: {candlestickAi.support.toFixed(1)}
              </text>
            </g>
          )}

          {/* AUTOMATIC MARKUP: Resistance Level (from Technical Analysis) */}
          {autoMarkup && candlestickAi?.resistance && typeof candlestickAi.resistance === 'number' && (
            <g className="auto-markup-resistance">
              <line
                x1={padding.left}
                y1={getY(candlestickAi.resistance)}
                x2={width - padding.right}
                y2={getY(candlestickAi.resistance)}
                stroke="#f43f5e"
                strokeWidth={1.8}
                strokeDasharray="6 3"
              />
              <rect
                x={width - padding.right + 2}
                y={getY(candlestickAi.resistance) - 8}
                width={76}
                height={16}
                rx={3}
                fill="#f43f5e"
                className="opacity-95"
              />
              <text
                x={width - padding.right + 6}
                y={getY(candlestickAi.resistance) + 3.5}
                fontSize={9}
                fill="#ffffff"
                fontWeight="bold"
                className="font-mono"
              >
                R: {candlestickAi.resistance.toFixed(1)}
              </text>
            </g>
          )}

          {/* USER CUSTOM MARKUP LINES */}
          {markupLines.map((line) => {
            const y = getY(line.price)
            const isSupport = line.type === 'support'
            const strokeColor = isSupport ? '#10b981' : '#f43f5e'

            return (
              <g key={line.id} className="group">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={strokeColor}
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
                <g onClick={(e) => removeMarkupLine(line.id, e)} className="cursor-pointer">
                  <rect
                    x={width - padding.right + 2}
                    y={y - 8}
                    width={76}
                    height={16}
                    rx={3}
                    fill={strokeColor}
                    className="opacity-90 hover:opacity-100"
                  />
                  <text
                    x={width - padding.right + 5}
                    y={y + 3.5}
                    fontSize={9}
                    fill="#ffffff"
                    fontWeight="bold"
                    className="font-mono"
                  >
                    {line.price.toFixed(1)} ✕
                  </text>
                </g>
              </g>
            )
          })}

          {/* Candlestick Bars */}
          {displayCandles.map((candle, idx) => {
            const xCenter = padding.left + idx * candleGap + candleGap / 2
            const isUp = candle.close >= candle.open
            const highY = getY(candle.high)
            const lowY = getY(candle.low)
            const openY = getY(candle.open)
            const closeY = getY(candle.close)
            const bodyY = Math.min(openY, closeY)
            const bodyHeight = Math.max(2, Math.abs(closeY - openY))

            const candleColor = isUp ? '#10b981' : '#ef4444'

            return (
              <g
                key={candle.date || idx}
                onMouseEnter={() => setHoveredCandle({ candle, x: xCenter, y: closeY })}
                className="hover:opacity-80 transition-opacity"
              >
                <line
                  x1={xCenter}
                  y1={highY}
                  x2={xCenter}
                  y2={lowY}
                  stroke={candleColor}
                  strokeWidth={1.2}
                />
                <rect
                  x={xCenter - candleWidth / 2}
                  y={bodyY}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={candleColor}
                  rx={0.5}
                />
              </g>
            )
          })}
        </svg>

        {/* Hover Crosshair Info Pill */}
        {hoveredCandle && (
          <div className="absolute top-2 left-2 bg-stone-900/90 dark:bg-slate-900/95 text-white border border-stone-700 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-mono shadow-md pointer-events-none flex flex-wrap items-center gap-2 max-w-[90%]">
            <span className="text-stone-300 font-sans">{hoveredCandle.candle.date}</span>
            <span>O: <strong className="text-stone-200">{hoveredCandle.candle.open}</strong></span>
            <span>H: <strong className="text-emerald-400">{hoveredCandle.candle.high}</strong></span>
            <span>L: <strong className="text-rose-400">{hoveredCandle.candle.low}</strong></span>
            <span>
              C:{' '}
              <strong
                className={
                  hoveredCandle.candle.close >= hoveredCandle.candle.open
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }
              >
                {hoveredCandle.candle.close}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* AI Candlestick Technical Analysis Card */}
      <div className="p-3 sm:p-4 rounded-xl bg-stone-100/70 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 space-y-2 max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-stone-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-[#b7eb4d]" />
            <h4 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-white">
              Technical Structure & Auto Pivots
            </h4>
          </div>

          {candlestickAi?.sentiment && (
            <span
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border shrink-0',
                candlestickAi.sentiment.includes('Bullish')
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : candlestickAi.sentiment.includes('Bearish')
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
              )}
            >
              {candlestickAi.sentiment}
            </span>
          )}
        </div>

        {aiLoading ? (
          <div className="py-2 flex items-center justify-center gap-2 text-stone-500 dark:text-slate-400 text-xs">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            Analyzing candle geometry and pivot wicks…
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {candlestickAi?.patterns && candlestickAi.patterns.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-stone-500 dark:text-slate-400">Pattern:</span>
                {candlestickAi.patterns.map((pat, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-slate-800 text-stone-800 dark:text-slate-200 font-medium text-[11px]"
                  >
                    {pat}
                  </span>
                ))}
              </div>
            )}

            <p className="text-stone-700 dark:text-slate-300 leading-relaxed font-sans text-xs sm:text-[13px]">
              {candlestickAi?.analysis ||
                'Watching price interaction between recent candle extremes and volume distribution.'}
            </p>

            {/* Support / Resistance Levels with Correct Currency Symbol */}
            {(candlestickAi?.support || candlestickAi?.resistance) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 font-mono text-[11px]">
                {candlestickAi.support && (
                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span>Key Pivot Support:</span>
                    <strong>{formatCurrency(candlestickAi.support, chartCurrency)}</strong>
                  </div>
                )}
                {candlestickAi.resistance && (
                  <div className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
                    <TrendingDown className="w-3 h-3 text-rose-500" />
                    <span>Overhead Resistance:</span>
                    <strong>{formatCurrency(candlestickAi.resistance, chartCurrency)}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
