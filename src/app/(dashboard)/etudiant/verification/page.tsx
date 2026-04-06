'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  User, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle,
  Key
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

function VerificationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetClassId = searchParams.get('targetClassId')
  const className = searchParams.get('className')
  const { data: session, status } = useSession()

  const [matricule, setMatricule] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/etudiant/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule, nom, prenom })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Identité confirmée !')
        sessionStorage.setItem('edunotes_class_verified', 'true')
        if (targetClassId) {
          sessionStorage.setItem('preferred_class_id', targetClassId)
        }
        router.push('/etudiant/ma-classe')
      } else {
        setError(data.error || 'Informations incorrectes.')
        toast.error('Échec de la vérification.')
      }
    } catch (err) {
      toast.error('Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
      <Toaster position="top-center" />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-xl relative"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[3.5rem] p-10 md:p-14 shadow-2xl border border-white/20 dark:border-slate-800 space-y-10">
          
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 transform transition-transform hover:rotate-6">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Confirmation d'Identité</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Utilisateur: {session?.user?.name}</p>
            {className && (
               <div className="inline-block px-5 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-500/20">
                 Accès vers: {className}
               </div>
            )}
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-5">
               {/* Matricule */}
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 flex items-center gap-2">
                   <Key className="w-4 h-4 text-emerald-500" /> Matricule Étudiant
                 </label>
                 <input 
                   type="text"
                   required
                   value={matricule}
                   onChange={(e) => setMatricule(e.target.value)}
                   className="w-full h-16 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] px-8 text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-inner"
                   placeholder="Ex: ISTA-411T249925"
                 />
               </div>

               {/* Nom & Prenom */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 flex items-center gap-2">
                     <User className="w-4 h-4 text-emerald-500" /> Nom
                   </label>
                   <input 
                     type="text"
                     required
                     value={nom}
                     onChange={(e) => setNom(e.target.value)}
                     className="w-full h-16 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] px-8 text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-inner uppercase"
                     placeholder="Votre nom"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4 flex items-center gap-2">
                     <User className="w-4 h-4 text-emerald-500" /> Prénom
                   </label>
                   <input 
                     type="text"
                     required
                     value={prenom}
                     onChange={(e) => setPrenom(e.target.value)}
                     className="w-full h-16 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] px-8 text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-inner capitalize"
                     placeholder="Votre prénom"
                   />
                 </div>
               </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-5 rounded-3xl flex items-center gap-4"
              >
                <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
                <p className="text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-20 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white rounded-[2.5rem] flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-emerald-600/30 disabled:opacity-70 group active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  <Fingerprint className="w-6 h-6" />
                  Finaliser l'Authentification
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-400">
             <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sécurisé par EduNotes
             </span>
             <button 
               onClick={() => router.back()}
               className="text-[10px] font-black uppercase tracking-widest hover:text-emerald-600 transition-colors"
             >
               Annuler
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <VerificationForm />
    </Suspense>
  )
}
