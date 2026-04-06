'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Bell, Search, Sparkles, 
  LayoutDashboard, FileText, User, 
  LogOut, ChartBar, Award, Zap, Calendar, GraduationCap, QrCode, Layers, Info
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import PageTransition from '@/components/PageTransition'

const etudiantMetrics = [
  { icon: Award, label: 'Moyenne', value: '15.2', color: 'text-emerald-500' },
  { icon: ChartBar, label: 'Crédits', value: '24/30', color: 'text-[#1dff2f]' },
  { icon: Zap, label: 'Activité', value: 'Élevée', color: 'text-[#1dff2f]' },
]

export default function EtudiantLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) {
      router.push('/login')
      return
    }
    const userRole = session.user.role?.toLowerCase()
    if (userRole !== 'etudiant') {
      router.push('/login?error=role')
      return
    }

    if (pathname.includes('/etudiant/bulletin') || pathname.includes('/etudiant/ma-classe')) {
      const isVerified = sessionStorage.getItem('edunotes_class_verified') === 'true'
      if (!isVerified) {
        router.push('/etudiant/verification')
      }
    }
  }, [session, status, router, pathname])

  if (status === 'loading' || !session) {
    return <div className="flex items-center justify-center min-h-screen bg-white text-[#1dff2f] font-black text-2xl uppercase tracking-widest">Initialisation Vision...</div>
  }

  if (pathname === '/etudiant/verification') {
    return <>{children}</>
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', href: '/etudiant' },
    { icon: GraduationCap, label: 'Mes Classes', href: '/etudiant/mes-classes' },
    { icon: Layers, label: 'Ma Classe', href: '/etudiant/ma-classe' },
    { icon: User, label: 'Mon Profil', href: '/etudiant/profil' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 dashboard-font">
      
      {/* Sidebar - Fixe sur Desktop, Overlay sur Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-80 bg-white transition-transform duration-300 transform border-r border-[#1dff2f]/10 shadow-[0_0_40px_rgba(29,255,47,0.05)]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:static lg:translate-x-0`}>
        
        <div className="h-full flex flex-col relative bg-white">
           <div className="p-10 pb-6 relative z-10">
              <Link href="/etudiant" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 group">
                 <motion.div 
                   whileHover={{ rotate: 10, scale: 1.1 }}
                   className="w-14 h-14 bg-[#1dff2f] rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/50 transition-all border border-emerald-400"
                 >
                   <Sparkles className="text-black w-8 h-8" />
                 </motion.div>
                 <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tighter leading-none text-slate-900 uppercase">EduNotes</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1dff2f] mt-1">Vision Élève</span>
                 </div>
              </Link>
           </div>

           <nav className="flex-1 px-6 space-y-2 mt-8 relative z-10 overflow-y-auto custom-scrollbar">
              {menuItems.map((item) => {
                 const isActive = pathname === item.href
                 return (
                   <Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)}>
                      <motion.div 
                        whileHover={{ x: 4 }}
                        className={`flex items-center gap-4 p-4 rounded-[2rem] transition-all group ${
                          isActive 
                            ? 'bg-[#1dff2f]/10 border border-[#1dff2f]/20 shadow-lg shadow-emerald-500/10' 
                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                        }`}
                      >
                         <div className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-[#1dff2f] text-black shadow-lg shadow-emerald-500/40 border border-emerald-400' : 'bg-slate-100 text-slate-400 opacity-60 group-hover:text-emerald-500'}`}>
                            <item.icon className="w-5 h-5" />
                         </div>
                         <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : ''}`}>{item.label}</span>
                         {isActive && <div className="ml-auto w-1.5 h-1.5 bg-[#1dff2f] rounded-full shadow-[0_0_10px_#1dff2f]" />}
                      </motion.div>
                   </Link>
                 )
              })}
           </nav>

           <div className="p-6 relative z-10 border-t border-slate-50">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] mb-6 flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-[#1dff2f] font-black text-lg shadow-lg shadow-emerald-500/10 border border-emerald-500/30">
                    {session?.user?.name?.charAt(0) || 'É'}
                 </div>
                 <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-black text-slate-900 truncate uppercase tracking-tight">{session?.user?.name || 'Étudiant'}</span>
                    <span className="text-[10px] font-black text-[#1dff2f] uppercase tracking-widest">En Ligne</span>
                 </div>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full p-4 bg-white hover:bg-slate-950 hover:text-[#1dff2f] rounded-[1.5rem] border border-slate-200 text-slate-900 transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/20"
              >
                 <LogOut className="w-5 h-5" /> DÉCONNEXION
              </button>
           </div>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="absolute top-6 right-6 lg:hidden p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 transition-all duration-300 bg-white relative flex flex-col">
        
        {/* Header Mobile avec Hamburger */}
        <header className="lg:hidden bg-white/80 backdrop-blur-xl p-6 border-b border-[#1dff2f]/10 flex justify-between items-center sticky top-0 z-50">
          <Link href="/etudiant" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#1dff2f] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="text-black w-6 h-6" />
             </div>
             <span className="text-lg font-black tracking-tighter uppercase">EduNotes<span className="text-[#1dff2f]">.</span></span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-3 bg-slate-950 text-[#1dff2f] rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all border border-emerald-500/30"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Desktop Header TopBar */}
        <header className="hidden lg:flex h-24 bg-white/80 backdrop-blur-xl border-b border-[#1dff2f]/10 items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4">
               {etudiantMetrics.map((metric) => (
                 <div key={metric.label} className="flex items-center gap-3 px-6 py-2.5 bg-slate-50 rounded-full border border-slate-100 group hover:border-[#1dff2f]/30 transition-all cursor-default shadow-sm hover:shadow-neon-soft">
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{metric.label}</span>
                       <span className="text-xs font-black text-slate-900 tracking-tight">{metric.value}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex items-center gap-8">
             {session?.user?.academicSession && (
               <div className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-[#1dff2f]/20 text-slate-900 rounded-2xl shadow-lg shadow-emerald-500/5">
                  <div className="w-2 h-2 bg-[#1dff2f] rounded-full animate-pulse shadow-neon" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{session.user.academicSession}</span>
               </div>
             )}

             <button className="relative p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-[#1dff2f]/30 hover:shadow-neon-soft transition-all group active:scale-95">
                <Bell className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#1dff2f] rounded-full border-[3px] border-white shadow-sm" />
             </button>
             
             <Link href="/etudiant/profil" className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-[#1dff2f] font-black text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all border border-emerald-500/30">
                {session?.user?.name?.charAt(0) || 'É'}
             </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4 md:p-8 lg:p-12">
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
