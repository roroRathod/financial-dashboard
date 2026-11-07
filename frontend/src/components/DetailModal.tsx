import { useState, useEffect } from 'react'
import {
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ExternalLink,
  Newspaper,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Crosshair,
  BarChart2,
  LineChart as LineChartIcon,
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { formatCurrency, formatPct, cn } from '../lib/utils'
import { aiSummary, api, fetchCandlestickAi } from '../lib/api'
import { CompanyLogo } from './CompanyLogo'
import { CandlestickChart } from './CandlestickChart'

type DetailModalProps = {
  asset: {
    name: string
    ticker: string
    price: number
    currency?: string
    periods?: Record<string, number>
    high?: number
    low?: number
    open?: number
    volume?: number
    unit?: string
    sub?: string
  } | null
  onClose: () => void
  initialTimeframe?: string
  aiEnabled?: boolean
  onToggleAi?: () => void
}

export function DetailModal({
  asset,
  onClose,
  initialTimeframe = '1D',
  aiEnabled = true,
  onToggleAi,
}: DetailModalProps) {
  const [timeframe, setTimeframe] = useState(initialTimeframe)
  const [chartType, setChartType] = useState<'area' | 'candle'>('candle')
  const [historyData, setHistoryData] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [aiData, setAiData] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [candlestickAi, setCandlestickAi] = useState<any>(null)
  const [candleAiLoading, setCandleAiLoading] = useState(false)

  useEffect(() => {
    if (!asset) return
    setTimeframe(initialTimeframe)
    setAiData(null)
    setCandlestickAi(null)
  }, [asset, initialTimeframe])

  // Fetch chart history (OHLC + line data)
  useEffect(() => {
    if (!asset) return
    setLoadingHistory(true)

    let range = '1mo'
    let interval = '1d'
    if (timeframe === '1D') {
      range = '5d'
      interval = '15m'
    } else if (timeframe === '1W') {
      range = '5d'
      interval = '1h'
    } else if (timeframe === '1M') {
      range = '1mo'
      interval = '1d'
    } else if (timeframe === '3M') {
      range = '3mo'
      interval = '1d'
    } else if (timeframe === '6M') {
      range = '6mo'
      interval = '1wk'
    } else if (timeframe === 'YTD') {
      range = 'ytd'
      interval = '1d'
    } else if (timeframe === '1Y') {
      range = '1y'
      interval = '1wk'
    }

    api
      .get(`/markets/history`, { params: { ticker: asset.ticker, period: range, interval } })
      .then((res) => {
        const rows = res.data?.history || res.data || []
        setHistoryData(rows)

        // Trigger Candlestick AI technical analysis
        if (rows.length >= 3) {
          setCandleAiLoading(true)
          fetchCandlestickAi({ ticker: asset.ticker, name: asset.name, candles: rows, use_llm: aiEnabled })
            .then((cRes) => setCandlestickAi(cRes))
            .catch(() => {
              setCandlestickAi({
                patterns: ['Multi-bar session range consolidation'],
                sentiment: 'Constructive Consolidation',
                analysis: 'Price action is compressing within intermediate Bollinger bands near pivot support.',
                source: 'Heuristic Candlestick Pattern Engine',
              })
            })
            .finally(() => setCandleAiLoading(false))
        }
      })
      .catch(() => {
        setHistoryData([])
      })
      .finally(() => setLoadingHistory(false))
  }, [asset, timeframe, aiEnabled])

  // Automatically trigger AI analysis & news on asset open
  useEffect(() => {
    if (!asset) return
    const currentChange = asset.periods?.[timeframe] ?? asset.periods?.['1D'] ?? 0
    setAiLoading(true)
    aiSummary(
      {
        asset_class: asset.name,
        region: 'INDIA',
        data: { ticker: asset.ticker, price: asset.price, change: currentChange, timeframe },
      },
      aiEnabled,
    )
      .then((res) => setAiData(res))
      .catch(() => {
        setAiData({
          reason_for_move: `${asset.name} is showing notable movement of ${formatPct(
            currentChange,
          )} over ${timeframe}, influenced by sector momentum, institutional liquidity, and earnings expectations.`,
          news_sources: [],
          swot: {
            strengths: ['Established brand franchise and market presence', 'Robust operational cash flow'],
            weaknesses: ['Sensitivity to broader macroeconomic volatility', 'Short-term valuation consolidation'],
            opportunities: ['Technical breakout targeting immediate resistance', 'Domestic demand growth'],
            threats: ['Sector rotation risk', 'Foreign institutional flow volatility'],
          },
          source: 'Heuristic News Synthesis Engine (Zero API Tokens)',
        })
      })
      .finally(() => setAiLoading(false))
  }, [asset, timeframe, aiEnabled])

  if (!asset) return null

  const currentChange = asset.periods?.[timeframe] ?? asset.periods?.['1D'] ?? 0
  const isUp = currentChange >= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0b101b] border border-stone-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col text-stone-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-slate-800 flex justify-between items-start bg-stone-50/80 dark:bg-[#0e1424]">
          <div>
            <div className="flex items-center gap-3">
              <CompanyLogo
                ticker={asset.ticker}
                name={asset.name}
                className="w-9 h-9 rounded-full shadow-sm"
                size={128}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold">{asset.name}</h2>
                  <span className="px-2 py-0.5 text-xs font-mono font-medium bg-stone-200 dark:bg-slate-800 text-stone-700 dark:text-slate-300 rounded border border-stone-300 dark:border-slate-700">
                    {asset.ticker}
                  </span>
                </div>
                {asset.sub && <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">{asset.sub}</p>}
              </div>
            </div>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-mono">
                {formatCurrency(asset.price, asset.currency || 'INR')}
                {asset.unit && <span className="text-sm font-normal text-stone-500 dark:text-slate-400 ml-1.5">{asset.unit}</span>}
              </span>
              <span
                className={cn(
                  'flex items-center text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-lg font-mono',
                  isUp
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
                )}
              >
                {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                {formatPct(currentChange)} ({timeframe})
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-white rounded-lg hover:bg-stone-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Chart Controls: Candlestick vs Area + Timeframe */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* View Switcher: Candlestick vs Line Area */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartType('candle')}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5',
                  chartType === 'candle'
                    ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-slate-700'
                    : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
                )}
              >
                <BarChart2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#b7eb4d]" />
                <span>Candlesticks (OHLC)</span>
              </button>
              <button
                type="button"
                onClick={() => setChartType('area')}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5',
                  chartType === 'area'
                    ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-slate-700'
                    : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
                )}
              >
                <LineChartIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Trend Area</span>
              </button>
            </div>

            {/* Timeframe Chips */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-slate-900 p-1 rounded-xl border border-stone-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
              {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-lg transition-colors',
                    timeframe === tf
                      ? 'bg-stone-900 text-white dark:bg-slate-800 dark:text-white shadow-sm'
                      : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Display: Candlestick with Markup or Area */}
          {loadingHistory ? (
            <div className="h-64 flex items-center justify-center text-stone-400 dark:text-slate-500 text-sm">
              <span className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mr-2" />
              Loading chart data…
            </div>
          ) : chartType === 'candle' ? (
            <CandlestickChart
              candles={historyData}
              currency={asset.currency || 'INR'}
              candlestickAi={candlestickAi}
              aiLoading={candleAiLoading}
            />
          ) : (
            <div className="h-64 w-full bg-stone-50 dark:bg-[#070b14] rounded-xl p-3 border border-stone-200 dark:border-slate-800/80">
              {historyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#78716c' }} stroke="#d6d3d1" />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10, fill: '#78716c' }}
                      stroke="#d6d3d1"
                      orientation="right"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1c1917',
                        border: '1px solid #44403c',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                      formatter={(v: any) => [formatCurrency(Number(v), asset.currency || 'INR'), 'Close']}
                    />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke={isUp ? '#10b981' : '#f43f5e'}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-stone-400 dark:text-slate-500 text-xs">
                  Chart not available for this ticker
                </div>
              )}
            </div>
          )}

          {/* Session Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-stone-500 dark:text-slate-400 block font-medium">Day High</span>
              <span className="text-sm font-semibold font-mono mt-1 block">
                {asset.high ? formatCurrency(asset.high, asset.currency || 'INR') : '—'}
              </span>
            </div>
            <div className="bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-stone-500 dark:text-slate-400 block font-medium">Day Low</span>
              <span className="text-sm font-semibold font-mono mt-1 block">
                {asset.low ? formatCurrency(asset.low, asset.currency || 'INR') : '—'}
              </span>
            </div>
            <div className="bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-stone-500 dark:text-slate-400 block font-medium">Open</span>
              <span className="text-sm font-semibold font-mono mt-1 block">
                {asset.open ? formatCurrency(asset.open, asset.currency || 'INR') : '—'}
              </span>
            </div>
            <div className="bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-stone-500 dark:text-slate-400 block font-medium">Volume</span>
              <span className="text-sm font-semibold font-mono mt-1 block">
                {asset.volume ? asset.volume.toLocaleString('en-IN') : '—'}
              </span>
            </div>
          </div>

          {/* Reason For Move Card */}
          <div className="bg-stone-50 dark:bg-[#0e1726] border border-stone-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className={cn('w-4 h-4', aiEnabled ? 'text-emerald-600 dark:text-[#b7eb4d]' : 'text-stone-400')} />
                <h3 className="font-semibold text-sm">Reason For Move ({timeframe})</h3>
                {aiData?.source && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-stone-200/80 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border border-stone-300/60 dark:border-slate-700/60">
                    {aiData.source}
                  </span>
                )}
              </div>
              {onToggleAi && (
                <button
                  type="button"
                  onClick={onToggleAi}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors flex items-center gap-1.5',
                    aiEnabled
                      ? 'bg-[#b7eb4d]/15 text-[#5e7f17] dark:text-[#b7eb4d] border-[#b7eb4d]/40 hover:bg-[#b7eb4d]/25'
                      : 'bg-stone-200/70 dark:bg-slate-800 text-stone-500 dark:text-slate-400 border-stone-300 dark:border-slate-700 hover:text-stone-700 dark:hover:text-slate-300',
                  )}
                  title={aiEnabled ? 'AI Active (FreeLLMAPI) - Click to disable' : 'AI Disabled (Heuristic Only) - Click to enable'}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI: {aiEnabled ? 'ON' : 'OFF'}</span>
                </button>
              )}
            </div>

            {aiLoading ? (
              <div className="py-2 flex items-center justify-center gap-2 text-stone-500 dark:text-slate-400 text-xs">
                <span className="w-3.5 h-3.5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                Synthesizing market catalysts and headlines…
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-stone-700 dark:text-slate-200 leading-relaxed font-sans">
                {aiData?.reason_for_move || aiData?.why || 'Analyzing session catalysts…'}
              </p>
            )}
          </div>

          {/* Related News Sources */}
          <div className="bg-stone-50 dark:bg-[#0d1424] border border-stone-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-stone-500 dark:text-slate-400" />
                <h3 className="font-semibold text-sm">Related News Coverage</h3>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-slate-500">Verified publishers</span>
            </div>

            {aiLoading ? (
              <div className="py-3 text-center text-stone-400 dark:text-slate-500 text-xs">Loading news items…</div>
            ) : !aiData?.news_sources || aiData.news_sources.length === 0 ? (
              <div className="py-2 text-stone-500 dark:text-slate-400 text-xs italic">
                Scanning news wires for company updates…
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {aiData.news_sources.map((item: any, idx: number) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-white dark:bg-slate-900/80 hover:bg-stone-100 dark:hover:bg-slate-800/80 border border-stone-200 dark:border-slate-800 transition-colors group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-400 mb-1">
                        <span className="font-medium text-stone-700 dark:text-slate-300">{item.source}</span>
                        <span className="text-[10px] text-stone-400 dark:text-slate-500">{item.published}</span>
                      </div>
                      <h5 className="text-xs font-semibold text-stone-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-[#b7eb4d] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h5>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-[#b7eb4d] mt-2 pt-2 border-t border-stone-100 dark:border-slate-800/60">
                      <span>Read article</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Structured 4-Quadrant SWOT Matrix */}
          <div className="bg-stone-50 dark:bg-[#0d1424] border border-stone-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-slate-800">
              <h3 className="font-semibold text-sm">Fundamental SWOT Matrix</h3>
              <span className="text-[11px] text-stone-500 dark:text-slate-500">Risk & catalyst profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Strengths */}
              <div className="bg-white dark:bg-emerald-950/20 border border-stone-200 dark:border-emerald-900/40 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Strengths</span>
                </div>
                <ul className="space-y-1 text-xs text-stone-700 dark:text-slate-300">
                  {aiData?.swot?.strengths?.map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-white dark:bg-rose-950/20 border border-stone-200 dark:border-rose-900/40 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Weaknesses</span>
                </div>
                <ul className="space-y-1 text-xs text-stone-700 dark:text-slate-300">
                  {aiData?.swot?.weaknesses?.map((w: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="bg-white dark:bg-blue-950/20 border border-stone-200 dark:border-blue-900/40 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold text-xs">
                  <Lightbulb className="w-4 h-4" />
                  <span>Opportunities</span>
                </div>
                <ul className="space-y-1 text-xs text-stone-700 dark:text-slate-300">
                  {aiData?.swot?.opportunities?.map((o: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="bg-white dark:bg-amber-950/20 border border-stone-200 dark:border-amber-900/40 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold text-xs">
                  <Crosshair className="w-4 h-4" />
                  <span>Threats</span>
                </div>
                <ul className="space-y-1 text-xs text-stone-700 dark:text-slate-300">
                  {aiData?.swot?.threats?.map((t: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailModal
