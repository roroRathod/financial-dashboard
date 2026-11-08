import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Plus,
  Trash2,
  Search,
  Briefcase,
  Eye,
} from 'lucide-react'
import { addInvestment, removeInvestment, fetchInvestments, searchMarkets, api } from '../lib/api'
import { KNOWN_COMPANIES, cleanSymbol } from '../lib/companyData'
import { CompanyLogo } from './CompanyLogo'
import { formatCurrency, formatPct, cn } from '../lib/utils'

type Inv = {
  ticker: string
  name: string
  avg_price: number
  qty: number
  asset_class?: string
}

type SuggestionItem = {
  ticker: string
  name: string
  price?: number
  currency?: string
}

export function InvestmentsPanel() {
  const [inv, setInv] = useState<Inv[]>([])
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist'>('portfolio')

  // Form State
  const [assetQuery, setAssetQuery] = useState('')
  const [selectedTicker, setSelectedTicker] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [qty, setQty] = useState('')

  // Suggestion Dropdown
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Live quotes for calculating current portfolio value
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})

  const load = () => {
    fetchInvestments().then((d: any) => {
      const items: Inv[] = Array.isArray(d) ? d : []
      setInv(items)

      // Fetch live prices for each holding
      items.forEach((item) => {
        api
          .get(`/markets/history`, { params: { ticker: item.ticker, period: '1d', interval: '1d' } })
          .then((res) => {
            const hist = res.data?.history || []
            if (hist.length > 0) {
              const lastClose = hist[hist.length - 1]?.close
              if (lastClose) {
                setLivePrices((prev) => ({ ...prev, [item.ticker]: lastClose }))
              }
            }
          })
          .catch(() => {})
      })
    })
  }

  useEffect(() => {
    load()
  }, [])

  // Close suggestion dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Semantic search auto-suggest as user types
  useEffect(() => {
    if (!assetQuery.trim() || selectedTicker) {
      setSuggestions([])
      return
    }

    const q = assetQuery.toLowerCase().trim()

    // 1. Match from local known companies dictionary
    const localMatches: SuggestionItem[] = []
    Object.entries(KNOWN_COMPANIES).forEach(([t, comp]) => {
      if (
        t.toLowerCase().includes(q) ||
        comp.name.toLowerCase().includes(q) ||
        comp.sector.toLowerCase().includes(q)
      ) {
        localMatches.push({
          ticker: t.includes('.') ? t : `${t}.NS`,
          name: comp.name,
        })
      }
    })

    // Also search common indices/commodities
    const presets = [
      { ticker: '^NSEI', name: 'NIFTY 50' },
      { ticker: '^BSESN', name: 'SENSEX' },
      { ticker: '^NSEBANK', name: 'BANK NIFTY' },
      { ticker: 'GC=F', name: 'Gold COMEX' },
      { ticker: 'SI=F', name: 'Silver COMEX' },
      { ticker: 'AAPL', name: 'Apple Inc' },
      { ticker: 'NVDA', name: 'NVIDIA Corporation' },
      { ticker: 'MSFT', name: 'Microsoft Corporation' },
    ]
    presets.forEach((p) => {
      if (p.ticker.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)) {
        localMatches.push(p)
      }
    })

    setSuggestions(localMatches.slice(0, 8))
    setIsDropdownOpen(true)

    // 2. Query remote Yahoo Finance search if query is > 2 characters
    if (q.length >= 2) {
      searchMarkets(q)
        .then((res) => {
          const remote = res?.results || []
          const combined = [
            ...localMatches,
            ...remote.map((r: any) => ({
              ticker: r.ticker || r.symbol,
              name: r.name || r.shortName || r.ticker,
              price: r.price,
            })),
          ]
          const unique = Array.from(new Map(combined.map((item) => [item.ticker, item])).values())
          setSuggestions(unique.slice(0, 8))
        })
        .catch(() => {})
    }
  }, [assetQuery, selectedTicker])

  // Select an auto-suggested company
  const handleSelectSuggestion = (item: SuggestionItem) => {
    setSelectedTicker(item.ticker)
    setSelectedName(item.name)
    setAssetQuery(`${item.name} (${cleanSymbol(item.ticker)})`)
    setIsDropdownOpen(false)

    // Auto-fetch and pre-fill live price
    api
      .get(`/markets/history`, { params: { ticker: item.ticker, period: '1d', interval: '1d' } })
      .then((res) => {
        const hist = res.data?.history || []
        if (hist.length > 0 && hist[hist.length - 1]?.close) {
          const p = hist[hist.length - 1].close
          setAvgPrice(p.toString())
        }
      })
      .catch(() => {})
  }

  // Add holding / watchlist item
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const tickerToAdd = selectedTicker || assetQuery.trim().toUpperCase()
    if (!tickerToAdd) return

    const nameToAdd = selectedName || tickerToAdd.replace('.NS', '').replace('.BO', '')
    const priceVal = parseFloat(avgPrice) || livePrices[tickerToAdd] || 100
    const qtyVal = parseFloat(qty) || 1

    addInvestment({
      ticker: tickerToAdd,
      name: nameToAdd,
      avg_price: priceVal,
      qty: qtyVal,
    }).then(() => {
      setAssetQuery('')
      setSelectedTicker('')
      setSelectedName('')
      setAvgPrice('')
      setQty('')
      load()
    })
  }

  const handleDelete = (t: string) => {
    removeInvestment(t).then(() => load())
  }

  // Portfolio Totals Calculation
  const { totalInvested, totalCurrent, totalProfitLoss, totalProfitLossPct } = useMemo(() => {
    let invested = 0
    let current = 0

    inv.forEach((item) => {
      const invVal = (item.avg_price || 0) * (item.qty || 1)
      const currentPrice = livePrices[item.ticker] || item.avg_price || 0
      const currVal = currentPrice * (item.qty || 1)

      invested += invVal
      current += currVal
    })

    const pl = current - invested
    const plPct = invested > 0 ? (pl / invested) * 100 : 0

    return {
      totalInvested: invested,
      totalCurrent: current,
      totalProfitLoss: pl,
      totalProfitLossPct: plPct,
    }
  }, [inv, livePrices])

  const isProfitable = totalProfitLoss >= 0

  return (
    <div className="bg-white dark:bg-[#0e1422] border border-stone-200 dark:border-slate-800 rounded-2xl p-3 sm:p-6 shadow-xs text-stone-900 dark:text-slate-100 space-y-4 sm:space-y-5 max-w-full">
      {/* 1. Header with Portfolio Totals & View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-stone-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold">Portfolio & Watchlist Desk</h2>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border border-stone-200 dark:border-slate-700">
              {inv.length} Assets Tracked
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
            Auto-suggest search across NSE, BSE, US & commodities with live P&L valuation.
          </p>
        </div>

        {/* View Switcher: Portfolio vs Watchlist */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl self-start lg:self-auto overflow-x-auto no-scrollbar max-w-full shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('portfolio')}
            className={cn(
              'px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap',
              activeTab === 'portfolio'
                ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs border border-stone-200 dark:border-slate-700'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
            )}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Portfolio Valuation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('watchlist')}
            className={cn(
              'px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap',
              activeTab === 'watchlist'
                ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-xs border border-stone-200 dark:border-slate-700'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white',
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Watchlist View</span>
          </button>
        </div>
      </div>

      {/* 2. Portfolio P&L Summary Cards */}
      {activeTab === 'portfolio' && inv.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3.5">
            <span className="text-[11px] text-stone-500 dark:text-slate-400 block font-medium">Total Invested</span>
            <span className="text-base sm:text-lg font-bold font-mono mt-1 block">
              {formatCurrency(totalInvested, 'INR')}
            </span>
          </div>

          <div className="bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3.5">
            <span className="text-[11px] text-stone-500 dark:text-slate-400 block font-medium">Current Portfolio Value</span>
            <span className="text-base sm:text-lg font-bold font-mono mt-1 block text-stone-900 dark:text-white">
              {formatCurrency(totalCurrent, 'INR')}
            </span>
          </div>

          <div className="bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3.5">
            <span className="text-[11px] text-stone-500 dark:text-slate-400 block font-medium">Total Unrealized P&L</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={cn(
                  'text-base sm:text-lg font-bold font-mono',
                  isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                )}
              >
                {isProfitable ? '+' : ''}
                {formatCurrency(totalProfitLoss, 'INR')}
              </span>
              <span
                className={cn(
                  'text-xs font-semibold font-mono',
                  isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                )}
              >
                ({formatPct(totalProfitLossPct)})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Semantic Search Add-Holding Form with Compulsory Field Badges */}
      <div className="bg-stone-50/80 dark:bg-[#0b101b] border border-stone-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
          <span className="text-xs font-semibold text-stone-800 dark:text-slate-200">
            Add Holding or Watchlist Asset
          </span>
          {/* Field Compulsory Guidance */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] flex-wrap">
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              1. Asset: Compulsory
            </span>
            <span className="text-stone-400 dark:text-slate-500 hidden sm:inline">|</span>
            <span className="flex items-center gap-1 text-stone-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
              2. Price: Optional
            </span>
            <span className="text-stone-400 dark:text-slate-500 hidden md:inline">|</span>
            <span className="flex items-center gap-1 text-stone-500 dark:text-slate-400 hidden md:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
              3. Qty: Optional
            </span>
          </div>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* 1. Asset Input with Semantic Search Auto-Complete (COMPULSORY) */}
          <div className="sm:col-span-6 relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={assetQuery}
                onChange={(e) => {
                  setAssetQuery(e.target.value)
                  setSelectedTicker('')
                  setSelectedName('')
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setIsDropdownOpen(true)
                }}
                placeholder="Type stock name or ticker (e.g. Reliance, HDFC, Apple)... *"
                required
                className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Auto-suggest dropdown */}
            {isDropdownOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white dark:bg-[#0d1424] border border-stone-200 dark:border-slate-700 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800">
                {suggestions.map((item) => (
                  <div
                    key={item.ticker}
                    onClick={() => handleSelectSuggestion(item)}
                    className="p-2.5 hover:bg-stone-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CompanyLogo ticker={item.ticker} name={item.name} className="w-6 h-6 rounded-full shrink-0" size={48} />
                      <div className="truncate">
                        <div className="font-semibold text-stone-900 dark:text-white">{item.name}</div>
                        <div className="text-[10px] font-mono text-stone-400 dark:text-slate-400">{item.ticker}</div>
                      </div>
                    </div>
                    {item.price && (
                      <span className="font-mono font-medium text-stone-700 dark:text-slate-300">
                        {formatCurrency(item.price, 'INR')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Buy Price (OPTIONAL) */}
          <div className="sm:col-span-3">
            <input
              type="number"
              step="any"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              placeholder="Buy Price (optional)"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* 3. Quantity (OPTIONAL) */}
          <div className="sm:col-span-2">
            <input
              type="number"
              step="any"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Qty (def: 1)"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Add Button */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full py-2.5 sm:py-2 bg-stone-900 hover:bg-stone-800 dark:bg-[#b7eb4d] dark:hover:bg-[#a5d840] text-white dark:text-[#0b101b] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:hidden">Add Holding</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Holdings / Watchlist Table */}
      <div className="overflow-x-auto no-scrollbar rounded-xl border border-stone-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50 dark:bg-slate-900/80 text-stone-500 dark:text-slate-400 border-b border-stone-200 dark:border-slate-800 font-semibold text-[11px]">
              <th className="py-2.5 sm:py-3 px-2.5 sm:px-3.5">Asset / Holding</th>
              <th className="py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-right">Live Price</th>
              {activeTab === 'portfolio' && (
                <>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-right hidden sm:table-cell">Avg Buy Price</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-right hidden sm:table-cell">Units</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-right">Current Value</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-right">P&L Gain/Loss</th>
                </>
              )}
              <th className="py-2.5 sm:py-3 px-2 sm:px-3.5 text-center w-10 sm:w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60 bg-white dark:bg-transparent">
            {inv.map((item) => {
              const liveP = livePrices[item.ticker] || item.avg_price || 0
              const currVal = liveP * (item.qty || 1)
              const investedVal = (item.avg_price || 0) * (item.qty || 1)
              const pl = currVal - investedVal
              const plPct = investedVal > 0 ? (pl / investedVal) * 100 : 0
              const isItemUp = pl >= 0
              const isIndian = item.ticker.includes('.NS') || item.ticker.includes('.BO')

              return (
                <tr
                  key={item.ticker}
                  className="hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Asset */}
                  <td className="py-2.5 sm:py-3 px-2.5 sm:px-3.5">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <CompanyLogo ticker={item.ticker} name={item.name} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-xs shrink-0" size={64} />
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 dark:text-white font-mono text-xs sm:text-sm">{cleanSymbol(item.ticker)}</div>
                        <div className="text-[10px] sm:text-[11px] text-stone-500 dark:text-slate-400 truncate max-w-[100px] xs:max-w-[130px] sm:max-w-xs">
                          {item.name}
                        </div>
                        {activeTab === 'portfolio' && (
                          <div className="text-[10px] font-mono text-stone-400 dark:text-slate-500 sm:hidden">
                            {item.qty} units @ {formatCurrency(item.avg_price, isIndian ? 'INR' : 'USD')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Live Price */}
                  <td className="py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-right font-mono font-semibold text-stone-900 dark:text-white whitespace-nowrap text-xs sm:text-sm">
                    {formatCurrency(liveP, isIndian ? 'INR' : 'USD')}
                  </td>

                  {activeTab === 'portfolio' && (
                    <>
                      {/* Avg Buy Price */}
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-right font-mono text-stone-600 dark:text-slate-300 hidden sm:table-cell whitespace-nowrap">
                        {formatCurrency(item.avg_price, isIndian ? 'INR' : 'USD')}
                      </td>

                      {/* Units */}
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-right font-mono text-stone-700 dark:text-slate-300 hidden sm:table-cell">
                        {item.qty}
                      </td>

                      {/* Current Value */}
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-right font-mono font-semibold text-stone-900 dark:text-white whitespace-nowrap text-xs sm:text-sm">
                        {formatCurrency(currVal, isIndian ? 'INR' : 'USD')}
                      </td>

                      {/* P&L */}
                      <td className="py-2.5 sm:py-3 px-2.5 sm:px-3.5 text-right font-mono font-semibold whitespace-nowrap text-xs sm:text-sm">
                        <div className={isItemUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isItemUp ? '+' : ''}
                          {formatCurrency(pl, isIndian ? 'INR' : 'USD')}
                        </div>
                        <div className="text-[10px] text-stone-400 dark:text-slate-500">
                          ({formatPct(plPct)})
                        </div>
                      </td>
                    </>
                  )}

                  {/* Delete Button */}
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.ticker)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors rounded"
                      title="Remove from tracking"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {inv.length === 0 && (
          <div className="py-12 text-center text-stone-400 dark:text-slate-500 text-xs">
            No holdings or watchlist items yet. Use the search bar above to add any stock, index, or commodity!
          </div>
        )}
      </div>
    </div>
  )
}

export default InvestmentsPanel
