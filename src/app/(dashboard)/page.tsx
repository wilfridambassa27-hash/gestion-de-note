'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3, 
  Sparkles
} from "lucide-react"

export default function DashboardLanding() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role.toLowerCase()
      const timeout = setTimeout(() => {
        let path = `/${role}`
        if (role === "admin") path = "/admin"
        else if (role === "parent") path = "/etudiant"
        router.push(path)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-400/10 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-400/10 blur-2xl rounded-full [animation-delay:-1s] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-2xl mx-auto relative z-10"
      >
        {/* Loading Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-28 h-28 border-4 border-slate-200/50 border-t-emerald-500 rounded-full mx-auto mb-12 shadow-2xl relative"
        >
          <Sparkles className="absolute inset-0 w-28 h-28 animate-ping text-emerald-400 opacity-30" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-10"
        >
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
            Bienvenue dans votre
          </h1>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
            Dashboard Moderne
          </h2>
          <p className="text-xl font-semibold text-slate-700 opacity-90 leading-relaxed">
            Interface optimisée pour la gestion académique
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-md mx-auto"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="text-left space-y-2">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-2xl font-black text-slate-900">Sécurisé</p>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Authentification renforcée</p>
            </div>
            <div className="text-left space-y-2">
              <div className="w-12 h-12 bg-emerald-500 text-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <p className="text-2xl font-black text-emerald-600">Moderne</p>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Design 2026</p>
            </div>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-lg font-semibold text-slate-700 tracking-wide"
        >
          Redirection automatique vers votre espace {session?.user?.role ? `(${session.user.role})` : "..."}...
        </motion.p>
      </motion.div>
    </div>
  )
}
