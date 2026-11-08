import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react'
import { fetchScreener } from '../lib/api'
import { formatCurrency, formatPct, cn } from '../lib/utils'
import { getCompanyInfo, cleanSymbol } from '../lib/companyData'
import { CompanyLogo } from './CompanyLogo'

type Stock = {
  ticker: string
  price: number
  change?: number
  change_pct?: number
  periods?: Record<string, number>
  volume?: number
  high?: number
  low?: number
  open?: number
  currency?: string
}

type ScreenerProps = {
  onSelectStock?: (stock: any) => void
  initialIndex?: string
  defaultTimeframe?: string
}

type BoardFilter = 'all' | 'gainers' | 'losers' | 'volume' | 'leaders' | 'highs'
type SortField = 'ticker' | 'price' | 'change_pct' | 'volume' | 'weight'
type SortDir = 'asc' | 'desc'

const UNIVERSE_INDICES = [
  'NIFTY 50',
  'BANK NIFTY',
  'ALL NSE',
  'F&O',
  'SENSEX',
  'NIFTY MIDCAP 150',
  'NASDAQ 100',
  'S&P 500',
]

const SECTORS = [
  'All Sectors',
  'Banking & Finance',
  'Technology',
  'Energy & Power',
  'Auto & Mobility',
  'FMCG & Retail',
  'Infrastructure',
  'Pharma & Health',
  'Metal & Mining',
  'Telecom & Comm',
  'Consumer Services',
  'Aviation & Logistics',
]

