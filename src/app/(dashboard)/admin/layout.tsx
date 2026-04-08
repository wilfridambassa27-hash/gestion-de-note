'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Bell, Search, Sparkles, 
  LayoutDashboard, Users, BookOpen, 
  Shield, Settings, LogOut, ChartBar,
  Calendar, Briefcase, Activity, Database, Server, Lock
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useUI } from '@/context/UIContext'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import PageTransition from '@/components/PageTransition'
import useSWR from 'swr'
import { toast } from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const adminMetrics = [
  { icon: Shield, label: 'Intégrité', value: '100%', color: 'text-[#1dff2f]' },
  { icon: Server, label: 'Charge', value: '12%', color: 'text-emerald-400' },
  { icon: Activity, label: 'Flux', value: '98%', color: 'text-emerald-500' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { t } = useUI()
  const router = useRouter()
  const prevNotifsCount = useRef(0)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  // Real-time notification polling (every 5 seconds)
  const { data: notifications, mutate } = useSWR('/api/notifications/unread', fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true
  })

  useEffect(() => {
    if (notifications && Array.isArray(notifications)) {
      if (notifications.length > prevNotifsCount.current && notifications.length > 0) {
        toast.success(notifications[0].message, {
          duration: 6000,
          position: "top-right",
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #10b981"
          },
          iconTheme: {
            primary: '#1dff2f',
            secondary: '#000',
          },
        })
      }
      prevNotifsCount.current = notifications.length
    }
  }, [notifications])

  const handleMarkAsRead = async () => {
    if (!notifications?.length) return
    try {
      await fetch('/api/notifications/unread', { method: 'POST' })
      mutate([]) // clear unread state optimistically
      toast.success("Notifications marquées comme lues")
      setShowNotifDropdown(false)
    } catch {}
  }

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) {
      router.push('/login')
      return
    }
    const userRole = session.user.role?.toLowerCase()
    if (userRole !== 'admin' && userRole !== 'administrateur') {
      router.push('/login?error=role')
      return
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return <div className="flex items-center justify-center min-h-screen bg-white text-[#1dff2f] font-black text-2xl uppercase tracking-[0.5em]">Initialisation Système...</div>
  }

  const menuItems = [
    { icon: LayoutDashboard, label: t('nav_dashboard'), href: '/admin' },
    { icon: Users, label: t('nav_users'), href: '/admin/utilisateurs' },
    { icon: Briefcase, label: t('teacher_role') + 's', href: '/admin/enseignants' },
    { icon: BookOpen, label: t('nav_classes'), href: '/admin/classes' },
    { icon: ChartBar, label: t('nav_stats'), href: '/admin/statistiques' },
    { icon: Shield, label: t('pro_suite') || 'Rétrographie Elite', href: '/admin/retrographie' },
    { icon: Database, label: t('nav_notes'), href: '/admin/notes' },
    { icon: Settings, label: t('nav_settings'), href: '/admin/parametres' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 dashboard-font">
      
      {/* Sidebar - Fixe sur Desktop, Overlay sur Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-80 bg-white transition-transform duration-300 transform border-r border-[#1dff2f]/10 shadow-[0_0_40px_rgba(29,255,47,0.05)]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:static lg:translate-x-0`}>
        
        <div className="h-full flex flex-col relative bg-white">
           <div className="p-10 pb-6 relative z-10 border-b border-slate-50 mb-6">
              <Link href="/admin" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 group">
                 <motion.div 
                   whileHover={{ scale: 1.1, rotate: 10 }}
                   className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/50 transition-all border border-emerald-500/30"
                 >
                    <Shield className="text-[#1dff2f] w-8 h-8" />
                 </motion.div>
                 <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">EduNotes<span className="text-[#1dff2f]">.</span></span>
                    <span className="text-[8px] font-black uppercase tracking-[0.5em] text-[#1dff2f] mt-1 leading-none">Console Maître</span>
                 </div>
              </Link>
           </div>

           <nav className="flex-1 px-6 space-y-2 relative z-10 overflow-y-auto custom-scrollbar">
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
                         <div className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-[#1dff2f] text-black shadow-lg shadow-emerald-500/40 border border-emerald-400' : 'bg-slate-50 text-slate-400 group-hover:text-emerald-500'}`}>
                            <item.icon className="w-5 h-5" />
                         </div>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : ''}`}>{item.label}</span>
                         {isActive && <div className="ml-auto w-2 h-2 bg-[#1dff2f] rounded-full shadow-[0_0_10px_#1dff2f]" />}
                      </motion.div>
                   </Link>
                 )
              })}
           </nav>

           <div className="p-8 relative z-10 border-t border-slate-50">
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full p-5 bg-slate-950 text-[#1dff2f] border border-emerald-500/30 rounded-[1.8rem] hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/10"
              >
                 <LogOut className="w-5 h-5" /> {t('logout') || 'Déconnexion'}
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

      {/* Contenu Principal */}
      <main className="flex-1 min-w-0 transition-all duration-300 bg-white relative flex flex-col">
        
        {/* Header Mobile avec Hamburger */}
        <header className="lg:hidden bg-white/80 backdrop-blur-xl p-6 border-b border-[#1dff2f]/10 flex justify-between items-center sticky top-0 z-50">
          <Link href="/admin" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-500/30">
                <Shield className="text-[#1dff2f] w-6 h-6" />
             </div>
             <span className="text-lg font-black tracking-tighter uppercase">Admin<span className="text-[#1dff2f]">.</span></span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-3 bg-slate-950 text-[#1dff2f] rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all border border-emerald-500/30"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* TopBar Desktop */}
        <header className="hidden lg:flex h-24 bg-white/80 backdrop-blur-xl border-b border-[#1dff2f]/10 items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100">
               {adminMetrics.map((metric) => (
                 <div key={metric.label} className="flex items-center gap-3 px-6 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:scale-105">
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</span>
                       <span className="text-sm font-black text-slate-900 tracking-tight">{metric.value}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex items-center gap-8">
             {session?.user?.academicSession && (
               <div className="hidden sm:flex items-center gap-3 px-6 py-3 bg-white border border-[#1dff2f]/20 rounded-2xl shadow-lg shadow-emerald-500/5">
                  <div className="w-2.5 h-2.5 bg-[#1dff2f] rounded-full animate-pulse shadow-neon" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">{session.user.academicSession}</span>
               </div>
             )}

             <div className="relative">
                <button 
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)} 
                  className="relative p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-[#1dff2f]/30 hover:shadow-neon-soft transition-all group cursor-pointer"
                >
                    <Bell className={`w-6 h-6 ${showNotifDropdown ? 'text-slate-900' : 'text-slate-400'} group-hover:text-slate-900`} />
                    {notifications && notifications.length > 0 && (
                      <span className="absolute top-4 right-4 flex items-center justify-center w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-md animate-bounce text-[8px] font-bold text-white">
                        {notifications.length}
                      </span>
                    )}
                </button>

                <AnimatePresence>
                   {showNotifDropdown && (
                     <motion.div
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
                       className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden z-50 overflow-y-auto max-h-[500px] custom-scrollbar"
                     >
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                           <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Notifications</h4>
                           <button onClick={handleMarkAsRead} className="text-[9px] font-black text-[#1dff2f] uppercase tracking-widest hover:underline">Marquer comme lu</button>
                        </div>
                        <div className="divide-y divide-slate-50">
                           {notifications && notifications.length > 0 ? (
                             notifications.map((notif: any) => (
                               <div key={notif.id} className="p-6 hover:bg-slate-50 transition-colors">
                                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight mb-1">{notif.title}</p>
                                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                                  <p className="text-[8px] font-black text-[#1dff2f] uppercase tracking-widest mt-2">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                               </div>
                             ))
                           ) : (
                             <div className="p-12 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                   <Bell className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucune alerte</p>
                             </div>
                           )}
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
             
             <div className="flex items-center gap-3 pr-2">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-[#1dff2f] font-black text-lg shadow-lg shadow-emerald-500/20 border-2 border-emerald-500/30">
                  {session?.user?.name?.charAt(0) || 'A'}
                </div>
             </div>
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
