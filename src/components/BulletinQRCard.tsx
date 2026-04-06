// ============================================================
// BulletinQRCard.tsx — Carte de Bulletin avec QR Code
// Affiche la moyenne, le rang et la mention d'un étudiant,
// génère son QR code d'accès, et permet l'export Excel
// ainsi que l'envoi du bulletin par email aux parents.
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  QrCode, Download, Mail, CheckCircle, Loader2, X,
  RefreshCw, Send, ExternalLink
} from 'lucide-react'

interface BulletinQRCardProps {
  etudiantId: string
  etudiantNom: string
  etudiantPrenom: string
  email: string
  moyenne: number
  mention: string
  rang: number
  totalEleves: number
  semestreId?: string
  semestreLabel?: string
  onClose?: () => void
}

export default function BulletinQRCard({
  etudiantId,
  etudiantNom,
  etudiantPrenom,
  email,
  moyenne,
  mention,
  rang,
  totalEleves,
  semestreId,
  semestreLabel = 'Semestre',
  onClose,
}: BulletinQRCardProps) {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [error, setError] = useState('')

  // ── URLs d'API générées dynamiquement selon l'étudiant et le semestre ──
  const qrUrl = `/api/etudiants/${etudiantId}/qrcode${semestreId ? `?semestreId=${semestreId}` : ''}`   // Image QR Code
  const excelUrl = `/api/etudiants/${etudiantId}/export?format=excel${semestreId ? `&semestreId=${semestreId}` : ''}` // Export Excel

  // ── Téléchargement du bulletin Excel dans un nouvel onglet ──
  const downloadExcel = () => {
    window.open(excelUrl, '_blank')
  }

  // ── Envoi du bulletin par email aux parents via l'API de notifications ──
  const sendEmail = async () => {
    setEmailLoading(true)
    setError('')
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bulletin_published',
          etudiantId,
          semestreId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEmailSent(true)
      } else {
        setError(data.error || "Erreur lors de l'envoi")
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setEmailLoading(false)
    }
  }

  // ── Couleur de la moyenne selon le seuil académique ──
  const moyColor = moyenne >= 16
    ? 'text-emerald-500'
    : moyenne >= 10
    ? 'text-emerald-500'
    : 'text-rose-500'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 border border-white/10 shadow-2xl w-full max-w-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-black text-sm tracking-tight">
            {etudiantPrenom} {etudiantNom}
          </h3>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-0.5">
            Bulletin — {semestreLabel}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <p className={`text-lg font-black ${moyColor}`}>{moyenne.toFixed(2)}</p>
          <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold">Moy.</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <p className="text-lg font-black text-emerald-400">{rang}</p>
          <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold">Rang / {totalEleves}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <p className="text-[11px] font-black text-white leading-tight mt-1">{mention}</p>
          <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold">Mention</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-2xl p-4 mb-4 flex flex-col items-center">
        <img
          src={qrUrl}
          alt="QR Code Bulletin"
          className="w-36 h-36 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50" y="55" text-anchor="middle" font-size="12" fill="%2394a3b8">QR Code</text></svg>' }}
        />
        <p className="text-slate-500 text-[9px] text-center mt-2 font-bold uppercase tracking-wider">
          Scannez pour télécharger le relevé Excel
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={downloadExcel}
          className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          Télécharger Excel
        </button>

        {emailSent ? (
          <div className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Email envoyé !</span>
          </div>
        ) : (
          <button
            onClick={sendEmail}
            disabled={emailLoading}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          >
            {emailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5 text-emerald-400" />}
            {emailLoading ? 'Envoi...' : `Envoyer à ${email}`}
          </button>
        )}

        {error && (
          <p className="text-rose-400 text-[9px] text-center font-bold">{error}</p>
        )}
      </div>
    </motion.div>
  )
}
