import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, TrendingUp, TrendingDown, X, Sparkles } from 'lucide-react'
import { CompanyLogo } from './CompanyLogo'
import { KNOWN_COMPANIES, cleanSymbol, getCompanyInfo } from '../lib/companyData'
import { formatCurrency, formatPct, cn } from '../lib/utils'
import { searchMarkets } from '../lib/api'

type SearchItem = {
  id: string
  ticker: string
  name: string
  category: 'Stock' | 'Index' | 'Commodity' | 'Forex'
  price?: number
  change_pct?: number
  currency?: string
  sub?: string
}

const STATIC_MARKET_ITEMS: SearchItem[] = [
  // Indices
  { id: '^NSEI', ticker: '^NSEI', name: 'NIFTY 50', category: 'Index', price: 24148.2, change_pct: 1.25, currency: 'INR' },
  { id: '^BSESN', ticker: '^BSESN', name: 'SENSEX', category: 'Index', price: 79486.3, change_pct: 1.10, currency: 'INR' },
  { id: '^NSEBANK', ticker: '^NSEBANK', name: 'BANK NIFTY', category: 'Index', price: 51876.5, change_pct: 1.85, currency: 'INR' },
  { id: '^NSEMDCP150', ticker: '^NSEMDCP150', name: 'NIFTY MIDCAP 150', category: 'Index', price: 21340.0, change_pct: 0.95, currency: 'INR' },
  { id: '^NDX', ticker: '^NDX', name: 'NASDAQ 100', category: 'Index', price: 21100.5, change_pct: 1.42, currency: 'USD' },
  { id: '^GSPC', ticker: '^GSPC', name: 'S&P 500', category: 'Index', price: 5980.2, change_pct: 0.88, currency: 'USD' },
  { id: '^DJI', ticker: '^DJI', name: 'DOW JONES', category: 'Index', price: 43720.0, change_pct: 0.55, currency: 'USD' },

  // Commodities
  { id: 'GC=F', ticker: 'GC=F', name: 'Gold', category: 'Commodity', price: 13410.5, change_pct: 2.1, currency: 'INR', sub: '₹ / g' },
  { id: 'SI=F', ticker: 'SI=F', name: 'Silver', category: 'Commodity', price: 98500.0, change_pct: 1.4, currency: 'INR', sub: '₹ / kg' },
  { id: 'CL=F', ticker: 'CL=F', name: 'Crude Oil WTI', category: 'Commodity', price: 162.5, change_pct: -0.8, currency: 'INR', sub: '₹ / gal' },
  { id: 'BZ=F', ticker: 'BZ=F', name: 'Crude Oil Brent', category: 'Commodity', price: 171.2, change_pct: -0.6, currency: 'INR', sub: '₹ / gal' },
  { id: 'NG=F', ticker: 'NG=F', name: 'Natural Gas', category: 'Commodity', price: 24.8, change_pct: -1.2, currency: 'INR', sub: '₹ / gal' },
  { id: 'HG=F', ticker: 'HG=F', name: 'Copper', category: 'Commodity', price: 865.0, change_pct: 0.7, currency: 'INR', sub: '₹ / kg' },

  // Forex
  { id: 'USD/INR', ticker: 'USDINR=X', name: 'USD/INR', category: 'Forex', price: 88.65, change_pct: 0.05, currency: 'INR' },
  { id: 'EUR/INR', ticker: 'EURINR=X', name: 'EUR/INR', category: 'Forex', price: 95.80, change_pct: -0.15, currency: 'INR' },
  { id: 'GBP/INR', ticker: 'GBPINR=X', name: 'GBP/INR', category: 'Forex', price: 114.20, change_pct: 0.22, currency: 'INR' },
  { id: 'JPY/INR', ticker: 'JPYINR=X', name: 'JPY/INR', category: 'Forex', price: 0.58, change_pct: -0.30, currency: 'INR' },
]

type GlobalSearchProps = {
  onSelectAsset: (asset: any) => void
  marketQuotes?: Record<string, any>
}

