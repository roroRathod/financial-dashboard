import { useState, useEffect } from 'react'
import { X, Key, Cpu, Globe, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { fetchAiConfig, updateAiConfig } from '../lib/api'

type LlmConfigModalProps = {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

export function LlmConfigModal({ isOpen, onClose, onSaved }: LlmConfigModalProps) {
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('auto')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [maskedKey, setMaskedKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setStatusMsg(null)
    fetchAiConfig()
      .then((cfg) => {
        setBaseUrl(cfg.base_url || 'https://api.openai.com/v1')
        setModel(cfg.model || 'auto')
        setHasApiKey(Boolean(cfg.has_api_key))
        setMaskedKey(cfg.masked_api_key || '')
      })
      .catch(() => {
        setBaseUrl('https://api.openai.com/v1')
        setModel('auto')
      })
      .finally(() => setLoading(false))
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMsg(null)
    try {
      const payload: any = {
        base_url: baseUrl.trim(),
        model: model.trim() || 'auto',
      }
      if (apiKey.trim()) {
        payload.api_key = apiKey.trim()
      }
      const res = await updateAiConfig(payload)
      setHasApiKey(Boolean(res.has_api_key))
      setStatusMsg({ text: 'LLM Configuration successfully updated!', type: 'success' })
      setApiKey('')
      if (onSaved) onSaved()
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch {
      setStatusMsg({ text: 'Failed to update LLM configuration. Check server logs.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0b101b] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex justify-between items-center bg-[#0e1627]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">AI LLM Configuration</h3>
              <p className="text-xs text-slate-400">OpenAI-Compatible Engine with Automatic Algorithmic Fallback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Active Pipeline:</span>
              <span className="font-semibold text-white">
                {hasApiKey ? 'OpenAI-Compatible LLM (Primary)' : 'Algorithmic News Synthesis (Fallback)'}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                hasApiKey
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {hasApiKey ? 'API Key Active' : 'No Key Set'}
            </span>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              API Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              required
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Enter any OpenAI-compatible base URL (e.g., FreeLLM API, OpenRouter, Groq, Ollama, OpenAI).
            </span>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasApiKey ? `Key set (${maskedKey}). Enter new key to change.` : 'sk-...'}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              If this API call ever fails, times out, or quota runs out, the system automatically falls back to our live heuristic engine.
            </span>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              Model Name
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="auto or gpt-4o-mini"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Supports <code>auto</code>, or specify any model supported by your provider.
            </span>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Configuration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
