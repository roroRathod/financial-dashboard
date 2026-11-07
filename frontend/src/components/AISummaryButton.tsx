import { useState } from 'react'
import { aiSummary } from '../lib/api'

type AISummaryButtonProps = { asset_class: string; region: string; data: any }

function Button({ onClick, loading, children, className }: { onClick: () => void; loading?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button onClick={onClick} disabled={loading} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${className || 'bg-blue-600 text-white'}`}>
      {loading ? (
        <span className="flex items-center gap-1">
          <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export function AISummaryButton({ asset_class, region, data }: AISummaryButtonProps) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const r = await aiSummary({ asset_class, region, data })
      setResult(r)
    } catch (e) {
      setResult({ error: 'AI summary unavailable' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <Button onClick={run} loading={loading} className="w-full bg-blue-600 text-white">
        {loading ? 'Analysing…' : 'AI Summary — Why / What / SWOT'}
      </Button>
      {result && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="font-semibold text-blue-400 mb-1">Why it moved</div>
          <div className="text-slate-300">{result.why}</div>
          <div className="font-semibold text-blue-400 mb-1 mt-2">What happened</div>
          <div className="text-slate-300">{result.what}</div>
          <div className="font-semibold text-blue-400 mb-1 mt-2">SWOT</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-green-900/20 border border-green-900/30 rounded p-2">
              <div className="text-green-400 text-xs font-bold mb-1">Strengths</div>
              <ul className="list-disc list-inside text-slate-300">
                {(result.swot?.strengths || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-red-900/20 border border-red-900/30 rounded p-2">
              <div className="text-red-400 text-xs font-bold mb-1">Threats</div>
              <ul className="list-disc list-inside text-slate-300">
                {(result.swot?.threats || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 italic">{result.note}</div>
        </div>
      )}
    </div>
  )
}
