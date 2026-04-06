'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "react-hot-toast"
import { 
  Mail, 
  Loader2, 
  CheckCircle2, 
  Users,
  ArrowRight,
  ShieldCheck,
  Zap,
  User,
  GraduationCap
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import AuthLayout from "@/components/AuthLayout"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"ETUDIANT" | "ENSEIGNANT">("ETUDIANT")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role: selectedRole })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsSuccess(true)
        toast.success("Compte Elite Créé !", { duration: 4000 })
        setTimeout(() => {
          const params = new URLSearchParams({ email })
          if (data._devPassword) params.set('dev', data._devPassword)
          router.push(`/confirm-account?${params.toString()}`)
        }, 2200)
      } else {
        toast.error(data.error || "Erreur lors de la création")
      }
    } catch (error) {
      toast.error("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[600] bg-white flex flex-col items-center justify-center gap-8">
        <motion.div 
          initial={{ scale: 0, rotate: -45 }} 
          animate={{ scale: 1, rotate: 0 }} 
          className="w-48 h-48 bg-[#10b981] rounded-[3rem] flex items-center justify-center shadow-2xl relative overflow-hidden"
        >
           <CheckCircle2 className="w-20 h-20 text-white relative z-10" />
           <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Compte Elite Créé !</h2>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initialisation du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthLayout>
      <Toaster position="top-right" />
      <div className="flex flex-col items-center justify-center w-full min-h-screen p-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        
        {/* Modern Inscription Form Design */}
        <div className="w-full max-w-md p-10 bg-white/70 backdrop-blur-3xl rounded-[40px] shadow-2xl border border-white/60">
          
          {/* Header du formulaire */}
          <div className="mb-12 text-center space-y-2">
             <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
             </div>
             <h2 className="text-sm font-black text-slate-950 uppercase tracking-[.25em]">Inscription Elite</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rejoignez l'Excellence Académique</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sélecteurs de Rôle */}
            <div className="flex justify-center gap-4 mb-10">
              {[
                { id: 'ETUDIANT' as const, label: 'Étudiant', sub: 'Notes & bulletins', icon: GraduationCap },
                { id: 'ENSEIGNANT' as const, label: 'Professeur', sub: 'Gestion & Saisie', icon: Users }
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex-1 p-5 rounded-[2.5rem] transition-all duration-500 text-left border relative overflow-hidden ${
                    selectedRole === role.id 
                      ? 'bg-slate-950 text-white shadow-2xl scale-105 border-slate-950'
                      : 'bg-slate-50/50 text-slate-700 border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  <div className={`p-3 w-10 h-10 flex items-center justify-center rounded-xl mb-4 ${selectedRole === role.id ? 'bg-emerald-500' : 'bg-white shadow-sm'}`}>
                    <role.icon className={`w-5 h-5 ${selectedRole === role.id ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <p className="font-black text-xs tracking-tight">{role.label}</p>
                  <p className={`text-[9px] font-bold ${selectedRole === role.id ? 'text-slate-400' : 'text-slate-400'}`}>{role.sub}</p>
                  
                  {selectedRole === role.id && (
                    <motion.div 
                      layoutId="activeRole"
                      className="absolute -right-2 -top-2 w-8 h-8 bg-emerald-400/20 rounded-full blur-xl"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="space-y-6">
              <div className="relative space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Nom Complet</label>
                <div className="flex items-center bg-slate-50/80 rounded-full border border-slate-100 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 transition-all group">
                  <span className="pl-6 pr-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                    <User className="w-4 h-4" />
                  </span>
                  <input 
                    required
                    type="text" 
                    placeholder="Jean Dupont" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full py-5 bg-transparent outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300" 
                  />
                </div>
              </div>

              <div className="relative space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Email Institutionnel</label>
                <div className="flex items-center bg-slate-50/80 rounded-full border border-slate-100 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 transition-all group">
                  <span className="pl-6 pr-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    required
                    type="email" 
                    placeholder="contact@universite.edu" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full py-5 bg-transparent outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300" 
                  />
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="my-8 flex gap-4 items-start p-5 bg-emerald-50/50 border border-emerald-100/50 rounded-3xl">
              <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                 <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-[10px] leading-relaxed text-emerald-800 font-bold uppercase tracking-tight">
                Accès sécurisé. Un <strong className="text-emerald-600 underline underline-offset-2">code d'accès temporaire</strong> sera généré et envoyé à votre mail.
              </p>
            </div>

            {/* CTA Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-between p-6 bg-slate-950 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-neon-elite hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 group"
            >
              <span className="ml-4">{loading ? "Initialisation..." : "Créer mon compte Elite"}</span>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </div>
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
              Prêt pour le succès? 
              <Link href="/login" className="font-black text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
                SE CONNECTER <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
