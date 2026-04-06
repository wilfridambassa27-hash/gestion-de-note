'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { toast, Toaster } from 'react-hot-toast'
import { 
  Mail, Lock, Eye, EyeOff, CheckCircle2, Calendar, 
  GraduationCap, ArrowRight, Loader2 
} from 'lucide-react'
import AuthLayout from '@/components/AuthLayout'

function ConfirmAccountContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''
  const devPassword = searchParams.get('dev') || ''

  const [password, setPassword] = useState(devPassword)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedSession, setSelectedSession] = useState('2025-2026')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const sessions = [
    { value: '2024-2025', label: '2024-2025' },
    { value: '2025-2026', label: '2025-2026 (Active)' },
    { value: '2026-2027', label: '2026-2027' }
  ]

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email ou mot de passe manquant.')
      return
    }
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        academicSession: selectedSession,
        redirect: false
      })

      if (res?.error) {
        toast.error('Mot de passe incorrect. Vérifiez votre email.')
      } else {
        setIsSuccess(true)
        toast.success(`Accès confirmé — Session ${selectedSession}`)

        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        const role = sessionData?.user?.role?.toLowerCase()

        setTimeout(() => {
          router.push(
            role === 'admin' ? '/admin' :
            role === 'enseignant' ? '/enseignant' :
            role === 'etudiant' ? '/etudiant' : '/login'
          )
        }, 2000)
      }
    } catch {
      toast.error("Erreur de connexion réseau.")
    } finally {
      if (!isSuccess) setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[600] bg-slate-950 flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-40 h-40 bg-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-slate-950" />
        </motion.div>
        <h2 className="text-3xl font-black text-white mt-8 tracking-tighter">Accès Validé !</h2>
        <p className="text-emerald-600 text-sm font-bold mt-2 uppercase tracking-widest">Redirection...</p>
      </div>
    )
  }

  return (
    <AuthLayout>
      <Toaster position="top-right" />
      <div className="min-h-screen flex items-center justify-start pl-12 md:pl-24 bg-transparent relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/50 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <GraduationCap className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Confirmation</h1>
            <h2 className="text-base font-bold text-slate-500 mt-1">Finalisez votre accès EduNotes</h2>
            <div className="w-12 h-1 bg-emerald-600 mt-4 rounded-full" />
          </div>

          {/* Email display */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-bold text-slate-600 truncate">{email || 'votre@email.com'}</span>
            <span className="ml-auto text-[9px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-2 py-1 rounded-full">Vérifié</span>
          </div>

          <form onSubmit={handleConfirm} className="space-y-5">
            {/* Session Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Session Académique</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none appearance-none"
                >
                  {sessions.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password from email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Mot de passe reçu par email
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez le mot de passe reçu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 ml-1">
                📧 Un mot de passe a été envoyé à votre adresse email lors de l'inscription.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-950 hover:bg-black disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {loading ? 'Vérification...' : 'Confirmer et Accéder'}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-400 mt-6">
            Problème ? Contactez l'administrateur de votre établissement.
          </p>
        </motion.div>
      </div>
    </AuthLayout>
  )
}

export default function ConfirmAccountPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
      <ConfirmAccountContent />
    </Suspense>
  )
}
