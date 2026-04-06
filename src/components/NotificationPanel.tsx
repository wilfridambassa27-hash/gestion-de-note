'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, Users, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface NotificationPanelProps {
  classeId?: string
  semestreId?: string
  nomClasse?: string
  semestreLabel?: string
  totalEleves?: number
}

export default function NotificationPanel({
  classeId,
  semestreId,
  nomClasse = 'Classe',
  semestreLabel = 'Semestre',
  totalEleves = 0,
}: NotificationPanelProps) {
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; total: number; errors: string[] } | null>(null)
  const [customMode, setCustomMode] = useState(false)
  const [customTo, setCustomTo] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [customSent, setCustomSent] = useState(false)

  const sendBulkBulletins = async () => {
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bulletin_published', classeId, semestreId }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ sent: 0, total: totalEleves, errors: ['Erreur réseau'] })
    } finally {
      setSending(false)
    }
  }

  const sendCustomEmail = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'custom',
          to: customTo,
          subject: customSubject,
          message: customMessage,
        }),
      })
      const data = await res.json()
      if (data.success) setCustomSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-emerald-600/20 rounded-xl flex items-center justify-center">
          <Mail className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-black text-sm">Notifications Email</h3>
          <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold">Système de messagerie</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex rounded-2xl overflow-hidden border border-white/10">
        <button
          onClick={() => setCustomMode(false)}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${!customMode ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
        >
          Bulletins classe
        </button>
        <button
          onClick={() => setCustomMode(true)}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${customMode ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
        >
          Message personnalisé
        </button>
      </div>

      {!customMode ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4">
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-white text-xs font-bold">{nomClasse}</p>
              <p className="text-slate-400 text-[10px]">{totalEleves} étudiant(s) — {semestreLabel}</p>
            </div>
          </div>

          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 p-4 rounded-2xl border ${
                result.errors.length > 0
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/20'
              }`}
            >
              {result.errors.length > 0
                ? <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                : <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              }
              <div>
                <p className={`text-[11px] font-black ${result.errors.length > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {result.sent}/{result.total} emails envoyés
                </p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-rose-400 text-[9px] mt-1">{e}</p>
                ))}
              </div>
            </motion.div>
          ) : (
            <button
              onClick={sendBulkBulletins}
              disabled={sending || !classeId || !semestreId}
              className="w-full py-3 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Envoi en cours...' : 'Envoyer à toute la classe'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {customSent ? (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-xs font-black">Message envoyé avec succès !</span>
            </div>
          ) : (
            <>
              <input
                type="email"
                placeholder="Destinataire (email)"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-medium outline-none focus:border-emerald-500/50 placeholder:text-slate-500"
              />
              <input
                type="text"
                placeholder="Objet du message"
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-medium outline-none focus:border-emerald-500/50 placeholder:text-slate-500"
              />
              <textarea
                rows={4}
                placeholder="Votre message..."
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-medium outline-none focus:border-emerald-500/50 placeholder:text-slate-500 resize-none"
              />
              <button
                onClick={sendCustomEmail}
                disabled={sending || !customTo || !customSubject || !customMessage}
                className="w-full py-3 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
