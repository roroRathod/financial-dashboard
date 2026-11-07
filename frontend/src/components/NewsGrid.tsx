import { NewsTile } from '../components/NewsTile'

type NewsGridProps = { news: Array<{ title: string; source: string; published: string; link: string; summary?: string }> }

export function NewsGrid({ news }: NewsGridProps) {
  return (
    <div className="bg-white dark:bg-[#0e1422] border border-stone-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm text-stone-900 dark:text-white">Market Dispatches</h2>
        <span className="text-[11px] text-stone-500 dark:text-slate-500 font-mono">Live Wires</span>
      </div>
      <div className="space-y-2">
        {news.slice(0, 10).map((n, i) => (
          <NewsTile key={i} {...n} />
        ))}
      </div>
    </div>
  )
}
