import * as Lucide from 'lucide-react'

export function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ')
}

export const API_BASE = import.meta.env.VITE_API_BASE || ''

export const formatCurrency = (v: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)
}

export const formatPct = (v: number) => {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

const ICON_MAP: Record<string, string> = {
  'NIFTY 50': 'Building2',
  'SENSEX': 'Building2',
  'BANK NIFTY': 'Building2',
  'INDIA VIX': 'Activity',
  'NIFTY MIDCAP 150': 'Building2',
  'S&P 500': 'Building2',
  'NASDAQ 100': 'Building2',
  'DOW JONES': 'Building2',
  'RUSSELL 2000': 'Building2',
  'VIX': 'Activity',
  'NIKKEI 225': 'Building2',
  'TOPIX': 'Building2',
  'CSI 300': 'Building2',
  'SHANGHAI COMP': 'Building2',
  'HANG SENG': 'Building2',
  'FTSE 100': 'Building2',
  'DAX': 'Building2',
  'CAC 40': 'Building2',
  'ASX 200': 'Building2',
  'DOLLAR INDEX': 'DollarSign',
  'Gold': 'Coins',
  'Silver': 'Coins',
  'Crude Oil WTI': 'Droplets',
  'Crude Oil Brent': 'Droplets',
  'Natural Gas': 'Flame',
  'Copper': 'Droplets',
  'Aluminium': 'Droplets',
  'Zinc': 'Droplets',
  'USD/INR': 'DollarSign',
  'EUR/INR': 'Euro',
  'GBP/INR': 'PoundSterling',
  'JPY/INR': 'JapaneseYen',
  'EUR/USD': 'Euro',
}

export function getMarketIcon(name: string): React.ComponentType<any> {
  const key = ICON_MAP[name]
  if (!key) return Lucide.Building2
  const icon = (Lucide as unknown as Record<string, React.ComponentType<any>>)[key]
  return icon || Lucide.Building2
}
