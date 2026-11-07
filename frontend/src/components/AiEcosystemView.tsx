import { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  ShieldAlert,
  Rocket,
  Zap,
  Globe2,
  ExternalLink,
  Flame,
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react'
import { fetchAiIntelligence, fetchAiStocks } from '../lib/api'
import { formatCurrency, formatPct, cn } from '../lib/utils'
import { CompanyLogo } from './CompanyLogo'
import { Heatmap } from './Heatmap'

type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y'

type AiEcosystemViewProps = {
  timeframe: Timeframe
  onSelectStock: (stock: any) => void
  onOpenConfig?: () => void
  aiEnabled?: boolean
  onToggleAi?: () => void
}

export function AiEcosystemView({
  timeframe,
  onSelectStock,
  aiEnabled = true,
  onToggleAi,
}: AiEcosystemViewProps) {
  const [intel, setIntel] = useState<any>(null)
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<'return' | 'price' | 'volume'>('return')
  const [sortAsc, setSortAsc] = useState(false)
  const [viewMode, setViewMode] = useState<'both' | 'heatmap' | 'screener'>('both')

  const loadData = () => {
    setLoading(true)
    Promise.all([
      fetchAiIntelligence(aiEnabled).catch(() => null),
      fetchAiStocks().catch(() => ({ stocks: [] })),
    ]).then(([intelRes, stocksRes]) => {
      setIntel(intelRes)
      setStocks(stocksRes?.stocks || [])
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [aiEnabled])

  const categories = useMemo(() => {
    const set = new Set(stocks.map((s) => s.category).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [stocks])

  const filteredStocks = useMemo(() => {
    return stocks
      .filter((s) => {
        const matchesCategory = activeCategory === 'ALL' || s.category === activeCategory
        const matchesSearch =
          searchQuery === '' ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.sub && s.sub.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        let valA = 0
        let valB = 0
        if (sortField === 'return') {
          valA = a.periods?.[timeframe] ?? a.change_pct ?? 0
          valB = b.periods?.[timeframe] ?? b.change_pct ?? 0
        } else if (sortField === 'price') {
          valA = a.price || 0
          valB = b.price || 0
        } else if (sortField === 'volume') {
          valA = a.volume || 0
          valB = b.volume || 0
        }
        return sortAsc ? valA - valB : valB - valA
      })
  }, [stocks, activeCategory, searchQuery, sortField, sortAsc, timeframe])

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] bg-stone-50 dark:bg-slate-900/40 rounded-2xl border border-stone-200 dark:border-slate-800">
        <span className="w-7 h-7 border-2 border-stone-400 dark:border-slate-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-stone-600 dark:text-slate-300 font-medium">Scanning AI Silicon, Supercomputing & Model Landscape…</p>
        <span className="text-[11px] text-stone-400 dark:text-slate-500 mt-1">Aggregating breaking security breaches, breakthroughs, and valuations</span>
      </div>
    )
  }

  const briefing = intel?.briefing
  const events = intel?.events || []

  return (
    <div className="space-y-6 w-full max-w-full text-stone-900 dark:text-slate-100">
      {/* 1. Header Banner & Executive AI World Briefing */}
      <div className="bg-white dark:bg-[#0e1422] border border-stone-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#b7eb4d]" />
                AI Silicon & Supercycle
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
                Avg Session Move: {intel?.avg_return >= 0 ? '+' : ''}
                {formatPct(intel?.avg_return || 0)}
              </span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase',
                  briefing?.sentiment?.includes('Bullish')
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20',
                )}
              >
                {briefing?.sentiment || 'Bullish Momentum'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold mt-2.5 tracking-tight text-stone-900 dark:text-white">
              {briefing?.headline || 'AI Supercycle Advances on Hyperscaler Compute Demand'}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onToggleAi && (
              <button
                type="button"
                onClick={onToggleAi}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all',
                  aiEnabled
                    ? 'bg-[#b7eb4d]/15 text-[#5e7f17] dark:text-[#b7eb4d] border-[#b7eb4d]/40 hover:bg-[#b7eb4d]/25'
                    : 'bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-slate-400 border-stone-200 dark:border-slate-700 hover:text-stone-700 dark:hover:text-slate-300',
                )}
                title={aiEnabled ? 'AI LLM Synthesis Active - Click to switch to Heuristic Engine' : 'Heuristic Engine (0 API Tokens) Active - Click to enable LLM'}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI: {aiEnabled ? 'ON' : 'OFF'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-slate-700 transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-3">
            <p className="text-xs sm:text-sm text-stone-700 dark:text-slate-300 leading-relaxed font-sans">
              {briefing?.executive_summary}
            </p>

            {/* Key Drivers */}
            {briefing?.key_drivers && briefing.key_drivers.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400 block mb-1.5">
                  Macro Catalysts:
                </span>
                <div className="space-y-1.5">
                  {briefing.key_drivers.map((kd: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 dark:text-slate-300">
                      <span className="text-emerald-600 dark:text-[#b7eb4d] font-bold">•</span>
                      <span>{kd}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Engine Info Badge */}
          <div className="lg:col-span-4 bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider block">
                Intelligence Engine
              </span>
              <div className="text-xs font-medium text-stone-800 dark:text-slate-200 flex items-center gap-2">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    intel?.is_llm ? 'bg-emerald-500' : 'bg-stone-400',
                  )}
                />
                <span>{intel?.source}</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 leading-normal">
                Synthesizing silicon bottlenecks, power grids, frontier model benchmarks, and cybersecurity incidents.
              </p>
            </div>
            <div className="text-[10px] text-stone-400 dark:text-slate-500 pt-3 border-t border-stone-200 dark:border-slate-800">
              Coverage: US Hyperscalers • Global Silicon • Indian Server & IT OEMs
            </div>
          </div>
        </div>
      </div>

      {/* 2. Breaking Real-Time AI World Events Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-600 dark:text-[#b7eb4d]" />
            World of AI Dispatches (Model Releases, Hacks & Capex)
          </h3>
          <span className="text-xs text-stone-500 dark:text-slate-500">Live verified feeds</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {events.slice(0, 6).map((item: any, idx: number) => {
            const isHack = item.tag?.includes('Security')
            const isRelease = item.tag?.includes('Model')
            const isPower = item.tag?.includes('Power')

            return (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-white dark:bg-[#0e1422] hover:bg-stone-50 dark:hover:bg-slate-800/80 border border-stone-200 dark:border-slate-800 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1',
                        isHack
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                          : isRelease
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                          : isPower
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : 'bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-300 border-stone-200 dark:border-slate-700',
                      )}
                    >
                      {isHack ? (
                        <ShieldAlert className="w-3 h-3" />
                      ) : isRelease ? (
                        <Rocket className="w-3 h-3" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                      <span>{item.tag.replace(/^[^\w]+/, '')}</span>
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-slate-500 font-mono">{item.source}</span>
                  </div>

                  <h5 className="text-xs font-semibold text-stone-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-[#b7eb4d] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h5>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-[#b7eb4d] mt-3 pt-2 border-t border-stone-100 dark:border-slate-800/80">
                  <span>Read dispatch</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {/* 3. Sub-View Switcher: Heatmap vs Screener vs Both */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
              viewMode === 'both'
                ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs border border-stone-200 dark:border-slate-700'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
            )}
          >
            All Views
          </button>
          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1',
              viewMode === 'heatmap'
                ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs border border-stone-200 dark:border-slate-700'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
            )}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>AI Heatmap</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('screener')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1',
              viewMode === 'screener'
                ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs border border-stone-200 dark:border-slate-700'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI Tape Screener</span>
          </button>
        </div>

        <span className="text-xs text-stone-500 dark:text-slate-400">
          Showing <strong>{filteredStocks.length}</strong> AI value chain assets • {timeframe} returns
        </span>
      </div>

      {/* 4. AI Ecosystem Treemap Heatmap */}
      {(viewMode === 'both' || viewMode === 'heatmap') && (
        <div className="space-y-3">
          <Heatmap
            indexName="AI ECOSYSTEM"
            stocks={stocks}
            timeframe={timeframe}
            onSelectStock={(s) =>
              onSelectStock({
                name: s.name || s.ticker.replace('.NS', ''),
                ticker: s.ticker,
                price: s.price,
                currency: s.currency || 'USD',
                periods: s.periods,
                volume: s.volume,
                high: s.high,
                low: s.low,
                open: s.open,
              })
            }
          />
        </div>
      )}

      {/* 5. AI Institutional Screener Table */}
      {(viewMode === 'both' || viewMode === 'screener') && (
        <div className="bg-white dark:bg-[#0e1422] border border-stone-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-[#b7eb4d]" />
                AI Infrastructure & Stock Tape
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                Sortable performance metrics, ranges, and sector classifications
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter AI stocks..."
                className="w-full pl-9 pr-3.5 py-1.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border',
                  activeCategory === cat
                    ? 'bg-stone-900 text-white dark:bg-slate-800 dark:text-white border-stone-900 dark:border-slate-700'
                    : 'bg-stone-50 dark:bg-slate-900/60 text-stone-600 dark:text-slate-400 border-stone-200 dark:border-slate-800 hover:text-stone-900 dark:hover:text-white',
                )}
              >
                {cat === 'ALL' ? 'All AI Pillars' : cat}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto no-scrollbar rounded-xl border border-stone-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 dark:bg-slate-900/80 text-stone-500 dark:text-slate-400 border-b border-stone-200 dark:border-slate-800 font-semibold text-[11px]">
                  <th className="py-3 px-3.5">Asset / Company</th>
                  <th className="py-3 px-3.5">Subsector</th>
                  <th
                    className="py-3 px-3.5 text-right cursor-pointer hover:text-stone-900 dark:hover:text-white"
                    onClick={() => {
                      setSortField('price')
                      setSortAsc(!sortAsc)
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Price</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3.5 text-right cursor-pointer hover:text-stone-900 dark:hover:text-white"
                    onClick={() => {
                      setSortField('return')
                      setSortAsc(!sortAsc)
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{timeframe} Return</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3.5 text-right hidden sm:table-cell">1D</th>
                  <th className="py-3 px-3.5 text-right hidden md:table-cell">1M</th>
                  <th className="py-3 px-3.5 text-right hidden lg:table-cell">YTD</th>
                  <th
                    className="py-3 px-3.5 text-right cursor-pointer hover:text-stone-900 dark:hover:text-white hidden xl:table-cell"
                    onClick={() => {
                      setSortField('volume')
                      setSortAsc(!sortAsc)
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Volume</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3.5 text-center">SWOT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60 bg-white dark:bg-transparent">
                {filteredStocks.map((stock) => {
                  const currentChange = stock.periods?.[timeframe] ?? stock.change_pct ?? 0
                  const isUp = currentChange >= 0
                  const isIndian = stock.ticker.endsWith('.NS') || stock.ticker.endsWith('.BO')

                  return (
                    <tr
                      key={stock.ticker}
                      onClick={() =>
                        onSelectStock({
                          name: stock.name,
                          ticker: stock.ticker,
                          price: stock.price,
                          currency: stock.currency || (isIndian ? 'INR' : 'USD'),
                          periods: stock.periods,
                          volume: stock.volume,
                          high: stock.high,
                          low: stock.low,
                          open: stock.open,
                          sub: stock.sub,
                        })
                      }
                      className="hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Name & Logo */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <CompanyLogo
                            ticker={stock.ticker}
                            name={stock.name}
                            className="w-7 h-7 rounded-full shadow-xs"
                            size={64}
                          />
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-[#b7eb4d] transition-colors flex items-center gap-1.5">
                              <span>{stock.name}</span>
                              {isIndian && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium">
                                  India
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-stone-500 dark:text-slate-400">{stock.ticker}</div>
                          </div>
                        </div>
                      </td>

                      {/* AI Subsector */}
                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700 block max-w-fit">
                          {stock.sub || stock.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3.5 text-right font-mono font-semibold">
                        {formatCurrency(stock.price, stock.currency || (isIndian ? 'INR' : 'USD'))}
                      </td>

                      {/* Timeframe Return */}
                      <td className="py-3 px-3.5 text-right font-mono font-semibold">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-md text-xs',
                            isUp
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
                          )}
                        >
                          {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {formatPct(currentChange)}
                        </span>
                      </td>

                      {/* 1D Return */}
                      <td className="py-3 px-3.5 text-right font-mono text-stone-600 dark:text-slate-300 hidden sm:table-cell">
                        <span className={stock.periods?.['1D'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {formatPct(stock.periods?.['1D'] ?? stock.change_pct ?? 0)}
                        </span>
                      </td>

                      {/* 1M Return */}
                      <td className="py-3 px-3.5 text-right font-mono text-stone-600 dark:text-slate-300 hidden md:table-cell">
                        <span className={stock.periods?.['1M'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {stock.periods?.['1M'] !== undefined ? formatPct(stock.periods?.['1M']) : '—'}
                        </span>
                      </td>

                      {/* YTD Return */}
                      <td className="py-3 px-3.5 text-right font-mono text-stone-600 dark:text-slate-300 hidden lg:table-cell">
                        <span className={stock.periods?.['YTD'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {stock.periods?.['YTD'] !== undefined ? formatPct(stock.periods?.['YTD']) : '—'}
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-3.5 text-right font-mono text-stone-500 dark:text-slate-400 hidden xl:table-cell">
                        {stock.volume ? stock.volume.toLocaleString('en-IN') : '—'}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 transition-colors"
                        >
                          SWOT →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
