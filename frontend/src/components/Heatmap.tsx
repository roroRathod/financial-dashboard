import { useState, useMemo, useEffect } from 'react'
import { X, Search, Clock } from 'lucide-react'
import { formatPct, cn } from '../lib/utils'
import { getCompanyInfo, cleanSymbol, CompanyInfo } from '../lib/companyData'
import { CompanyLogo } from './CompanyLogo'
import { getMarketStatus, MarketRegion } from '../lib/marketHours'

export type Stock = {
  ticker: string
  price: number
  change?: number
  change_pct?: number
  periods?: Record<string, number>
  volume?: number
  currency?: string
  high?: number
  low?: number
  open?: number
  name?: string
}

type HeatmapProps = {
  indexName?: string
  stocks: Stock[]
  timeframe?: string
  loading?: boolean
  onSelectStock?: (stock: Stock) => void
  onClose?: () => void
  onChangeIndex?: (index: string) => void
}

interface EnrichedStock extends Stock {
  info: CompanyInfo
  returnVal: number
  weight: number
  pts: number
}

interface PctRect<T> {
  item: T
  leftPct: number
  topPct: number
  widthPct: number
  heightPct: number
}

const MARKET_INDICES: Record<MarketRegion, Array<{ id: string; name: string }>> = {
  INDIA: [
    { id: 'NIFTY 50', name: 'Nifty 50' },
    { id: 'BANK NIFTY', name: 'Bank Nifty' },
    { id: 'NIFTY IT', name: 'Nifty IT' },
    { id: 'NIFTY AUTO', name: 'Nifty Auto' },
    { id: 'NIFTY FMCG', name: 'Nifty FMCG' },
    { id: 'NIFTY PHARMA', name: 'Nifty Pharma' },
  ],
  US: [
    { id: 'S&P 500', name: 'S&P 500' },
    { id: 'NASDAQ 100', name: 'Nasdaq 100' },
    { id: 'DOW JONES', name: 'Dow Jones' },
  ],
  GLOBAL: [
    { id: 'NIKKEI 225', name: 'Nikkei 225' },
    { id: 'FTSE 100', name: 'FTSE 100' },
    { id: 'DAX', name: 'DAX Germany' },
  ],
}

// True Alphave Financial Color Grading
function getAlphaveTileColor(pct: number): { bg: string; text: string } {
  if (pct >= 3.0) {
    return { bg: '#187038', text: '#ffffff' } // Deep Emerald
  } else if (pct >= 1.0) {
    return { bg: '#1f7a42', text: '#ffffff' } // Rich Green
  } else if (pct > 0.05) {
    return { bg: '#165a31', text: '#ffffff' } // Muted Forest Green
  } else if (pct >= -0.05) {
    return { bg: '#253342', text: '#e2e8f0' } // Neutral Dark Slate
  } else if (pct >= -0.2) {
    return { bg: '#b95c5c', text: '#ffffff' } // Muted Salmon
  } else {
    return { bg: '#d45d5d', text: '#ffffff' } // Soft Coral/Salmon Red
  }
}

