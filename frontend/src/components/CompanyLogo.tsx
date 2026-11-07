import { useState } from 'react'
import { getCompanyInfo, cleanSymbol } from '../lib/companyData'

type CompanyLogoProps = {
  ticker: string
  name?: string
  domain?: string
  className?: string
  size?: number
}

const GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-violet-600 to-purple-800',
  'from-amber-500 to-orange-600',
  'from-cyan-600 to-blue-700',
  'from-rose-600 to-red-700',
]

function getGradient(symbol: string): string {
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % GRADIENTS.length
  return GRADIENTS[idx]
}

export function CompanyLogo({
  ticker,
  name,
  domain: explicitDomain,
  className = 'w-6 h-6',
  size = 128,
}: CompanyLogoProps) {
  const [stage, setStage] = useState<'primary' | 'secondary' | 'monogram'>('primary')
  const info = getCompanyInfo(ticker)
  const symbol = cleanSymbol(ticker)
  const domain = explicitDomain || info.domain

  const primaryUrl = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=${size}`
  const secondaryUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`

  const handlePrimaryError = () => {
    setStage('secondary')
  }

  const handleSecondaryError = () => {
    setStage('monogram')
  }

  const monogram = (symbol.slice(0, 2) || ticker.slice(0, 2)).toUpperCase()
  const gradient = getGradient(symbol)

  if (stage === 'monogram') {
    return (
      <div
        className={`rounded-full bg-gradient-to-br ${gradient} text-white font-extrabold flex items-center justify-center text-[10px] tracking-tight shadow-sm select-none border border-white/20 shrink-0 ${className}`}
        title={name || info.name}
      >
        {monogram}
      </div>
    )
  }

  return (
    <div
      className={`rounded-full bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden shrink-0 ring-1 ring-black/15 ${className}`}
      title={name || info.name}
    >
      <img
        src={stage === 'primary' ? primaryUrl : secondaryUrl}
        alt={symbol}
        onError={stage === 'primary' ? handlePrimaryError : handleSecondaryError}
        className="w-full h-full object-contain rounded-full"
        loading="lazy"
      />
    </div>
  )
}

export default CompanyLogo
