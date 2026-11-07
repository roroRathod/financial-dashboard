import axios from 'axios'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If running on GitHub Pages, connect over HTTPS to Pi via Tailscale
    if (window.location.hostname === 'rororathod.github.io') {
      const saved = localStorage.getItem('roro_backend_url')
      return saved || 'https://roro.tail4f92aa.ts.net'
    }
    // If running on Pi directly or local network
    if (window.location.port === '8000' || window.location.hostname.includes('tail4f92aa.ts.net')) {
      return ''
    }
  }
  return import.meta.env.VITE_API_BASE || 'http://localhost:8000'
}

const API = getBaseUrl()

export const api = axios.create({
  baseURL: API,
  timeout: 12000,
})

export const checkBackendHealth = async (): Promise<{ ok: boolean; error?: string }> => {
  try {
    const res = await api.get('/health', { timeout: 3500 })
    return { ok: res.status === 200 }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Connection timed out' }
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