export function ScreenerTable({
  onSelectStock,
  initialIndex = 'NIFTY 50',
  defaultTimeframe = '1D',
}: ScreenerProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  const [boardFilter, setBoardFilter] = useState<BoardFilter>('all')
  const [selectedSector, setSelectedSector] = useState('All Sectors')
  const [searchQuery, setSearchQuery] = useState('')
  const [timeframe, setTimeframe] = useState(defaultTimeframe)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  // Sorting
  const [sortField, setSortField] = useState<SortField>('change_pct')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Fetch stocks when selectedIndex changes
  useEffect(() => {
    setLoading(true)
    fetchScreener(selectedIndex)
      .then((res) => {
        setStocks(res.stocks || res.data || [])
      })
      .catch(() => {
        setStocks([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [selectedIndex])

  // Benchmark index points for points calculation
  const basePoints = useMemo(() => {
    const norm = selectedIndex.toUpperCase()
    if (norm.includes('BANK')) return 52000
    if (norm.includes('SENSEX')) return 79000
    if (norm.includes('NASDAQ')) return 19500
    if (norm.includes('S&P')) return 5800
    return 24150 // Nifty 50 default
  }, [selectedIndex])

  // Enrich stocks with company metadata, points, and returns
  const enrichedStocks = useMemo(() => {
    return stocks.map((s) => {
      const returnVal = s.periods?.[timeframe] ?? s.change_pct ?? 0
      const liveName = (s as any).name || (s as any).long_name
      const info = getCompanyInfo(s.ticker, liveName)
      const weight = info.weight || 1.0
      const pts = (weight / 100) * (returnVal / 100) * basePoints

      // Estimate 52W / Intraday range position
      const low = s.low ?? s.price * 0.98
      const high = s.high ?? s.price * 1.02
      const rangeSpan = Math.max(high - low, 0.01)
      const rangePosPct = Math.min(Math.max(((s.price - low) / rangeSpan) * 100, 5), 95)

      return {
        ...s,
        info,
        returnVal,
        weight,
        pts: Math.round(pts * 10) / 10,
        low,
        high,
        rangePosPct,
      }
    })
  }, [stocks, timeframe, basePoints])

  // Filter stocks based on Board, Sector, and Search query
  const filteredStocks = useMemo(() => {
    let result = enrichedStocks

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (s) =>
          cleanSymbol(s.ticker).toLowerCase().includes(q) ||
          s.info.name.toLowerCase().includes(q) ||
          s.info.sector.toLowerCase().includes(q),
      )
    }

    // Sector dropdown filter
    if (selectedSector !== 'All Sectors') {
      result = result.filter((s) => s.info.sector === selectedSector)
    }

    // Alphave Board presets
    if (boardFilter === 'gainers') {
      result = result.filter((s) => s.returnVal > 0)
    } else if (boardFilter === 'losers') {
      result = result.filter((s) => s.returnVal < 0)
    } else if (boardFilter === 'volume') {
      // Top 30% volume
      const avgVol = result.reduce((sum, s) => sum + (s.volume || 0), 0) / Math.max(result.length, 1)
      result = result.filter((s) => (s.volume || 0) >= avgVol * 0.9)
    } else if (boardFilter === 'leaders') {
      // Top market-cap weights
      result = result.filter((s) => s.weight >= 2.0)
    } else if (boardFilter === 'highs') {
      // Near day high (top 25% of day range)
      result = result.filter((s) => s.rangePosPct >= 70)
    }

    // Apply sorting
    return [...result].sort((a, b) => {
      let valA: any = a[sortField]
      let valB: any = b[sortField]

      if (sortField === 'change_pct') {
        valA = a.returnVal
        valB = b.returnVal
      } else if (sortField === 'ticker') {
        valA = cleanSymbol(a.ticker)
        valB = cleanSymbol(b.ticker)
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [enrichedStocks, searchQuery, selectedSector, boardFilter, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  return (
    <div className="bg-white dark:bg-[#0e1422] border border-stone-200 dark:border-slate-800 rounded-2xl p-3 sm:p-6 shadow-xs space-y-4 select-none text-stone-900 dark:text-slate-100 max-w-full">
      {/* 1. Screener Top Header & Index Universe Pills */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pb-4 border-b border-stone-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Market Screener
            </h2>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
              Institutional Tape
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">
            Real-time scanner across indices with momentum, volume anomalies, point impacts, and SWOT analysis.
          </p>
        </div>

        {/* Timeframe Controls */}
        <div className="flex items-center bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-0.5 sm:p-1 rounded-xl self-start lg:self-auto overflow-x-auto no-scrollbar max-w-full shrink-0">
          {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={cn(
                'px-2 sm:px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap',
                timeframe === tf
                  ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs border border-stone-200 dark:border-slate-700'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Index Universe Switcher Bar (Nifty 50, Bank Nifty, All NSE, F&O, etc.) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1">
        <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 shrink-0 mr-1">
          Universe:
        </span>
        {UNIVERSE_INDICES.map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedIndex(idx)}
            className={cn(
              'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold tracking-tight whitespace-nowrap transition-colors shrink-0',
              selectedIndex === idx
                ? 'bg-stone-900 text-white dark:bg-slate-800 dark:text-white shadow-xs border border-stone-900 dark:border-slate-700'
                : 'bg-stone-50 dark:bg-slate-900/80 text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-slate-800',
            )}
          >
            {idx}
          </button>
        ))}
      </div>

      {/* 3. Alphave Preset Boards & Search / Sector Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Board Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1 md:pb-0 md:flex-wrap">
          {[
            { id: 'all', label: 'All Stocks', icon: SlidersHorizontal },
            { id: 'gainers', label: 'Top Gainers', icon: TrendingUp, color: 'text-emerald-400' },
            { id: 'losers', label: 'Top Losers', icon: TrendingDown, color: 'text-red-400' },
            { id: 'volume', label: 'Volume Shockers', icon: Flame, color: 'text-amber-400' },
            { id: 'leaders', label: 'Sector Leaders', icon: Award, color: 'text-blue-400' },
            { id: 'highs', label: '52W Highs', icon: Zap, color: 'text-purple-400' },
          ].map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => setBoardFilter(id as BoardFilter)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0',
                boardFilter === id
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-900',
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', color || 'text-slate-400')} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Search & Sector Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-56 md:w-64 min-w-0 flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker, company..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sector Filter Dropdown */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {SECTORS.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Screener High-Density Table */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3" />
          Scanning live tape for {selectedIndex}…
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-sm">
          <span>No stocks match your active board or search filters</span>
          <button
            type="button"
            onClick={() => {
              setBoardFilter('all')
              setSelectedSector('All Sectors')
              setSearchQuery('')
            }}
            className="mt-2 text-xs text-blue-400 hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-sm select-none border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
                <th
                  onClick={() => handleSort('ticker')}
                  className="px-2.5 sm:px-4 py-2 sm:py-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company & Stock</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="px-2.5 sm:px-4 py-2 sm:py-3 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('change_pct')}
                  className="px-2.5 sm:px-4 py-2 sm:py-3 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{timeframe} Return</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Intraday Range (L — H)</th>
                <th
                  onClick={() => handleSort('volume')}
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right hidden sm:table-cell"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('weight')}
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right hidden lg:table-cell"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Index Impact</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60 bg-white dark:bg-[#090e18]">
              {filteredStocks.map((s) => {
                const symbol = cleanSymbol(s.ticker)
                const isUp = s.returnVal >= 0
                const isIndian = s.ticker.includes('.NS') || s.ticker.includes('.BO')

                return (
                  <tr
                    key={s.ticker}
                    onClick={() => onSelectStock?.(s)}
                    className="hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* 1. Company & Asset */}
                    <td className="px-2.5 sm:px-4 py-2.5 sm:py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <CompanyLogo
                          ticker={s.ticker}
                          name={s.info.name}
                          domain={s.info.domain}
                          className="w-6 h-6 sm:w-7 sm:h-7 shadow-xs shrink-0"
                          size={96}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-semibold text-stone-900 dark:text-white text-xs sm:text-sm font-mono group-hover:text-emerald-700 dark:group-hover:text-[#b7eb4d] transition-colors truncate">
                              {symbol}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-slate-800/80 text-stone-600 dark:text-slate-400 border border-stone-200 dark:border-slate-700/50 hidden sm:inline-block">
                              {s.info.sector}
                            </span>
                          </div>
                          <div className="text-[11px] sm:text-xs text-stone-500 dark:text-slate-400 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px]">
                            {s.info.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Price */}
                    <td className="px-2.5 sm:px-4 py-2.5 sm:py-3 text-right font-mono font-semibold text-stone-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">
                      {formatCurrency(s.price, isIndian ? 'INR' : 'USD')}
                    </td>

                    {/* 3. Return % Pill & Points */}
                    <td className="px-2.5 sm:px-4 py-2.5 sm:py-3 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 font-semibold text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md font-mono',
                            isUp
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
                          )}
                        >
                          {isUp ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {formatPct(s.returnVal)}
                        </span>
                        {s.pts !== 0 && (
                          <span
                            className={cn(
                              'text-[10px] font-mono mt-0.5',
                              isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                            )}
                          >
                            {s.pts >= 0 ? `+${s.pts} pts` : `${s.pts} pts`}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Day Range Visual Bar */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="w-36 mx-auto">
                        <div className="flex justify-between text-[10px] font-mono text-stone-500 dark:text-slate-400 mb-1">
                          <span>{s.low.toFixed(1)}</span>
                          <span>{s.high.toFixed(1)}</span>
                        </div>
                        <div className="relative w-full h-1.5 bg-stone-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', isUp ? 'bg-emerald-500' : 'bg-rose-500')}
                            style={{ width: `${s.rangePosPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 5. Volume */}
                    <td className="px-4 py-3 text-right font-mono text-xs text-stone-700 dark:text-slate-300 hidden sm:table-cell">
                      <div>{(s.volume || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-stone-400 dark:text-slate-500 font-sans">shares</div>
                    </td>

                    {/* 6. Weight */}
                    <td className="px-4 py-3 text-right font-mono text-xs text-stone-500 dark:text-slate-400 hidden lg:table-cell">
                      <div className="text-stone-900 dark:text-white font-medium">{s.weight.toFixed(1)}% wt</div>
                      <div className="text-[10px] text-stone-400 dark:text-slate-500">of index</div>
                    </td>

                    {/* 7. Action Button */}
                    <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-[#b7eb4d] opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="hidden sm:inline">SWOT</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Footer Stats & Source Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 text-xs text-slate-500 border-t border-slate-800/80">
        <div>
          Showing <span className="text-slate-300 font-semibold">{filteredStocks.length}</span> of{' '}
          <span className="text-slate-300 font-semibold">{stocks.length}</span> stocks in{' '}
          <span className="text-blue-400 font-semibold">{selectedIndex}</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          Alphave Live-Tape Engine • Real-time volume & momentum tracking
        </div>
      </div>
    </div>
  )
}

export default ScreenerTable
