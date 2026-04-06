'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Users, 
  BarChart3, 
  Activity, 
  Database, 
  AlertTriangle, 
  Lock, 
  Server,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Layout,
  Calendar,
  Briefcase,
  Layers,
  FileText,
  Search,
  Bell,
  Settings
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useUI } from '@/context/UIContext'

const data = [
  { name: 'Lun', users: 40 },
  { name: 'Mar', users: 52 },
  { name: 'Mer', users: 48 },
  { name: 'Jeu', users: 61 },
  { name: 'Ven', users: 55 },
  { name: 'Sam', users: 20 },
  { name: 'Dim', users: 15 },
]

const COLORS = ['#1dff2f', '#000000', '#f1f5f9', '#94a3b8']

export default function AdminDashboard() {
  const { data: session } = useSession()
  const { t } = useUI()
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/admin/statistiques')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const masterMenus = [
    { icon: Users, label: t('nav_users'), href: "/admin/utilisateurs", color: "bg-[#1dff2f]" },
    { icon: Calendar, label: "Sessions", href: "/admin/classes", color: "bg-white" },
    { icon: Database, label: "Data Registry", href: "/admin/notes", color: "bg-white" },
    { icon: Lock, label: t('security'), href: "#", color: "bg-white" },
    { icon: Server, label: "Logs Système", href: "#", color: "bg-white" },
    { icon: Settings, label: t('config'), href: "/admin/parametres", color: "bg-white" },
  ]

  return (
    <div className="space-y-12 pb-20 pt-6">
      
      {/* Executive Command Hero - Vision v4.0 */}
      <div className="relative h-[480px] lg:h-[580px] rounded-[4rem] overflow-hidden group shadow-2xl border border-slate-50 dark:border-slate-800 transition-colors">
         {/* Background Styling */}
         <div className="absolute inset-0 bg-white dark:bg-slate-950">
            <img 
               src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
               alt="Digital Control" 
               className="w-full h-full object-cover grayscale opacity-20 shadow-2xl" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-white/10 dark:via-slate-900/10 to-transparent" />
         </div>

         <div className="absolute inset-0 p-12 lg:p-20 flex flex-col justify-end space-y-10">
            <div className="space-y-6 max-w-3xl relative z-10">
               <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-3 px-6 py-2 bg-black text-[#1dff2f] rounded-full shadow-lg font-black text-[10px] uppercase tracking-[0.4em]"
               >
                  <Shield className="w-4 h-4" />
                  ADMIN PRO CONSOLE — {session?.user?.academicSession}
               </motion.div>
               
               <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter leading-[0.85] uppercase">
                  Terminal<br/>
                  <span className="text-[#1dff2f] text-shadow-neon">Maître.</span>
               </h1>
               
               <p className="text-slate-400 text-xl font-bold max-w-lg leading-relaxed italic border-l-4 border-[#1dff2f] pl-6">
                  Gestion centralisée et supervision des flux académiques en temps réel.
               </p>
            </div>

            <div className="flex items-center gap-10 md:gap-14 relative z-10">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-1">Inscrits</span>
                  <span className="text-3xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tighter">
                    {stats?.totalEtudiants || 0}
                  </span>
               </div>
               <div className="w-[1px] h-10 md:h-14 bg-slate-100 dark:bg-slate-800" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-1">Moy. G</span>
                  <span className="text-3xl md:text-5xl font-black text-[#1dff2f] tracking-tighter">
                    {stats?.moyenneGenerale || 0}
                  </span>
               </div>
               <div className="w-[1px] h-10 md:h-14 bg-slate-100 dark:bg-slate-800" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-1">Classes</span>
                  <span className="text-3xl md:text-5xl font-black text-slate-200 dark:text-slate-400 tracking-tighter">
                    {stats?.totalClasses || 0}
                  </span>
               </div>
            </div>
         </div>
      </div>

      {/* Admin Quick Control Menu Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {masterMenus.map((menu, i) => (
            <Link href={menu.href} key={i}>
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -8, boxShadow: "0 25px 50px rgba(0,0,0,0.08)" }}
                  className={`p-10 rounded-[3rem] border border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center gap-5 transition-all group ${menu.color === 'bg-[#1dff2f]' ? 'bg-[#1dff2f] border-[#1dff2f]/20 shadow-neon' : 'bg-white dark:bg-slate-900 hover:border-[#1dff2f]/30 shadow-sm'}`}
               >
                  <div className={`p-4 rounded-2xl ${menu.color === 'bg-[#1dff2f]' ? 'bg-black text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-[#1dff2f] group-hover:bg-[#1dff2f]/10 transition-colors'}`}>
                     <menu.icon className="w-7 h-7" />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${menu.color === 'bg-[#1dff2f]' ? 'text-black' : 'text-slate-900 dark:text-slate-200 group-hover:text-[#1dff2f]'}`}>{menu.label}</span>
               </motion.div>
            </Link>
          ))}
      </div>

      {/* Main Stats Summary with Neon Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* Live Engagement Chart */}
          <motion.div 
             className="lg:col-span-8 bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-50 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors"
          >
             <div className="absolute right-0 top-0 w-60 h-60 bg-[#1dff2f]/5 blur-[80px] rounded-full -mr-30 -mt-30" />
             <div className="flex justify-between items-center mb-12">
                <div>
                   <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter uppercase">{t('traffic_activity')}</h3>
                   <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('last_7_days')}</p>
                </div>
                <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center gap-3">
                   <div className="w-2 h-2 bg-[#1dff2f] rounded-full animate-pulse shadow-neon" />
                   <span className="text-[10px] font-black uppercase text-slate-900 dark:text-slate-200 tracking-widest">{t('real_time')}</span>
                </div>
             </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1dff2f" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1dff2f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                  <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="users" stroke="#1dff2f" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </motion.div>

         {/* Distribution Summary */}
         <motion.div 
            className="lg:col-span-4 bg-black p-12 rounded-[4rem] text-white relative overflow-hidden flex flex-col justify-between"
         >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#1dff2f]/20 blur-[50px] rounded-full -mr-20 -mt-20" />
            <div className="space-y-1 mb-10 relative z-10">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1dff2f]">Architecture</h3>
               <p className="text-2xl font-black">Répartition Système</p>
            </div>

            <div className="h-[200px] w-full relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={[
                          { name: 'Élèves', value: stats?.totalEtudiants || 1 },
                          { name: 'Profs', value: stats?.totalEnseignants || 1 },
                          { name: 'Admin', value: stats?.totalAdmins || 1 },
                          { name: 'Parents', value: stats?.totalParents || 1 },
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                     >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>

            <div className="mt-10 space-y-3 relative z-10">
               <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Notes</span>
                  <span className="text-sm font-black text-[#1dff2f]">{stats?.totalNotes || 0}</span>
               </div>
               <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Activité Recente</span>
                  <span className="text-sm font-black text-emerald-400">+{stats?.recentActivity || 0} logs</span>
               </div>
            </div>
         </motion.div>
      </div>

      {/* Advanced KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[{ label: "Alertes Sécurité", value: "0", icon: AlertTriangle, status: "stable" },
           { label: "Intégrité Data", value: "100%", icon: Database, status: "stable" },
           { label: "Uptime Serveur", value: "99.9%", icon: Activity, status: "stable" },
           { label: "Sauvegardes", value: "Auto", icon: Server, status: "stable" },
         ].map((stat, idx) => (
           <motion.div 
             key={idx}
             className="p-6 md:p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-50 dark:border-slate-800 shadow-sm hover:border-[#1dff2f]/30 transition-all group overflow-hidden"
           >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#1dff2f] group-hover:text-black transition-all">
                 <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tighter">{stat.value}</h3>
           </motion.div>
         ))}
      </div>

    </div>
  )
}
