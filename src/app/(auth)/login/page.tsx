'use client'

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast, Toaster } from "react-hot-toast"
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  GraduationCap, 
  X,
  Calendar,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import AuthLayout from "@/components/AuthLayout"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState('2025-2026')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const session = searchParams.get('session')
    if (session && ['2024-2025', '2025-2026', '2026-2027'].includes(session)) {
      setSelectedSession(session)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        academicSession: selectedSession,
        rememberMe: 'false',
        redirect: false
      })

      if (res?.error) {
        toast.error("Identifiants incorrects", {
          style: { background: "#000", color: "#fff", borderRadius: "1rem", border: "1px solid #ff4d4d" }
        })
      } else {
        // Fetch session to determine role and redirect
        const sessionRes = await fetch("/api/auth/session")
        const sessionData = await sessionRes.json()
        const actualRole = sessionData?.user?.role?.toLowerCase()

        setIsSuccess(true)
        toast.success(`Système Prêt : Session ${selectedSession}`, {
          style: { background: "#000", color: "#1dff2f", borderRadius: "1rem", fontWeight: "bold", border: "1px solid #1dff2f" }
        })

        setTimeout(() => {
          const targetPath = actualRole === "admin" ? "/admin" : 
                            actualRole === "etudiant" ? "/etudiant" : 
                            actualRole === "enseignant" ? "/enseignant" : "/dashboard"
          
          router.push(targetPath)
        }, 2200)
      }
    } catch (error) {
      toast.error("Erreur de connexion réseau")
    } finally {
      if (!isSuccess) setLoading(false)
    }
  }

  const sessions = [
    { value: '2024-2025', label: '2024-2025' },
    { value: '2025-2026', label: '2025-2026 (Active)' },
    { value: '2026-2027', label: '2026-2027' }
  ]

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[600] bg-white flex flex-col items-center justify-center overflow-hidden">
        
        {/* Neon Pulse Background */}
        <div className="absolute inset-0 z-0">
          {[0.4, 0.7, 1.0].map((scale, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-[#1dff2f]/10"
              style={{ margin: 'auto', width: `${scale * 100}vw`, height: `${scale * 100}vw` }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
          >
            <motion.div
              className={`absolute inset-0 rounded-full border-[3px] border-t-[#1dff2f] border-r-[#1dff2f]/50 border-b-[#1dff2f]/30 border-l-transparent shadow-neon`}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="w-32 h-32 md:w-44 md:h-44 bg-black rounded-full flex items-center justify-center shadow-2xl border-4 border-[#1dff2f]"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-[#1dff2f] drop-shadow-[0_0:15px_#1dff2f]" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950 uppercase italic mb-4">Initialisation...</h2>
            <div className="h-1.5 w-40 bg-slate-100 rounded-full mx-auto overflow-hidden">
               <motion.div 
                 className="h-full bg-[#1dff2f] shadow-neon"
                 animate={{ x: [-160, 160] }}
                 transition={{ duration: 1.5, repeat: Infinity }}
               />
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <AuthLayout>
      <Toaster position="top-right" />
      <div className="flex flex-col space-y-10 w-full animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        {/* Institutional Header (Restored Neon) */}
        <div className="text-center md:text-left space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-black rounded-3xl w-max shadow-xl mx-auto md:mx-0 border border-[#1dff2f]/20"
          >
            <GraduationCap className="w-8 h-8 text-[#1dff2f]" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Connexion</h1>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-3 border-l-2 border-[#1dff2f] pl-4 italic">
              Elite Academy Protocol v4.0
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            {/* Session Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Session Académique</label>
                <Zap className="w-3 h-3 text-[#1dff2f] animate-pulse shadow-neon" />
              </div>
              <div className="relative group">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#1dff2f] transition-all" />
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] focus:bg-white dark:focus:bg-slate-900 focus:border-[#1dff2f]/40 outline-none transition-all font-black text-[12px] uppercase tracking-widest text-slate-900 dark:text-white shadow-inner appearance-none"
                >
                  {sessions.map((session) => (
                    <option key={session.value} value={session.value}>{session.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Identifiant Email</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#1dff2f] transition-all" />
                <input
                  type="email"
                  placeholder="nom@ecole.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] focus:bg-white dark:focus:bg-slate-900 focus:border-[#1dff2f]/40 outline-none transition-all font-bold text-slate-900 dark:text-white shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Code d'accès</label>
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[9px] font-black text-[#1dff2f] uppercase tracking-widest hover:underline"
                >
                  Oublié ?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#1dff2f] transition-all" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-12 py-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] focus:bg-white dark:focus:bg-slate-900 focus:border-[#1dff2f]/40 outline-none transition-all font-bold text-slate-900 dark:text-white shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1dff2f] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-black hover:bg-slate-900 disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-[0.5em] rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 group relative overflow-hidden"
          >
            {loading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
               <>
                 <span className="relative z-10 text-[#1dff2f]">DÉBLOQUER L'ACCÈS</span>
                 <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform relative z-10" />
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1dff2f]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
               </>
            )}
          </button>
        </form>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic text-center md:text-left">L'Excellence est Néon.</span>
           <Link href="/register" className="text-[10px] font-black text-slate-900 dark:text-white hover:text-[#1dff2f] uppercase tracking-widest transition-colors flex items-center gap-2 group">
              Créer un compte Elite
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all shadow-neon" />
           </Link>
        </div>
      </div>

      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForgotModal(false)} className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl" />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} 
               className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-12 w-full max-w-sm shadow-2xl border border-[#1dff2f]/20"
            >
               <button onClick={() => setShowForgotModal(false)} className="absolute top-8 right-8 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-black hover:text-[#1dff2f] transition-all text-slate-400 shadow-neon-soft">
                  <X className="w-4 h-4" />
               </button>
               <div className="space-y-8 text-center">
                  <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto border border-[#1dff2f]/20 shadow-neon">
                     <Lock className="w-8 h-8 text-[#1dff2f]" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter uppercase leading-none">Code Perdu</h3>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">Initialisation de Sécurité Requise</p>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic">
                    "Veuillez contacter le secrétariat académique pour obtenir un nouveau code d'accès."
                  </p>
                  <button onClick={() => setShowForgotModal(false)} className="w-full py-5 bg-black text-[#1dff2f] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-neon active:scale-95 transition-all">
                     COMPRIS
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
