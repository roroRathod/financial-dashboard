import { useState, useEffect } from 'react'
import {
  BarChart3,
  Flame,
  Filter,
  Coins,
  Briefcase,
  Layers,
  Cpu,
  Sun,
  Moon,
  Radio,
  Sparkles,
} from 'lucide-react'
import { MarketCard } from '../components/MarketCard'
import { NewsGrid } from '../components/NewsGrid'
import { Heatmap } from '../components/Heatmap'
import { ScreenerTable } from '../components/ScreenerTable'
import { InvestmentsPanel } from '../components/InvestmentsPanel'
import { DetailModal } from '../components/DetailModal'
import { GlobalSearch } from '../components/GlobalSearch'
import { AiEcosystemView } from '../components/AiEcosystemView'
import { RoroLogo } from '../components/RoroLogo'
import { WorldClockHeader } from '../components/WorldClockHeader'
import { TailscaleStatusModal } from '../components/TailscaleStatusModal'
import { useTheme } from '../context/ThemeContext'
import {
  fetchMarkets,
  fetchCommodities,
  fetchFX,
  fetchNews,
  fetchScreener,
  checkBackendHealth,
} from '../lib/api'
import { formatCurrency, formatPct, cn } from '../lib/utils'

type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y'
type DashboardTab = 'markets' | 'ai-ecosystem' | 'heatmap' | 'screener' | 'commodities' | 'portfolio'

