import { useState, useRef, useMemo } from 'react'
import {
  Plus,
  Trash2,
  BarChart2,
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
}

type CandlestickChartProps = {
  candles: Candle[]
  currency?: string
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
  candlestickAi,
  aiLoading = false,
}: CandlestickChartProps) {
  const [markupLines, setMarkupLines] = useState<MarkupLine[]>([])
  const [activeTool, setActiveTool] = useState<'support' | 'resistance' | null>(null)
  const [hoveredCandle, setHoveredCandle] = useState<{ candle: Candle; x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Use the last 30 candles for clean readability on all screens
  const displayCandles = useMemo(() => {
    return candles.slice(-32)
  }, [candles])

  // Chart dimensions & scaling
  const width = 800
  const height = 300
  const padding = { top: 20, right: 65, bottom: 30, left: 10 }
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
    // Also include markup lines in range if any
    markupLines.forEach((m) => {
      if (m.price < min) min = m.price
      if (m.price > max) max = m.price
    })
    const buffer = (max - min) * 0.08 || 1
    return {
      minPrice: min - buffer,
      priceRange: max - min + buffer * 2,
    }
  }, [displayCandles, markupLines])

  const getY = (price: number) => {
    return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight
  }

  const getPriceFromY = (y: number) => {
    const clampedY = Math.max(padding.top, Math.min(padding.top + chartHeight, y))
    const ratio = (padding.top + chartHeight - clampedY) / chartHeight
    return minPrice + ratio * priceRange
  }

  const candleWidth = Math.max(4, Math.min(18, chartWidth / (displayCandles.length || 1) * 0.72))
  const candleGap = chartWidth / (displayCandles.length || 1)

  // Handle clicking to place a markup line
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
    <div className="space-y-3.5">
      {/* Markup Toolbar & Tooling State */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-stone-500 dark:text-slate-400">Chart Markup:</span>
          <button
            type="button"
            onClick={() => setActiveTool(activeTool === 'support' ? null : 'support')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1',
              activeTool === 'support'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:border-emerald-500',
            )}
          >
            <Plus className="w-3 h-3 text-emerald-500" />
            <span>Support Line</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool(activeTool === 'resistance' ? null : 'resistance')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1',
              activeTool === 'resistance'
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:border-rose-500',
            )}
          >
            <Plus className="w-3 h-3 text-rose-500" />
            <span>Resistance Line</span>
          </button>

          {markupLines.length > 0 && (
            <button
              type="button"
              onClick={() => setMarkupLines([])}
              className="px-2 py-1 text-stone-400 hover:text-rose-500 text-xs flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear ({markupLines.length})</span>
            </button>
          )}
        </div>

        {activeTool && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium animate-pulse">
            Click anywhere on chart to place {activeTool} level
          </span>
        )}
      </div>

      {/* Candlestick SVG Container */}
      <div className="relative w-full bg-stone-50 dark:bg-[#070b14] rounded-xl border border-stone-200 dark:border-slate-800/80 p-2 overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className={cn(
            'w-full h-64 sm:h-72',
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
                  x={width - padding.right + 6}
                  y={y + 3.5}
                  fontSize={10}
                  className="fill-stone-400 dark:fill-slate-500 font-mono"
                >
                  {formatCurrency(p, currency).replace('₹', '')}
                </text>
              </g>
            )
          })}

          {/* Placed Markup Support / Resistance Lines */}
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
                {/* Price Tag Badge - click to remove line */}
                <g
                  onClick={(e) => removeMarkupLine(line.id, e)}
                  className="cursor-pointer"
                >
                  <rect
                    x={width - padding.right + 2}
                    y={y - 8}
                    width={60}
                    height={16}
                    rx={3}
                    fill={strokeColor}
                    className="opacity-90 hover:opacity-100"
                  />
                  <text
                    x={width - padding.right + 5}
                    y={y + 3.5}
                    fontSize={9.5}
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
                {/* Wick Line: low to high */}
                <line
                  x1={xCenter}
                  y1={highY}
                  x2={xCenter}
                  y2={lowY}
                  stroke={candleColor}
                  strokeWidth={1.2}
                />
                {/* Candle Real Body */}
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
          <div className="absolute top-3 left-3 bg-stone-900/90 dark:bg-slate-900/95 text-white border border-stone-700 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono shadow-md pointer-events-none flex items-center gap-3">
            <span className="text-stone-300 font-sans">{hoveredCandle.candle.date}</span>
            <span>
              O: <strong className="text-stone-200">{hoveredCandle.candle.open}</strong>
            </span>
            <span>
              H: <strong className="text-emerald-400">{hoveredCandle.candle.high}</strong>
            </span>
            <span>
              L: <strong className="text-rose-400">{hoveredCandle.candle.low}</strong>
            </span>
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
      <div className="p-3.5 sm:p-4 rounded-xl bg-stone-100/70 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-[#b7eb4d]" />
            <h4 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-white">
              Candlestick Pattern Recognition & Structure
            </h4>
          </div>

          {candlestickAi?.sentiment && (
            <span
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border',
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
            {/* Patterns Detected */}
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

            {/* Analysis text */}
            <p className="text-stone-700 dark:text-slate-300 leading-relaxed font-sans text-xs sm:text-[13px]">
              {candlestickAi?.analysis ||
                'Watching price interaction between recent candle extremes and volume distribution.'}
            </p>

            {/* Support / Resistance Levels */}
            {(candlestickAi?.support || candlestickAi?.resistance) && (
              <div className="flex items-center gap-4 pt-1 font-mono text-[11px]">
                {candlestickAi.support && (
                  <div className="text-emerald-700 dark:text-emerald-400">
                    Key Pivot Support: <strong>{formatCurrency(candlestickAi.support, currency)}</strong>
                  </div>
                )}
                {candlestickAi.resistance && (
                  <div className="text-rose-700 dark:text-rose-400">
                    Overhead Resistance: <strong>{formatCurrency(candlestickAi.resistance, currency)}</strong>
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
