'use client'

import React, { useState } from 'react'
import EnseignantSidebar from '@/components/EnseignantSidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, Search, Sparkles, LogOut, User, Users, Award, GraduationCap, Target, Clock, Calendar } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useSession, signOut } from 'next-auth/react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useUI } from '@/context/UIContext'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import PageTransition from '@/components/PageTransition'

export default function EnseignantLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeMetric, setActiveMetric] = useState<string | null>(null)
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const { data: session, status } = useSession()
  const { t } = useUI()
  const router = useRouter()
  const pathname = usePathname()

  // Role guard
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) {
      router.push('/login')
      return
    }
    const userRole = session.user.role?.toLowerCase()
    if (userRole !== 'enseignant') {
      router.push('/login?error=role')
      return
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">{t('loading')}...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 dashboard-font">
      
      {/* Sidebar - Fixe sur Desktop, Overlay sur Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-80 bg-white transition-transform duration-300 transform border-r border-[#1dff2f]/10 shadow-[0_0_40px_rgba(29,255,47,0.05)]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:static lg:translate-x-0`}>
        
        <EnseignantSidebar onClose={() => setIsSidebarOpen(false)} />
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="absolute top-6 right-6 lg:hidden p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* Contenu Principal */}
      <main className="flex-1 min-w-0 transition-all duration-300 bg-white relative">
        
        {/* Header Mobile avec Hamburger - Custom Suite */}
        <header className="lg:hidden bg-white/80 backdrop-blur-xl p-6 border-b border-[#1dff2f]/10 flex justify-between items-center sticky top-0 z-50">
          <Link href="/enseignant" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#1dff2f] rounded-xl flex items-center justify-center shadow-neon-soft">
                <GraduationCap className="text-black w-6 h-6" />
             </div>
             <span className="text-lg font-black tracking-tighter uppercase">EduNotes<span className="text-[#1dff2f]">.</span></span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-3 bg-slate-950 text-[#1dff2f] rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Global Desktop Header (Optional/TopBar) */}
        <header className="hidden lg:flex h-20 bg-white/80 backdrop-blur-xl border-b border-[#1dff2f]/10 items-center justify-between px-10 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex items-center gap-3">
                 <div className="w-2 h-2 bg-[#1dff2f] rounded-full animate-pulse shadow-neon" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Système Élite Opérationnel</span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <button className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-neon-soft group transition-all">
                 <Bell className="w-5 h-5 text-slate-400 group-hover:text-slate-950" />
              </button>
              
              <div className="h-10 w-px bg-slate-100" />
              
              <div className="flex items-center gap-4">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{session?.user?.name}</span>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-[0.2em]">{session?.user?.role}</span>
                 </div>
                 <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-[#1dff2f] font-black shadow-lg shadow-emerald-500/20 border border-emerald-500/30">
                    {session?.user?.name?.charAt(0)}
                 </div>
              </div>
           </div>
        </header>


        {/* Dynamic Content - Reduced padding */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 relative main-module-text">
          <AnimatePresence mode="wait">
            <PageTransition key={pathname}>
               {children}
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