export function Dashboard() {
  const { theme, toggleTheme } = useTheme()
  const [markets, setMarkets] = useState<any>({})
  const [commodities, setCommodities] = useState<any>({})
  const [fx, setFx] = useState<any>({})
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Master AI Analysis Toggle (persisted to localStorage)
  const [aiEnabled, setAiEnabled] = useState<boolean>(() => {
    return localStorage.getItem('roro_ai_enabled') !== 'false'
  })

  const toggleAi = () => {
    setAiEnabled((prev) => {
      const next = !prev
      localStorage.setItem('roro_ai_enabled', String(next))
      return next
    })
  }

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<DashboardTab>('markets')
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const [commodityCurrency, setCommodityCurrency] = useState<'INR' | 'USD'>('INR')
  const [activeRegion, setActiveRegion] = useState<'INDIA' | 'US' | 'GLOBAL'>('INDIA')
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null)

  // Heatmap State
  const [heatmapIndex, setHeatmapIndex] = useState<string>('NIFTY 50')
  const [heatmapStocks, setHeatmapStocks] = useState<any[]>([])
  const [loadingHeatmap, setLoadingHeatmap] = useState(false)

  // Inline preview heatmap for overview tab
  const [overviewHeatmapIndex, setOverviewHeatmapIndex] = useState<string | null>(null)
  const [overviewHeatmapStocks, setOverviewHeatmapStocks] = useState<any[]>([])
  const [loadingOverviewHeatmap, setLoadingOverviewHeatmap] = useState(false)

  // Load stocks when heatmapIndex changes
  const loadHeatmapData = (indexName: string) => {
    setLoadingHeatmap(true)
    fetchScreener(indexName)
      .then((res) => {
        setHeatmapStocks(res.stocks || res.data || [])
      })
      .catch(() => {
        setHeatmapStocks([])
      })
      .finally(() => {
        setLoadingHeatmap(false)
      })
  }

  useEffect(() => {
    loadHeatmapData(heatmapIndex)
  }, [heatmapIndex])

  // Overview tab index click handler
  const handleOverviewIndexClick = (name: string) => {
    if (overviewHeatmapIndex === name) {
      setOverviewHeatmapIndex(null)
      return
    }
    setOverviewHeatmapIndex(name)
    setLoadingOverviewHeatmap(true)
    fetchScreener(name)
      .then((res) => {
        setOverviewHeatmapStocks(res.stocks || res.data || [])
      })
      .catch(() => {
        setOverviewHeatmapStocks([])
      })
      .finally(() => {
        setLoadingOverviewHeatmap(false)
      })
  }

  // Switch directly to dedicated heatmap tab
  const openDedicatedHeatmap = (name: string) => {
    setHeatmapIndex(name)
    setActiveTab('heatmap')
  }

  // Tailscale connection & backend health state
  const [tailscaleOnline, setTailscaleOnline] = useState<boolean | null>(null)
  const [showTailscaleModal, setShowTailscaleModal] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const health = await checkBackendHealth()
    setTailscaleOnline(health.ok)
    if (!health.ok) {
      setShowTailscaleModal(true)
    }

    try {
      const [m, c, f, n] = await Promise.all([
        fetchMarkets().catch(() => ({})),
        fetchCommodities().catch(() => ({})),
        fetchFX().catch(() => ({})),
        fetchNews().catch(() => ({})),
      ])
      setMarkets(m.markets || m.data || m || {})
      setCommodities(c.commodities || c.data || c || {})
      setFx(f.fx || f.data || f || {})
      const newsList = Array.isArray(n) ? n : (n.news || n.data || [])
      setNews(newsList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] w-full bg-[#f7f5ef] dark:bg-[#090d16] text-stone-800 dark:text-slate-200">
        <span className="w-8 h-8 rounded-full border-2 border-stone-400 dark:border-slate-600 border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-medium tracking-wide text-stone-500 dark:text-slate-400">Loading live market quotes…</p>
      </div>
    )
  }

  const activeIndices = markets[activeRegion] || {}

  const tabs: { id: DashboardTab; label: string; icon: any }[] = [
    { id: 'markets', label: 'Markets', icon: BarChart3 },
    { id: 'ai-ecosystem', label: 'AI Supercycle', icon: Cpu },
    { id: 'heatmap', label: 'Heatmap', icon: Flame },
    { id: 'screener', label: 'Screener', icon: Filter },
    { id: 'commodities', label: 'Commodities', icon: Coins },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  ]

  return (
    <div className="min-h-screen bg-[#f7f5ef] dark:bg-[#090d16] text-stone-900 dark:text-slate-100 w-full max-w-full px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-4 sm:space-y-5 transition-colors duration-150">
      {/* Top Header Bar: Roro Branding, Search Bar, Theme Switcher & Timeframe */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-stone-200 dark:border-slate-800">
        {/* Brand: roro. rathod */}
        <div className="flex items-center justify-between lg:justify-start gap-4">
          <RoroLogo size="md" />

          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="lg:hidden p-2 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-stone-700 dark:text-slate-300"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>
        </div>

        {/* Global Search Bar (Wider) */}
        <div className="w-full lg:flex-1 lg:max-w-lg lg:mx-4">
          <GlobalSearch onSelectAsset={(asset) => setSelectedAsset(asset)} />
        </div>

        {/* Right Controls: Timeframe Selector, Theme Switcher & Clock */}
        <div className="flex items-center justify-between lg:justify-end gap-2.5 flex-wrap">
          {/* Global Timeframe Chips */}
          <div className="flex items-center bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {(['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap',
                  timeframe === tf
                    ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs border border-stone-200/80 dark:border-slate-700'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* AI Analysis Master Toggle */}
          <button
            type="button"
            onClick={toggleAi}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all',
              aiEnabled
                ? 'bg-[#b7eb4d]/15 text-[#5e7f17] dark:text-[#b7eb4d] border-[#b7eb4d]/40 hover:bg-[#b7eb4d]/25'
                : 'bg-white dark:bg-slate-900 text-stone-500 dark:text-slate-400 border-stone-200 dark:border-slate-800 hover:text-stone-700 dark:hover:text-slate-300',
            )}
            title={
              aiEnabled
                ? 'AI Engine ON: Generating institutional synthesis via FreeLLMAPI'
                : 'AI Engine OFF: Zero external API calls (instant algorithmic heuristic engine)'
            }
          >
            <Sparkles className={cn('w-3.5 h-3.5', aiEnabled ? 'text-emerald-600 dark:text-[#b7eb4d]' : 'text-stone-400')} />
            <span>AI: {aiEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Desktop Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-850 text-xs font-medium transition-colors"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-stone-600" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Tailscale Connection Status Indicator */}
          {tailscaleOnline === false ? (
            <button
              type="button"
              onClick={() => setShowTailscaleModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
              title="Tailscale disconnected - Click to troubleshoot"
            >
              <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Tailscale Disconnected</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowTailscaleModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-mono text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              title="Connected to Tailscale backend - Click to check"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px]">Tailscale</span>
            </button>
          )}

          {/* World Clocks: Analog Clocks with Live Hands & Hover Digital Flyout */}
          <div className="hidden sm:flex items-center pl-2 border-l border-stone-200 dark:border-slate-800">
            <WorldClockHeader />
          </div>
        </div>
      </header>

      {/* Tailscale Offline Alert Banner */}
      {tailscaleOnline === false && (
        <div className="flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200/90 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Cannot reach backend server.</strong> Make sure you are connected to Tailscale on this device to load live quotes and data.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTailscaleModal(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-600 text-white dark:bg-amber-500 dark:text-stone-950 font-medium text-xs hover:opacity-90 shrink-0 transition-opacity"
          >
            Check Status
          </button>
        </div>
      )}

      {/* Main Tab Strip: Real Flat Tab Interface (Unslop) */}
      <nav className="flex items-center gap-1 sm:gap-2 border-b border-stone-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap border-b-2',
                isActive
                  ? 'border-[#1b4313] dark:border-[#b7eb4d] text-stone-900 dark:text-white font-semibold'
                  : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 hover:border-stone-300 dark:hover:border-slate-700',
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-[#1b4313] dark:text-[#b7eb4d]' : 'text-stone-400 dark:text-slate-500')} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* TAB 1: MARKETS OVERVIEW */}
      {activeTab === 'markets' && (
        <div className="space-y-6">
          {/* Region Tabs & Market Grid */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
                {(['INDIA', 'US', 'GLOBAL'] as const).map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setActiveRegion(reg)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap',
                      activeRegion === reg
                        ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs border border-stone-200 dark:border-slate-700'
                        : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
                    )}
                  >
                    {reg === 'INDIA' ? 'India (NSE / BSE)' : reg === 'US' ? 'United States (NYSE)' : 'Global Markets'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400">
                <span>Click any market card to inspect constituents or view inline treemap</span>
              </div>
            </div>

            {/* Market Indices Grid - Exactly 5 items across all regions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {Object.entries(activeIndices).map(([name, q]: [string, any]) => (
                <MarketCard
                  key={name}
                  name={name}
                  q={q}
                  timeframe={timeframe}
                  isActiveIndex={overviewHeatmapIndex === name}
                  actionLabel={overviewHeatmapIndex === name ? 'Close Heatmap' : 'View Heatmap'}
                  onClick={() => handleOverviewIndexClick(name)}
                />
              ))}
            </div>

            {/* Inline Heatmap (When toggled directly from MarketCard) */}
            {overviewHeatmapIndex && (
              <div className="pt-2">
                <div className="flex items-center justify-between bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-t-xl px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-emerald-600 dark:text-[#b7eb4d]" />
                    <span className="font-semibold">{overviewHeatmapIndex} Treemap</span>
                    <span className="text-stone-500 dark:text-slate-400">({timeframe} return)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openDedicatedHeatmap(overviewHeatmapIndex)}
                      className="text-emerald-700 dark:text-[#b7eb4d] hover:underline font-medium text-xs"
                    >
                      Open in Full Heatmap Tab
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverviewHeatmapIndex(null)}
                      className="text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white px-2 py-1 rounded bg-stone-200 dark:bg-slate-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <Heatmap
                  indexName={overviewHeatmapIndex}
                  stocks={overviewHeatmapStocks}
                  timeframe={timeframe}
                  loading={loadingOverviewHeatmap}
                  onClose={() => setOverviewHeatmapIndex(null)}
                  onChangeIndex={(idx) => handleOverviewIndexClick(idx)}
                  onSelectStock={(s) =>
                    setSelectedAsset({
                      name: s.ticker.replace('.NS', '').replace('.BO', ''),
                      ticker: s.ticker,
                      price: s.price,
                      currency: 'INR',
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
          </section>

          {/* FX Rates, Macro & News Grid Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Real-time News Feeds */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              <NewsGrid news={news} />
            </div>

            {/* Right: Macro FX Spot & Quick Screener Preview */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* FX Spot Rates */}
              <div className="bg-white dark:bg-[#0e1422] border border-stone-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600 dark:text-[#b7eb4d]" />
                      Foreign Exchange & Spot Macro Benchmarks
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Spot conversion rates</p>
                  </div>
                  <span className="text-xs text-stone-500 dark:text-slate-400 font-mono">Spot</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {Object.entries(fx).map(([name, q]: [string, any]) => {
                    const changePct = q.periods?.[timeframe] ?? q.change_pct ?? 0
                    const isUp = changePct >= 0
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          setSelectedAsset({
                            name,
                            ticker: q.ticker || name,
                            price: q.price,
                            currency: q.currency,
                            periods: q.periods,
                            volume: q.volume,
                          })
                        }
                        className="p-3 bg-stone-50 dark:bg-slate-900/60 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200 dark:border-slate-800 rounded-lg text-left transition-colors group"
                      >
                        <div className="text-xs text-stone-500 dark:text-slate-400 group-hover:text-stone-900 dark:group-hover:text-white font-medium">
                          {name}
                        </div>
                        <div className="text-base font-bold font-mono text-stone-900 dark:text-white mt-1">
                          {formatCurrency(q.price, q.currency || 'INR')}
                        </div>
                        <div
                          className={cn(
                            'text-[11px] font-semibold mt-1 font-mono',
                            isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                          )}
                        >
                          {formatPct(changePct)} ({timeframe})
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Screener Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-600 dark:text-[#b7eb4d]" />
                    Market Tape
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('screener')}
                    className="text-xs text-emerald-700 dark:text-[#b7eb4d] hover:underline font-semibold"
                  >
                    Open Full Screener
                  </button>
                </div>
                <ScreenerTable onSelectStock={(s) => setSelectedAsset(s)} defaultTimeframe={timeframe} />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: AI SUPERCYCLE & STOCKS */}
      {activeTab === 'ai-ecosystem' && (
        <AiEcosystemView
          timeframe={timeframe}
          onSelectStock={(s) => setSelectedAsset(s)}
          onOpenConfig={() => {}}
          aiEnabled={aiEnabled}
          onToggleAi={toggleAi}
        />
      )}

      {/* TAB 3: DEDICATED FULL-WIDTH HEATMAP */}
      {activeTab === 'heatmap' && (
        <Heatmap
          indexName={heatmapIndex}
          stocks={heatmapStocks}
          timeframe={timeframe}
          loading={loadingHeatmap}
          onChangeIndex={(idx) => setHeatmapIndex(idx)}
          onSelectStock={(s) =>
            setSelectedAsset({
              name: s.ticker.replace('.NS', '').replace('.BO', ''),
              ticker: s.ticker,
              price: s.price,
              currency: 'INR',
              periods: s.periods,
              volume: s.volume,
              high: s.high,
              low: s.low,
              open: s.open,
            })
          }
        />
      )}

      {/* TAB 4: DEDICATED LIVE SCREENER */}
      {activeTab === 'screener' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0e1422] border border-stone-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Filter className="w-5 h-5 text-emerald-600 dark:text-[#b7eb4d]" />
                Institutional Screener & Tape
              </h2>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                Multi-timeframe performance, 52-week ranges, volume confirmation, and fundamental SWOT profiles
              </p>
            </div>

            <ScreenerTable onSelectStock={(s) => setSelectedAsset(s)} defaultTimeframe={timeframe} />
          </div>
        </div>
      )}

      {/* TAB 5: COMMODITIES (₹ / $) */}
      {activeTab === 'commodities' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0e1422] border border-stone-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600 dark:text-[#b7eb4d]" />
                Commodities Desk
                <span className="text-xs font-normal text-stone-500 dark:text-slate-400">
                  {commodityCurrency === 'INR' ? '— Indian Domestic Buying Rates' : '— International Benchmark Rates'}
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">
                {commodityCurrency === 'INR'
                  ? 'Calculated in domestic consumer units (per 10g Gold, per 1kg Silver, per Gallon Fuel) factoring import duty (15%) + GST (3%) + spot USDINR.'
                  : 'Benchmark international commodity futures in standard COMEX/NYMEX trading units ($/oz, $/lb, $/barrel, $/tonne).'}
              </p>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setCommodityCurrency('INR')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                  commodityCurrency === 'INR'
                    ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs border border-stone-200 dark:border-slate-700'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
                )}
              >
                Domestic Rates (₹)
              </button>
              <button
                type="button"
                onClick={() => setCommodityCurrency('USD')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                  commodityCurrency === 'USD'
                    ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs border border-stone-200 dark:border-slate-700'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
                )}
              >
                International ($)
              </button>
            </div>
          </div>

          {/* Commodities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(commodities).map(([name, c]: [string, any]) => (
              <MarketCard
                key={name}
                name={name}
                q={{
                  price: commodityCurrency === 'INR' ? c.inr?.price : c.usd?.price,
                  change: c.change,
                  change_pct: c.change_pct,
                  periods: c.periods,
                  currency: commodityCurrency,
                  ticker: c.ticker,
                  high: c.high,
                  low: c.low,
                  open: c.open,
                  volume: c.volume,
                }}
                inrData={c.inr}
                usdData={c.usd}
                currencyMode={commodityCurrency}
                timeframe={timeframe}
                onClick={() =>
                  setSelectedAsset({
                    name,
                    ticker: c.ticker,
                    price: commodityCurrency === 'INR' ? c.inr?.price : c.usd?.price,
                    currency: commodityCurrency,
                    unit: commodityCurrency === 'INR' ? c.inr?.unit : c.usd?.unit,
                    sub: commodityCurrency === 'INR' ? c.inr?.sub : c.usd?.sub,
                    periods: c.periods,
                    high: c.high,
                    low: c.low,
                    open: c.open,
                    volume: c.volume,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PORTFOLIO & WATCHLIST */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          <InvestmentsPanel />
        </div>
      )}

      {/* Interactive Detail Modal (with Candlestick Chart, Markup, AI Analysis & SWOT) */}
      {selectedAsset && (
        <DetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          initialTimeframe={timeframe}
          aiEnabled={aiEnabled}
          onToggleAi={toggleAi}
        />
      )}

      {/* Tailscale Troubleshooting Modal */}
      <TailscaleStatusModal
        isOpen={showTailscaleModal}
        onClose={() => setShowTailscaleModal(false)}
        onSuccess={() => {
          setTailscaleOnline(true)
          loadData()
        }}
      />
    </div>
  )
}

export default Dashboard