export function GlobalSearch({ onSelectAsset, marketQuotes = {} }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [remoteResults, setRemoteResults] = useState<SearchItem[]>([])
  const modalInputRef = useRef<HTMLInputElement>(null)

  // Listen for keyboard shortcut "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault()
        setIsOpen(true)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => modalInputRef.current?.focus(), 50)
      setSelectedIndex(0)
    } else {
      setQuery('')
      setRemoteResults([])
    }
  }, [isOpen])

  // Live remote search from Yahoo Finance
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setRemoteResults([])
      return
    }
    const timer = setTimeout(() => {
      searchMarkets(query.trim())
        .then((res) => {
          const raw = res.results || []
          const mapped: SearchItem[] = raw.map((r: any) => {
            const isIndian = r.ticker.includes('.NS') || r.ticker.includes('.BO')
            const info = getCompanyInfo(r.ticker, r.name)
            return {
              id: r.ticker,
              ticker: r.ticker,
              name: info.name || r.name,
              category: r.category || 'Stock',
              currency: isIndian ? 'INR' : 'USD',
              sub: r.exchange ? `${r.exchange} · ${info.sector}` : info.sector,
            }
          })
          setRemoteResults(mapped)
        })
        .catch(() => setRemoteResults([]))
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // Build searchable database
  const allSearchItems = useMemo<SearchItem[]>(() => {
    const list: SearchItem[] = [...STATIC_MARKET_ITEMS]

    // Add all stocks from KNOWN_COMPANIES
    for (const [sym, info] of Object.entries(KNOWN_COMPANIES)) {
      const isIndian = !['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'GOOG', 'META', 'TSLA', 'AVGO', 'BRK-B', 'JPM', 'V', 'UNH', 'XOM', 'LLY', 'COST', 'HD', 'PG', 'JNJ', 'MA', 'NFLX', 'AMD', 'ASML', 'PEP', 'ADBE', 'CSCO', 'TMUS', 'QCOM', 'INTC', 'TXN', 'AMGN', 'GS', 'CAT', 'CRM', 'MCD', 'BA', 'HON', 'TRV', 'AXP', 'IBM', 'WMT', 'DIS', 'CVX'].includes(sym)
      
      const ticker = isIndian ? `${sym}.NS` : sym
      const live = marketQuotes[sym] || marketQuotes[ticker]

      list.push({
        id: sym,
        ticker,
        name: info.name,
        category: 'Stock',
        price: live?.price || 1250.0,
        change_pct: live?.change_pct || 1.2,
        currency: isIndian ? 'INR' : 'USD',
        sub: info.sector,
      })
    }

    return list
  }, [marketQuotes])

  // Filtered results (local + live remote search)
  const filtered = useMemo(() => {
    if (!query.trim()) {
      return allSearchItems.slice(0, 8)
    }
    const q = query.toLowerCase().trim()
    const local = allSearchItems.filter(
      (item) =>
        item.ticker.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        cleanSymbol(item.ticker).toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.sub && item.sub.toLowerCase().includes(q)),
    )

    // Deduplicate with remote results
    const seen = new Set(local.map((i) => i.ticker.toUpperCase()))
    const uniqueRemote = remoteResults.filter((r) => !seen.has(r.ticker.toUpperCase()))

    return [...local, ...uniqueRemote].slice(0, 12)
  }, [allSearchItems, query, remoteResults])

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false)
    onSelectAsset({
      name: item.name,
      ticker: item.ticker,
      price: item.price || 0,
      currency: item.currency || 'INR',
      sub: item.sub,
    })
  }

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(filtered.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(filtered.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex])
      }
    }
  }

  return (
    <>
      {/* 1. Header Search Bar Trigger (Wider & Unslop) */}
      <div
        onClick={() => setIsOpen(true)}
        className="relative flex items-center bg-stone-100/90 hover:bg-stone-200/70 dark:bg-slate-900/90 dark:hover:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl px-3.5 py-2 cursor-pointer transition-colors w-full sm:w-80 md:w-96 lg:w-[420px] shadow-none group"
      >
        <Search className="w-4 h-4 text-stone-400 dark:text-slate-400 group-hover:text-stone-700 dark:group-hover:text-[#b7eb4d] mr-2.5 transition-colors" />
        <span className="text-xs text-stone-500 dark:text-slate-400 font-medium truncate flex-1">
          Search any stock, index, commodity, FX...
        </span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-stone-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded shadow-xs">
          /
        </kbd>
      </div>

      {/* 2. Command Palette / Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#0b101b] border border-stone-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col text-stone-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-[#0d1424]">
              <Search className="w-5 h-5 text-emerald-600 dark:text-[#b7eb4d] mr-3 shrink-0" />
              <input
                ref={modalInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleModalKeyDown}
                placeholder="Search stocks, indices, rates (e.g. RELIANCE, TCS, Gold, S&P 500)..."
                className="w-full bg-transparent text-sm sm:text-base text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 text-xs font-semibold text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white bg-stone-200 dark:bg-slate-800 rounded border border-stone-300 dark:border-slate-700"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-stone-100 dark:divide-slate-800/40 no-scrollbar">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-stone-400 dark:text-slate-500 text-sm">
                  No stocks, indices, or commodities found matching "{query}"
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const symbol = cleanSymbol(item.ticker)
                  const isSelected = selectedIndex === idx
                  const isUp = (item.change_pct || 0) >= 0

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-stone-100 dark:bg-slate-800/80 text-stone-900 dark:text-white'
                          : 'hover:bg-stone-50 dark:hover:bg-slate-800/40 text-stone-700 dark:text-slate-300',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <CompanyLogo
                          ticker={item.ticker}
                          name={item.name}
                          className="w-8 h-8 rounded-full shadow-xs"
                          size={64}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm font-mono truncate">
                              {symbol}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border border-stone-300 dark:border-slate-700">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                            {item.name}
                          </div>
                        </div>
                      </div>

                      {item.price !== undefined && (
                        <div className="text-right">
                          <div className="text-sm font-mono font-semibold text-stone-900 dark:text-white">
                            {formatCurrency(item.price, item.currency || 'INR')}
                          </div>
                          {item.change_pct !== undefined && (
                            <div
                              className={cn(
                                'text-xs font-mono font-medium flex items-center justify-end gap-1 mt-0.5',
                                isUp
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400',
                              )}
                            >
                              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              <span>{formatPct(item.change_pct)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-stone-50 dark:bg-[#080d17] border-t border-stone-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-500">
              <div className="flex items-center gap-3">
                <span>Navigate: <kbd className="font-mono bg-stone-200 dark:bg-slate-800 px-1 rounded text-stone-700 dark:text-slate-400">↑</kbd> <kbd className="font-mono bg-stone-200 dark:bg-slate-800 px-1 rounded text-stone-700 dark:text-slate-400">↓</kbd></span>
                <span>Select: <kbd className="font-mono bg-stone-200 dark:bg-slate-800 px-1 rounded text-stone-700 dark:text-slate-400">Enter</kbd></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-[#b7eb4d] font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant chart & AI SWOT</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GlobalSearch
