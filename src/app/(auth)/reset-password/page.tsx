'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import AuthLayout from '@/components/AuthLayout'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.')
        setSent(true)
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase mb-2">Mot de passe <span className="text-[#1dff2f]">oublié ?</span></h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Nous vous aiderons à réinitialiser votre compte</p>
      </div>
      <Toaster position="top-right" />
      
      <div className="max-w-sm mx-auto">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-3 font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la connexion
        </Link>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="form"
            >
              <p className="text-slate-600 mb-3 text-xs leading-relaxed">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-3">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-emerald-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-lg transition-all duration-300" 
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <motion.button 
                  type="submit" 
                  disabled={loading} 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-600 text-white rounded-2xl font-bold text-xs shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key="success"
              className="text-center py-6"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl mx-auto mb-3 flex items-center justify-center shadow-2xl">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Email envoyé !</h2>
              <p className="text-slate-600 mb-3 max-w-sm mx-auto leading-relaxed">
                Vérifiez votre boîte de réception (et dossiers spam) pour le lien de réinitialisation.
              </p>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Retour à la connexion
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  )
}
