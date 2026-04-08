// ============================================================
// EnseignantSidebar.tsx — Barre de Navigation Latérale (Enseignant)
// Affiche les liens de navigation vers les modules du dashboard,
// met en surbrillance la route active, et gère la déconnexion.
// ============================================================

import { 
  LayoutDashboard, BookOpen, Users, BarChart2, Settings, LogOut, ChevronRight,
  GraduationCap, Sparkles, User, Target, Info, PenLine
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut, useSession } from 'next-auth/react'
import { useUI } from '@/context/UIContext'

export default function EnseignantSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { t } = useUI()
  
  // ── Définition des éléments du menu ──
  const menuItems = [
    { icon: LayoutDashboard, label: t('nav_dashboard'), href: '/enseignant', desc: t('desc_nav_dashboard') },
    { icon: Users, label: t('nav_users'), href: '/enseignant/utilisateurs', desc: t('desc_nav_users') },
    { icon: Target, label: t('nav_classes'), href: '/enseignant/mes-classes', desc: t('desc_nav_classes') },
    { icon: PenLine, label: t('nav_notes'), href: '/enseignant/saisie-notes', desc: t('desc_nav_notes') },
    { icon: BarChart2, label: t('nav_stats'), href: '/enseignant/statistiques', desc: t('desc_nav_stats') || 'Performance' },
    { icon: Settings, label: t('nav_settings'), href: '/enseignant/parametres', desc: t('desc_nav_settings') },
  ]

  return (
    <div className="h-screen flex flex-col shadow-[0_0_50px_rgba(29,255,47,0.08)] border-r border-[#1dff2f]/10 relative overflow-hidden bg-white">
      
      {/* Subtle Neon Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-[#1dff2f]/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-32 h-32 bg-[#1dff2f]/5 rounded-full blur-[60px]" />
      </div>

      {/* Brand Header */}
      <div className="p-10 pb-6 relative z-10">
        <div onClick={onClose}>
          <Link href="/enseignant" className="flex items-center gap-4 group">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-14 h-14 bg-[#1dff2f] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(29,255,47,0.3)] transition-all"
            >
              <GraduationCap className="text-black w-8 h-8" />
            </motion.div>
            <div>
              <span className="text-xl font-black tracking-tighter block leading-none text-slate-900">
                EDUNOTES<span className="text-[#1dff2f] text-2xl font-black">.</span>
              </span>
              <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-400">
                {t('pro_suite') || 'Professional Suite'}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <motion.nav 
        className="flex-1 px-6 py-4 space-y-2 relative z-10 overflow-y-auto"
      >
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <motion.div 
              key={item.href} 
              className="space-y-1"
              onClick={onClose}
            >
              <Link href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center justify-between p-4 rounded-[1.8rem] transition-all duration-300 relative group overflow-hidden ${
                    isActive 
                      ? 'bg-[#1dff2f]/10 border border-[#1dff2f]/20 shadow-none' 
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4 z-10 relative">
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#1dff2f] text-black shadow-neon-soft' 
                        : 'bg-slate-100 text-slate-400 group-hover:text-[#1dff2f] group-hover:bg-white'
                    }`}>
                      <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-black uppercase tracking-widest ${
                        isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-900'
                      }`}>
                        {item.label}
                      </span>
                      <span className={`text-[8px] font-bold uppercase tracking-tight leading-tight mt-0.5 ${
                        isActive ? 'text-slate-500' : 'text-slate-300'
                      }`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-[#1dff2f] rounded-full shadow-[0_0_10px_#1dff2f]" />
                  )}
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>

      {/* ── PIED DE PAGE : Carte d'identité de l'utilisateur connecté + Déconnexion ── */}
      <div className="p-6 relative z-10 border-t border-slate-50">
        <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#1dff2f] rounded-xl flex items-center justify-center text-black font-black text-sm shadow-md">
              {session?.user?.name?.charAt(0) || 'E'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{session?.user?.name || t('teacher_role')}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1dff2f] animate-pulse" />
                <p className="text-[8px] font-black uppercase tracking-widest text-[#1dff2f]">{t('active_status') || 'En ligne'}</p>
              </div>
            </div>
          </div>
          
          {/* Bouton de déconnexion — redirige vers /login après signOut() */}
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full py-4 bg-slate-950 text-[#1dff2f] font-bold rounded-full border border-emerald-500/30 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[9px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('logout') || 'Déconnexion'}
          </button>
        </div>
      </div>
    </div>
  )
}
