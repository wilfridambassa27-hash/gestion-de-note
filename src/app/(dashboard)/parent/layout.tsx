'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Bell, User, LayoutDashboard, 
  FileText, Calendar, ChartBar, CreditCard, LogOut
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useUI } from '@/context/UIContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sparkles, Activity } from 'lucide-react'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { t } = useUI()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) {
      router.push('/login')
      return
    }
    const userRole = session.user.role?.toLowerCase()
    if (userRole !== 'parent') {
      router.push('/login?error=role')
      return
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return <div className="flex items-center justify-center min-h-screen bg-[#F8FAFF]">Authentification Parent...</div>
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', href: '/parent' },
    { icon: FileText, label: 'Bulletins & Notes', href: '/parent/bulletins' },
    { icon: Calendar, label: 'Emploi du Temps', href: '/parent/emploi-temps' },
    { icon: ChartBar, label: 'Suivi de Progression', href: '/parent/progression' },
  ]

  return (
    <div className="flex h-screen bg-[#F8FAFF] overflow-hidden font-[Outfit]">
      {/* Background Nuances */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-900/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[300px] shrink-0 h-full bg-slate-950 text-white flex-col relative z-50 shadow-2xl shadow-slate-900/40">
         <div className="p-10">
            <Link href="/parent" className="flex items-center gap-3 group">
               <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform border border-white/10">
                  <User className="text-emerald-600 w-5 h-5" />
               </div>
               <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter">EduNotes<span className="text-emerald-600">.</span></span>
                  <span className="text-[7px] font-black uppercase tracking-[0.4em] text-emerald-600/80 -mt-1 leading-none">FAMILY INSIGHT</span>
               </div>
            </Link>
         </div>

         <nav className="flex-1 px-6 space-y-2 mt-4">
            {menuItems.map((item) => {
               const isActive = pathname === item.href
               return (
                 <Link key={item.href} href={item.href}>
                    <div className={`flex items-center gap-4 p-5 rounded-2xl transition-all relative overflow-hidden group ${
                      isActive ? 'bg-slate-900 text-emerald-600 shadow-lg border border-emerald-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}>
                       {isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
                       <item.icon className="w-5 h-5 relative z-10" />
                       <span className="text-[10px] font-black uppercase tracking-widest relative z-10">{item.label}</span>
                    </div>
                 </Link>
               )
            })}
         </nav>

         <div className="p-8">
            <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 space-y-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-600/20">
                  <span className="text-emerald-600 font-black text-xs">{session?.user?.name?.charAt(0) || 'P'}</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-white truncate">{session?.user?.name || 'Parent'}</p>
                  <p className="text-[7px] font-black uppercase tracking-[0.2em] text-emerald-600">Access Premium</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3 font-black text-[9px] uppercase tracking-widest active:scale-95"
            >
               <LogOut className="w-4 h-4" /> DÉCONNEXION
            </button>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white/70 backdrop-blur-2xl border-b border-slate-800/5 flex items-center justify-end px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
             <div className="px-5 py-2.5 bg-emerald-50 text-[#10B981] rounded-full border border-emerald-100 flex items-center gap-3 shadow-inner">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shadow-green-glow" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">PORTAIL ACTIF</span>
             </div>
             
             <button className="relative p-3.5 bg-white rounded-2xl border border-slate-800/10 shadow-sm hover:shadow-xl hover:border-emerald-600/30 transition-all group active:scale-95">
                <Bell className="w-4 h-4 text-slate-950 group-hover:text-emerald-600 transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-rose-lg border-2 border-white" />
             </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  )
}
