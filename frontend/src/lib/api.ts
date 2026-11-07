import axios from 'axios'

const CANDIDATE_URLS = [
  'https://roro.tail4f92aa.ts.net',
  'http://100.83.231.3:8000',
  'http://localhost:8000',
]

const getInitialBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('roro_backend_url')
    if (saved) return saved
    if (window.location.hostname === 'rororathod.github.io') {
      return 'https://roro.tail4f92aa.ts.net'
    }
    if (window.location.port === '8000' || window.location.hostname.includes('tail4f92aa.ts.net')) {
      return ''
    }
  }
  return import.meta.env.VITE_API_BASE || 'http://localhost:8000'
}

let activeBaseUrl = getInitialBaseUrl()

export const api = axios.create({
  baseURL: activeBaseUrl,
  timeout: 30000,
})

export const setApiBaseUrl = (url: string) => {
  activeBaseUrl = url
  api.defaults.baseURL = url
  if (typeof window !== 'undefined') {
    localStorage.setItem('roro_backend_url', url)
  }
}

export const checkBackendHealth = async (): Promise<{ ok: boolean; activeUrl?: string; error?: string }> => {
  // If the activeBaseUrl already works, check it first
  try {
    const res = await api.get('/health', { timeout: 3500 })
    if (res.status === 200) {
      return { ok: true, activeUrl: activeBaseUrl }
    }
  } catch (err) {
    // If current fails, probe candidate URLs
  }

  // Probe candidates
  for (const url of CANDIDATE_URLS) {
    if (url === activeBaseUrl) continue
    try {
      const probeClient = axios.create({ baseURL: url, timeout: 3000 })
      const res = await probeClient.get('/health')
      if (res.status === 200) {
        setApiBaseUrl(url)
        return { ok: true, activeUrl: url }
      }
    } catch {
      // Continue to next candidate
    }
  }

  return {
    ok: false,
    error: 'Could not reach backend on https://roro.tail4f92aa.ts.net or http://100.83.231.3:8000.',
  }
}

export const fetchMarkets = () => api.get('/markets/').then(r => r.data)
export const fetchRegionMarkets = (region: string) => api.get(`/markets/${region}`).then(r => r.data)
export const fetchCommodities = () => api.get('/commodities/').then(r => r.data)
export const fetchFX = () => api.get('/fx/').then(r => r.data)
export const fetchScreener = (index?: string) => api.get('/screener', { params: index ? { index } : {} }).then(r => r.data)
export const fetchNews = () => api.get('/news/').then(r => r.data)
export const fetchInvestments = () => api.get('/investments/').then(r => r.data)
export const addInvestment = (payload: any) => api.post('/investments/', payload).then(r => r.data)
export const removeInvestment = (ticker: string) => api.delete(`/investments/${ticker}`).then(r => r.data)
export const aiSummary = (payload: any, use_llm = true) =>
  api.post('/ai/summary', { ...payload, use_llm }).then(r => r.data)
export const searchMarkets = (q: string) => api.get('/markets/search', { params: { q } }).then(r => r.data)
export const fetchAiIntelligence = (use_llm = true) =>
  api.get('/ai-ecosystem/intelligence', { params: { use_llm } }).then(r => r.data)
export const fetchAiStocks = () => api.get('/ai-ecosystem/stocks').then(r => r.data)
export const fetchAiConfig = () => api.get('/ai/config').then(r => r.data)
export const updateAiConfig = (cfg: { base_url?: string; api_key?: string; model?: string }) =>
  api.post('/ai/config', cfg).then(r => r.data)
export const fetchCandlestickAi = (payload: { ticker: string; name?: string; candles: any[]; use_llm?: boolean }) =>
  api.post('/ai/candlestick', payload).then(r => r.data)
