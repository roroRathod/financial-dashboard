import { useState } from 'react'
import { ShieldAlert, RefreshCw, X, Radio } from 'lucide-react'
import { cn } from '../lib/utils'
import { checkBackendHealth } from '../lib/api'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function TailscaleStatusModal({ isOpen, onClose, onSuccess }: Props) {
  const [retrying, setRetrying] = useState(false)
  const [retryFailed, setRetryFailed] = useState(false)

  if (!isOpen) return null

  const handleRetry = async () => {
    setRetrying(true)
    setRetryFailed(false)
    const result = await checkBackendHealth()
    setRetrying(false)
    if (result.ok) {
      onSuccess()
      onClose()
    } else {
      setRetryFailed(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#0c121e] border border-stone-200 dark:border-slate-800 shadow-xl overflow-hidden text-stone-900 dark:text-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <h3 className="text-sm font-semibold tracking-tight">Tailscale Required</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-center">
          <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
            Please turn <strong>ON</strong> Tailscale on this device to load live market data and quotes.
          </p>

          {retryFailed && (
            <div className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center justify-center gap-1.5 pt-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Still offline. Ensure Tailscale is active and try again.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-200 dark:border-slate-800 hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-600 dark:text-slate-400 transition-colors"
          >
            Dismiss
          </button>

          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-xl bg-stone-900 text-white dark:bg-slate-100 dark:text-stone-900 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', retrying && 'animate-spin')} />
            <span>{retrying ? 'Checking…' : 'Retry'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
