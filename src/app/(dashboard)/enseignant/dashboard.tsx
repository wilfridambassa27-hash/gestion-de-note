// ============================================================
// dashboard.tsx — Tableau de Bord Principal de l'Enseignant
// Affiche : section héro immersive, grille d'actions rapides,
// statistiques de performance et graphiques analytiques.
// Données chargées depuis /api/enseignants/dashboard.
// ============================================================

"use client";

import React from 'react'
import { 
  Users, 
  BookOpen, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  Award, 
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Zap,
  Layout,
  PieChart,
  Activity,
  Info,
  Shield,
  Layers,
  FileText,
  Bell,
  PenLine,
  BarChart2,
  Settings
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useUI } from '@/context/UIContext'
import TeacherDashboardGraphs from '@/components/TeacherDashboardGraphs'
import { DashboardData } from '@/types/stats'

const TeacherDashboard = () => {
  const { data: session } = useSession()
  const { t, academicSession } = useUI()
  // ── État : données du tableau de bord et indicateur de chargement ──
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)

  // ── Chargement asynchrone des statistiques du dashboard ──
  // Filtré par session académique active pour des données contextuelles
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/enseignants/dashboard?session=${academicSession}`)
        if (res.ok) {
          setData(await res.json())
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [academicSession])

  // ── Définition des raccourcis d'actions rapides (Quick Menus) ──
  // Chaque entrée pointe vers un module clé du dashboard enseignant
  const quickMenus = [
    { icon: PenLine, label: t('nav_notes'), href: "/enseignant/saisie-notes", color: "bg-[#1dff2f]" },
    { icon: Layers, label: t('nav_classes'), href: "/enseignant/mes-classes", color: "bg-white" },
    { icon: BarChart2, label: t('nav_stats'), href: "/enseignant/statistiques", color: "bg-white" },
    { icon: FileText, label: t('reports'), href: "#", color: "bg-white" },
    { icon: Bell, label: t('alerts'), href: "#", color: "bg-white" },
    { icon: Settings, label: t('config'), href: "/enseignant/parametres", color: "bg-white" },
  ]

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-950 p-6 md:p-10 font-sans overflow-x-hidden transition-colors duration-500">
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* Immersive Hero Section — Grand Format & Visual Clarity */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative h-[700px] lg:h-[800px] rounded-[4rem] overflow-hidden group shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors bg-white dark:bg-slate-900"
        >
           {/* Background Image - High Impact Institution Style (Plus Claire) */}
           <div className="absolute inset-0">
             <img 
               src="/elite_faculty_bright.png" 
               alt="Elite Faculty Context" 
               className="w-full h-full object-cover opacity-100 transition-transform duration-[40s] group-hover:scale-110" 
             />
             {/* Unified Brighter Overlay (Matching Home) */}
             <div className="absolute inset-0 bg-gradient-to-tr from-white/95 dark:from-slate-950/95 via-white/40 dark:via-slate-950/40 to-transparent" />
             <div className="absolute inset-0 bg-white/5 dark:bg-slate-900/5 backdrop-blur-[1px]" />
           </div>

           <div className="absolute inset-0 p-12 lg:p-24 flex flex-col justify-end space-y-12">
              <div className="space-y-8 max-w-4xl">
                 <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-4 px-8 py-3 bg-slate-950 text-[#1dff2f] rounded-full shadow-neon font-black text-[12px] uppercase tracking-[0.5em] border border-[#1dff2f]/20"
                 >
                    <Sparkles className="w-6 h-6 text-[#1dff2f] animate-pulse" />
                    {t('faculty_space')} — ELITE V4.0
                 </motion.div>
                 
                 <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] text-shadow-premium">
                    {t('welcome')},<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-[#1dff2f]">
                       {session?.user?.name || 'Professeur'}.
                    </span>
                 </h1>
                 
                 <p className="text-slate-800 dark:text-slate-200 text-2xl font-bold max-w-2xl leading-relaxed italic opacity-95">
                    "{t('excellence_standard')}"
                 </p>
              </div>

              {/* Data Transparency Ticker */}
              <div className="flex items-center gap-12 md:gap-20 pt-6">
                 <div className="flex flex-col">
                    <span className="text-5xl font-black text-slate-950 dark:text-white tracking-tighter">{data?.stats?.totalEleves || 0}</span>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{t('total_students')}</span>
                 </div>
                 <div className="w-[1px] h-12 md:h-16 bg-slate-200 dark:bg-slate-800" />
                 <div className="flex flex-col">
                    <span className="text-5xl font-black text-[#1dff2f] drop-shadow-neon tracking-tighter">{data?.stats?.notesSaisies || 0}</span>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{t('registries')}</span>
                 </div>
                 <div className="w-[1px] h-12 md:h-16 bg-slate-200 dark:bg-slate-800" />
                 <div className="flex flex-col">
                    <span className="text-5xl font-black text-emerald-500 tracking-tighter uppercase tracking-[-0.05em]">Elite</span>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{t('live_system')}</span>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* New Quick Action Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
           {quickMenus.map((menu, i) => (
             <Link href={menu.href} key={i}>
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.05 }}
                   whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(29,255,47,0.15)" }}
                   className={`p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-4 transition-all group ${menu.color === 'bg-[#1dff2f]' ? 'bg-[#1dff2f] border-[#1dff2f]/20 shadow-neon' : 'bg-white dark:bg-slate-900 hover:border-[#1dff2f]/30'}`}
                >
                   <div className={`p-4 rounded-2xl ${menu.color === 'bg-[#1dff2f]' ? 'bg-black text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-[#1dff2f] group-hover:bg-[#1dff2f]/10 transition-colors'}`}>
                      <menu.icon className="w-6 h-6" />
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${menu.color === 'bg-[#1dff2f]' ? 'text-black' : 'text-slate-900 dark:text-slate-200'}`}>{menu.label}</span>
                </motion.div>
             </Link>
           ))}
        </div>

        {/* Global Performance Statistics */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[4rem] p-12 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden transition-colors"
         >
            <div className="absolute right-0 top-0 w-80 h-80 bg-[#1dff2f]/5 blur-[80px] rounded-full -mr-40 -mt-40" />
            
            <div className="flex justify-between items-end mb-12">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{t('global_performance')}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{t('stat_generated_realtime')}</p>
               </div>
               <div className="flex gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-full border border-slate-100 dark:border-slate-700">
                  <button className="px-8 py-2 bg-[#1dff2f] text-black text-[10px] font-black uppercase rounded-full shadow-sm">{t('real_time')}</button>
                  <button className="px-8 py-2 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all">{t('history')}</button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {[
                  { label: t('success_rate'), value: data?.stats?.tauxReussite || "88%", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
                  { label: t('promo_average'), value: data?.stats?.moyenneGenerale || "14.2", color: "text-[#1dff2f]", bg: "bg-[#1dff2f]/5" },
                  { label: t('completed_registries'), value: "92%", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
               ].map((stat, idx) => (
                  <div key={idx} className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 space-y-4 relative group hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xl transition-all">
                     <div className="flex justify-between items-center">
                        <span className={`text-2xl md:text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                           <TrendingUp className="w-5 h-5" />
                        </div>
                     </div>
                     <div>
                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{stat.label}</h4>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('consolidated_data')}</p>
                     </div>
                     {/* Progress Bar */}
                     <div className="pt-4">
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: String(stat.value).includes('%') ? String(stat.value) : '75%' }}
                              className={`h-full bg-[#1dff2f] rounded-full`}
                           />
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Analytics Visualizations */}
            <div className="mt-12">
               {data && <TeacherDashboardGraphs data={data} />}
            </div>
         </motion.div>

      </div>
    </div>
  )
}

export default TeacherDashboard