// Robust Percentage-Based Squarified Treemap Layout Engine
function squarifyPct<T extends { weight: number }>(items: T[]): PctRect<T>[] {
  if (!items.length) return []

  const totalWeight = items.reduce((sum, item) => sum + Math.max(item.weight, 0.05), 0)
  const W = 1000
  const H = 1000
  const totalArea = W * H

  const normalized = items.map((item) => ({
    raw: item,
    area: (Math.max(item.weight, 0.05) / totalWeight) * totalArea,
  }))

  const rawResults: Array<{ raw: T; x: number; y: number; w: number; h: number }> = []

  function worst(row: typeof normalized, w: number): number {
    const sum = row.reduce((acc, curr) => acc + curr.area, 0)
    if (sum === 0 || w === 0) return Infinity
    let max = -Infinity
    let min = Infinity
    for (const r of row) {
      if (r.area > max) max = r.area
      if (r.area < min) min = r.area
    }
    return Math.max((w * w * max) / (sum * sum), (sum * sum) / (w * w * min))
  }

  function layoutRow(
    row: typeof normalized,
    rect: { x: number; y: number; w: number; h: number },
  ): { x: number; y: number; w: number; h: number } {
    const sum = row.reduce((acc, curr) => acc + curr.area, 0)
    const isHorizontal = rect.w >= rect.h
    const rowThickness = isHorizontal ? sum / rect.h : sum / rect.w
    let offset = 0

    for (const { raw, area } of row) {
      const itemLength = area / rowThickness
      if (isHorizontal) {
        rawResults.push({
          raw,
          x: rect.x,
          y: rect.y + offset,
          w: Math.max(rowThickness, 1),
          h: Math.max(itemLength, 1),
        })
      } else {
        rawResults.push({
          raw,
          x: rect.x + offset,
          y: rect.y,
          w: Math.max(itemLength, 1),
          h: Math.max(rowThickness, 1),
        })
      }
      offset += itemLength
    }

    if (isHorizontal) {
      return { x: rect.x + rowThickness, y: rect.y, w: Math.max(rect.w - rowThickness, 0), h: rect.h }
    } else {
      return { x: rect.x, y: rect.y + rowThickness, w: rect.w, h: Math.max(rect.h - rowThickness, 0) }
    }
  }

  function step(children: typeof normalized, rect: { x: number; y: number; w: number; h: number }) {
    if (children.length === 0 || rect.w <= 0 || rect.h <= 0) return
    if (children.length === 1) {
      rawResults.push({ raw: children[0].raw, x: rect.x, y: rect.y, w: rect.w, h: rect.h })
      return
    }

    const shortSide = Math.min(rect.w, rect.h)
    let row: typeof normalized = [children[0]]
    let remaining = children.slice(1)

    while (remaining.length > 0) {
      const nextItem = remaining[0]
      const nextRow = [...row, nextItem]
      if (worst(nextRow, shortSide) <= worst(row, shortSide)) {
        row = nextRow
        remaining = remaining.slice(1)
      } else {
        break
      }
    }

    const newRect = layoutRow(row, rect)
    step(remaining, newRect)
  }

  step(normalized, { x: 0, y: 0, w: W, h: H })

  return rawResults.map((r) => ({
    item: r.raw,
    leftPct: (r.x / W) * 100,
    topPct: (r.y / H) * 100,
    widthPct: (r.w / W) * 100,
    heightPct: (r.h / H) * 100,
  }))
}

