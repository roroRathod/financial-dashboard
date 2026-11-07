import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MarketCard } from '../components/MarketCard'
import { Heatmap } from '../components/Heatmap'
import { fetchRegionMarkets } from '../lib/api'

type Region = 'INDIA' | 'US' | 'JAPAN' | 'CHINA' | 'GLOBAL'

const REGION_LABELS: Record<Region, string> = {
  INDIA: 'India',
  US: 'United States',
  JAPAN: 'Japan',
  CHINA: 'China',
  GLOBAL: 'Global',
}

export function MarketDetail({ region: propRegion }: { region?: Region }) {
  const params = useParams<{ region?: string }>()
  const region: Region = (propRegion || params.region?.toUpperCase() || 'INDIA') as Region
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRegionMarkets(region).then((d) => {
      setData(d)
      setLoading(false)
    }).catch(() => {
      setData({ error: 'Failed to fetch' })
      setLoading(false)
    })
  }, [region])

  const label = REGION_LABELS[region] || region

  if (loading) return <div className="p-4 text-slate-400">Loading {label}...</div>
  if (!data || data.error) return <div className="p-4 text-red-400">Failed to load {label}</div>

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-300"
        >
          ← Back to dashboard
        </button>
        <h1 className="text-xl font-bold">{label} Markets</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(data.data || {}).map(([name, q]: [string, any]) => (
          <MarketCard
            key={name}
            name={name}
            q={q}
            onClick={() => navigate(`/market/${region}/${encodeURIComponent(name)}`)}
          />
        ))}
      </div>

      {/* Heatmap for India equities */}
      {region === 'INDIA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="font-medium mb-2 text-sm">Nifty 50 Heatmap</h3>
          <Heatmap stocks={[]} />
        </div>
      )}
    </div>
  )
}

export default MarketDetail
