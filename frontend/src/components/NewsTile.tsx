import { Activity, ArrowRight, ChevronRight } from 'lucide-react'
import { formatCurrency, formatPct } from '../lib/utils'
import { CompanyLogo } from './CompanyLogo'
import { cleanSymbol, getCompanyInfo } from '../lib/companyData'

type NewsTileProps = {
  title: string
  source: string
  published: string
  link: string
  summary?: string
}

export function NewsTile({ title, source, published, link, summary }: NewsTileProps) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-stone-50/70 hover:bg-stone-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-stone-200 dark:border-slate-800 rounded-lg p-3 transition-colors group"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-stone-400 dark:text-slate-500" />
          <span className="text-[11px] font-medium text-stone-600 dark:text-slate-400">{source}</span>
        </div>
        <span className="text-[10px] text-stone-400 dark:text-slate-500 font-mono">{published}</span>
      </div>
      <h4 className="font-medium text-xs sm:text-sm text-stone-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-[#b7eb4d] transition-colors line-clamp-2 leading-snug">
        {title}
      </h4>
      {summary && <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 line-clamp-2">{summary}</p>}
      <div className="flex justify-end items-center mt-2 pt-1 border-t border-stone-100 dark:border-slate-800/60">
        <span className="text-[10px] font-medium text-stone-400 dark:text-slate-500 group-hover:text-emerald-700 dark:group-hover:text-[#b7eb4d] flex items-center gap-1">
          Read <ArrowRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </a>
  )
}

export function ScreenerRow({
  ticker,
  price,
  change_pct,
  volume,
}: {
  ticker: string
  price: number
  change_pct: number
  volume: number
}) {
  const up = (change_pct || 0) >= 0
  const info = getCompanyInfo(ticker)
  const symbol = cleanSymbol(ticker)
  const isIndian = ticker.includes('.NS') || ticker.includes('.BO')

  return (
    <tr className="border-b border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <CompanyLogo ticker={ticker} name={info.name} domain={info.domain} className="w-5 h-5 shadow-xs" size={64} />
          <div>
            <div className="font-semibold text-stone-900 dark:text-white font-mono">{symbol}</div>
            <div className="text-[10px] text-stone-500 dark:text-slate-400 truncate max-w-[120px]">{info.name}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-sm font-mono font-medium">{formatCurrency(price, isIndian ? 'INR' : 'USD')}</td>
      <td className={`px-3 py-2 text-sm font-semibold font-mono ${up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
        {formatPct(change_pct || 0)}
      </td>
      <td className="px-3 py-2 text-sm text-stone-500 dark:text-slate-400 font-mono">{volume.toLocaleString()}</td>
      <td className="px-3 py-2 text-sm">
        <ChevronRight className="w-3 h-3 text-stone-400 dark:text-slate-600" />
      </td>
    </tr>
  )
}