export function Heatmap({
  indexName = 'NIFTY 50',
  stocks = [],
  timeframe = '1D',
  loading = false,
  onSelectStock,
  onClose,
  onChangeIndex,
}: HeatmapProps) {
  const [hoveredStock, setHoveredStock] = useState<EnrichedStock | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Determine market region from current indexName
  const [activeMarket, setActiveMarket] = useState<MarketRegion>(() => {
    if (indexName.includes('S&P') || indexName.includes('NASDAQ') || indexName.includes('DOW')) return 'US'
    if (indexName.includes('NIKKEI') || indexName.includes('FTSE') || indexName.includes('DAX')) return 'GLOBAL'
    return 'INDIA'
  })

  useEffect(() => {
    if (indexName.includes('S&P') || indexName.includes('NASDAQ') || indexName.includes('DOW')) {
      setActiveMarket('US')
    } else if (indexName.includes('NIKKEI') || indexName.includes('FTSE') || indexName.includes('DAX')) {
      setActiveMarket('GLOBAL')
    } else {
      setActiveMarket('INDIA')
    }
  }, [indexName])

  // Get live market status & reason
  const marketStatus = useMemo(() => {
    return getMarketStatus(activeMarket)
  }, [activeMarket])

  // Process & enrich constituents
  const enrichedStocks: EnrichedStock[] = useMemo(() => {
    if (!stocks || stocks.length === 0) return []

    return stocks
      .map((s) => {
        const info = getCompanyInfo(s.ticker, s.name)
        const returnVal = s.periods?.[timeframe] ?? s.change_pct ?? 0
        const weight = Math.max(info.weight, 0.2)
        const pts = parseFloat((returnVal * (weight / 10)).toFixed(2))

        return {
          ...s,
          info,
          returnVal,
          weight,
          pts,
        }
      })
      .filter((s) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          s.ticker.toLowerCase().includes(q) ||
          s.info.name.toLowerCase().includes(q) ||
          s.info.sector.toLowerCase().includes(q)
        )
      })
  }, [stocks, timeframe, searchQuery])

  // Group by sector
  const sectors = useMemo(() => {
    const map = new Map<string, EnrichedStock[]>()
    enrichedStocks.forEach((s) => {
      const sec = s.info.sector || 'Others'
      if (!map.has(sec)) map.set(sec, [])
      map.get(sec)!.push(s)
    })

    return Array.from(map.entries())
      .map(([name, sectorStocks]) => {
        const sectorWeight = sectorStocks.reduce((sum, s) => sum + s.weight, 0)
        const sectorReturn =
          sectorStocks.reduce((sum, s) => sum + s.returnVal * s.weight, 0) / (sectorWeight || 1)
        return {
          name,
          weight: Math.max(sectorWeight, 0.5),
          returnVal: sectorReturn,
          stocks: sectorStocks.sort((a, b) => b.weight - a.weight),
        }
      })
      .sort((a, b) => b.weight - a.weight)
  }, [enrichedStocks])

  // Nested Treemap Layout
  const nestedLayout = useMemo(() => {
    if (!sectors.length) return []
    const sectorRects = squarifyPct(sectors)

    return sectorRects.map((sr) => {
      const stockRects = squarifyPct(sr.item.stocks)
      return {
        sector: sr.item,
        leftPct: sr.leftPct,
        topPct: sr.topPct,
        widthPct: sr.widthPct,
        heightPct: sr.heightPct,
        stocks: stockRects,
      }
    })
  }, [sectors])

  // Movers
  const topGainers = useMemo(() => {
    return [...enrichedStocks]
      .filter((s) => s.pts > 0)
      .sort((a, b) => b.pts - a.pts)
      .slice(0, 5)
  }, [enrichedStocks])

  const topLosers = useMemo(() => {
    return [...enrichedStocks]
      .filter((s) => s.pts <= 0)
      .sort((a, b) => a.pts - b.pts)
      .slice(0, 5)
  }, [enrichedStocks])

  const handleMarketChange = (market: MarketRegion) => {
    setActiveMarket(market)
    const firstIndex = MARKET_INDICES[market][0].id
    if (onChangeIndex) onChangeIndex(firstIndex)
  }

  return (
    <div className="bg-white dark:bg-[#0b101b] border border-stone-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm relative select-none w-full text-stone-900 dark:text-slate-100">
      {/* 1. Market Filter & Live Status Banner */}
      <div className="space-y-3 mb-4 pb-4 border-b border-stone-200 dark:border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Market Region Filter: India | US | Global */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
            {(['INDIA', 'US', 'GLOBAL'] as MarketRegion[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleMarketChange(m)}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap',
                  activeMarket === m
                    ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-slate-700'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
                )}
              >
                {m === 'INDIA' ? 'India (NSE / BSE)' : m === 'US' ? 'United States (NYSE)' : 'Global Markets'}
              </button>
            ))}
          </div>

          {/* Market Live Status with Reason */}
          <div className="flex items-center gap-2 self-start lg:self-auto text-xs">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl border font-medium',
                marketStatus.isLive
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20'
                  : marketStatus.isPreMarket
                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20'
                  : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  marketStatus.isLive ? 'bg-emerald-500 animate-pulse' : marketStatus.isPreMarket ? 'bg-amber-500' : 'bg-stone-400',
                )}
              />
              <span className="font-semibold">{marketStatus.label}</span>
              <span className="text-stone-400 dark:text-slate-500">•</span>
              <span className="text-[11px] opacity-90">{marketStatus.subText}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-400 dark:text-slate-500 font-mono">
              <Clock className="w-3 h-3" />
              <span>{marketStatus.localTime}</span>
            </div>
          </div>
        </div>

        {/* 2. Index Selector Chips for Current Market */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {MARKET_INDICES[activeMarket].map((idx) => (
              <button
                key={idx.id}
                type="button"
                onClick={() => onChangeIndex && onChangeIndex(idx.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap border',
                  indexName === idx.id
                    ? 'bg-stone-900 text-white dark:bg-slate-800 dark:text-white border-stone-900 dark:border-slate-700'
                    : 'bg-stone-50 dark:bg-slate-900/60 text-stone-600 dark:text-slate-400 border-stone-200 dark:border-slate-800 hover:text-stone-900 dark:hover:text-white',
                )}
              >
                {idx.name}
              </button>
            ))}
          </div>

          {/* Close button if inline preview */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200 dark:border-slate-800 self-end md:self-auto"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3. Wide Search Bar for Heatmap Constituents */}
        <div className="relative w-full pt-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter stocks in ${indexName} by ticker, company name, or sector...`}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-72 sm:h-96 flex flex-col items-center justify-center text-stone-400 dark:text-slate-500 text-xs">
          <span className="w-6 h-6 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mb-3" />
          Loading constituents and index points for {indexName}…
        </div>
      ) : enrichedStocks.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-stone-400 dark:text-slate-500 text-xs">
          No constituent stocks matched your query for {indexName}
        </div>
      ) : (
        /* Main Layout: Treemap Canvas + Movers Sidebar */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
          {/* Left: Treemap Canvas */}
          <div className="lg:col-span-8 xl:col-span-9 bg-stone-100 dark:bg-[#070b14] border border-stone-200 dark:border-slate-800/80 rounded-xl p-1 relative w-full overflow-hidden">
            <div
              className="relative w-full h-[380px] sm:h-[480px] md:h-[540px] lg:h-[580px] select-none overflow-hidden"
              onMouseLeave={() => setHoveredStock(null)}
            >
              {nestedLayout.map(({ sector, leftPct, topPct, widthPct, heightPct, stocks: sectorStockRects }) => {
                const isSecUp = sector.returnVal >= 0
                return (
                  <div
                    key={sector.name}
                    className="absolute border border-black/40 box-border overflow-hidden bg-black/10"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                    }}
                  >
                    {/* Sector Header Tag */}
                    <div className="absolute top-0 left-0 right-0 z-10 px-1 py-0.5 bg-black/60 backdrop-blur-xs flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-slate-200 pointer-events-none truncate border-b border-white/5">
                      <span className="truncate">{sector.name}</span>
                      <span className={cn('font-mono font-bold', isSecUp ? 'text-emerald-400' : 'text-rose-400')}>
                        {formatPct(sector.returnVal)}
                      </span>
                    </div>

                    {/* Stock Tiles */}
                    <div className="absolute inset-0 pt-4">
                      {sectorStockRects.map(({ item: stock, leftPct: sl, topPct: st, widthPct: sw, heightPct: sh }) => {
                        const tileColor = getAlphaveTileColor(stock.returnVal)
                        const isHovered = hoveredStock?.ticker === stock.ticker
                        const symbol = cleanSymbol(stock.ticker)

                        return (
                          <div
                            key={stock.ticker}
                            onClick={() => onSelectStock && onSelectStock(stock)}
                            onMouseEnter={() => setHoveredStock(stock)}
                            className={cn(
                              'absolute box-border cursor-pointer transition-transform duration-100 flex flex-col items-center justify-center p-1 text-center border border-black/25',
                              isHovered ? 'z-30 scale-[1.02] ring-2 ring-white shadow-xl' : 'z-0',
                            )}
                            style={{
                              left: `${sl}%`,
                              top: `${st}%`,
                              width: `${sw}%`,
                              height: `${sh}%`,
                              backgroundColor: tileColor.bg,
                              color: tileColor.text,
                            }}
                          >
                            <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none">
                              {/* Logo for reasonable sized tiles */}
                              {sw > 10 && sh > 12 && (
                                <CompanyLogo
                                  ticker={stock.ticker}
                                  name={stock.info.name}
                                  domain={stock.info.domain}
                                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mb-1 shadow-sm"
                                  size={64}
                                />
                              )}

                              {/* Ticker */}
                              <span
                                className={cn(
                                  'font-bold tracking-tight text-white drop-shadow-sm truncate max-w-full px-0.5 leading-tight',
                                  sw > 15 ? 'text-xs sm:text-sm' : sw > 8 ? 'text-[10px] sm:text-xs' : 'text-[9px]',
                                )}
                              >
                                {symbol}
                              </span>

                              {/* Return % */}
                              <span
                                className={cn(
                                  'font-mono font-medium drop-shadow-sm leading-tight mt-0.5',
                                  sw > 15 ? 'text-[11px] sm:text-xs' : 'text-[9px] sm:text-[10px]',
                                )}
                              >
                                {formatPct(stock.returnVal)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Movers Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Top Impact Gainers */}
            <div className="bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Top Index Drivers
              </h4>
              <div className="space-y-1.5">
                {topGainers.map((s) => (
                  <div
                    key={s.ticker}
                    onClick={() => onSelectStock && onSelectStock(s)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200 dark:border-slate-700/60 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CompanyLogo ticker={s.ticker} name={s.info.name} className="w-4 h-4 rounded-full" size={32} />
                      <span className="font-semibold">{cleanSymbol(s.ticker)}</span>
                    </div>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      +{s.pts} pts ({formatPct(s.returnVal)})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Impact Losers */}
            <div className="bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                Top Index Drags
              </h4>
              <div className="space-y-1.5">
                {topLosers.map((s) => (
                  <div
                    key={s.ticker}
                    onClick={() => onSelectStock && onSelectStock(s)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200 dark:border-slate-700/60 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CompanyLogo ticker={s.ticker} name={s.info.name} className="w-4 h-4 rounded-full" size={32} />
                      <span className="font-semibold">{cleanSymbol(s.ticker)}</span>
                    </div>
                    <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                      {s.pts} pts ({formatPct(s.returnVal)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Heatmap
