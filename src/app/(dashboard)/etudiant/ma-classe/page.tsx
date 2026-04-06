'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  Users, 
  BarChart3, 
  QrCode, 
  Loader2, 
  GraduationCap, 
  Award, 
  TrendingUp, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Calendar,
  Search,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart as ReBarChart, Bar, CartesianGrid,
  RadialBarChart, RadialBar, Legend, Cell,
  PieChart, Pie
} from 'recharts'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { useUI } from '@/context/UIContext'
import { useSession } from 'next-auth/react'

interface ClassData {
  id: string
  nom: string
  filiere?: string
  anneeacademique?: string
}

interface Classmate {
  id: string
  nom: string
  prenom: string
  matricule: string
}

interface StudentStats {
  matricule?: string
  creditsObtenus?: number
  creditsTotal?: number
  classe?: ClassData
  notes?: Array<{
    valeur: number
    matiere: {
      code: string
    }
  }>
}

// ─── Constants & Styles ──────────────────────────────
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']

// ─── Components ──────────────────────────────────────

export default function MaClassePortal() {
  const router = useRouter()
  const { data: session } = useSession()
  const { t } = useUI()
  const [activeTab, setActiveTab] = useState<'qr' | 'students' | 'stats'>('qr')
  const [loading, setLoading] = useState(true)
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [classmates, setClassmates] = useState<Classmate[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isScanned, setIsScanned] = useState(false)
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null)

  useEffect(() => {
    const isVerified = sessionStorage.getItem('edunotes_class_verified') === 'true'
    if (!isVerified) {
      router.push('/etudiant/verification')
      return
    }
    fetchInitialData()
  }, [router])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      // Parallel fetching for performance
      const [resDash, resClass] = await Promise.all([
        fetch('/api/etudiant/dashboard'),
        fetch('/api/etudiant/ma-classe')
      ])
      
      if (resDash.ok) {
        const dashData = await resDash.json()
        setStudentStats(dashData)
        setClassData(dashData.classe)
      }
      
      if (resClass.ok) {
        const classListData = await resClass.json()
        setClassmates(classListData)
      }
    } catch (e) {
      toast.error('Erreur lors du chargement des données.')
    } finally {
      setLoading(false)
    }
  }

  // ── QR Certification Logic ─────────────────────────
  const generateQRCode = async () => {
    setLoading(true)
    try {
      const startTime = Date.now()
      const res = await fetch(`/api/etudiants/${session?.user?.id}/qrcode?t=${Date.now()}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        setQrCodeUrl(url)
        console.log(`QR Generated in ${(Date.now() - startTime) / 1000}s`)
        toast.success('QR Code Officiel Généré !')
      }
    } catch (error) {
      toast.error('Erreur technique lors de la génération.')
    } finally {
      setLoading(false)
    }
  }

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (qrCodeUrl && qrCodeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(qrCodeUrl)
      }
    }
  }, [qrCodeUrl])

  // ── Stat Data Prep ──────────────────────────────
  const radarData = studentStats?.notes?.reduce((acc: Array<{ subject: string; score: number; fullMark: number }>, n) => {
    const code = n.matiere?.code?.slice(0, 6) || '?'
    const existing = acc.find(a => a.subject === code)
    if (!existing) acc.push({ subject: code, score: n.valeur, fullMark: 20 })
    return acc
  }, []).slice(0, 6) || [
    { subject: 'MATH', score: 14, fullMark: 20 },
    { subject: 'INFO', score: 18, fullMark: 20 },
    { subject: 'DROIT', score: 12, fullMark: 20 },
    { subject: 'PROG', score: 16, fullMark: 20 },
    { subject: 'ENG', score: 15, fullMark: 20 },
  ]

  const growthData = [
    { period: 'Sem 1', average: 12.5, benchmark: 11.2 },
    { period: 'Exam 1', average: 14.8, benchmark: 12.0 },
    { period: 'Sem 2', average: 13.5, benchmark: 11.5 },
    { period: 'Final', average: 15.2, benchmark: 12.5 },
  ]

  const radialData = [
    { name: 'Crédits Acquis', value: studentStats?.creditsObtenus || 0, fill: '#6366f1' },
    { name: 'Total Exigé', value: studentStats?.creditsTotal || 30, fill: '#10b981' }
  ]

  // ── Render ────────────────────────────────────────

  if (loading && !classData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 className="w-16 h-16 text-emerald-600" />
        </motion.div>
        <p className="mt-4 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Chargement du portail classe...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative">
      <Toaster position="top-right" />

      {/* Premium Decorative Background Pattern */}
      <div className="absolute top-0 right-0 w-full h-[600px] pointer-events-none opacity-[0.03] overflow-hidden -z-10">
         <img src="https://www.transparenttextures.com/patterns/cubes.png" alt="" className="w-full h-full object-repeat" />
      </div>

      {/* ── Portal Header ── */}
      <div className="relative group bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col lg:flex-row lg:items-end justify-between gap-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 blur-[100px] rounded-full -mr-48 -mt-48 transition-transform group-hover:scale-110" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
           <div className="w-32 h-32 bg-slate-950 rounded-[2.5rem] flex items-center justify-center shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
              <img 
                 src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop" 
                 alt="Tech" 
                 className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <GraduationCap className="w-12 h-12 text-[#1dff2f]" />
              </div>
           </div>
           
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-neon" />
                 <span className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px]">Certification Académique Active</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                {classData?.nom || 'Votre Classe'} <span className="text-[#1dff2f]">.</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[11px] flex items-center gap-3">
                {classData?.filiere} <span className="w-1.5 h-1.5 rounded-full bg-slate-200" /> {classData?.anneeacademique} <Sparkles className="w-4 h-4 text-amber-500" />
              </p>
           </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
          {[
            { id: 'qr', label: t('certification'), icon: ShieldCheck },
            { id: 'students', label: t('classmates'), icon: Users },
            { id: 'stats', label: t('analyses'), icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <AnimatePresence mode="wait">
        
        {/* ── Tab: Certification (QR) ── */}
        {activeTab === 'qr' && (
          <motion.div
            key="certification"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
             {/* Main QR Card */}
             <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[100px] rounded-full -mr-60 -mt-60" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-14">
                   <div className="flex-1 space-y-8">
                      <div className="space-y-4">
                         <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                           <Lock className="w-3.5 h-3.5" /> {t('security')}
                         </div>
                         <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter">{t('generate_secure_access')}</h2>
                         <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed max-w-sm uppercase tracking-widest text-[10px]">
                           {t('official_registry')}
                         </p>
                      </div>

                      {!qrCodeUrl ? (
                        <button 
                          onClick={generateQRCode}
                          className="px-10 py-6 bg-slate-950 dark:bg-slate-800 text-white dark:text-[#1dff2f] rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 group"
                        >
                          GÉNÉRER MON QR CODE OFFICIEL
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <div className="space-y-6">
                           <div className="flex flex-col sm:flex-row gap-4">
                              <div className="px-10 py-6 bg-slate-900 text-[#1dff2f] rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl border border-[#1dff2f]/20 flex items-center justify-center gap-4 cursor-default">
                                <Zap className="w-5 h-5 animate-pulse" />
                                SCANNEZ AVEC VOTRE MOBILE
                              </div>
                              <button 
                                onClick={() => setQrCodeUrl(null)}
                                className="px-8 py-5 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 active:scale-95 transition-all"
                              >
                                ANNULER & RE-GÉNÉRER
                              </button>
                           </div>
                           <div className="flex items-center gap-2 text-emerald-500">
                             <CheckCircle2 className="w-4 h-4" />
                             <p className="text-[9px] font-black uppercase tracking-[0.2em]">Votre relevé est prêt pour accès instantané.</p>
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="w-64 h-64 shrink-0">
                      {qrCodeUrl ? (
                        <motion.div 
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="p-6 bg-white rounded-[3rem] shadow-2xl shadow-emerald-500/20 border-8 border-slate-50"
                        >
                          <img src={qrCodeUrl} alt="QR Access" className="w-full h-full object-contain mix-blend-multiply" />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-[3.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 text-slate-300">
                          <QrCode className="w-16 h-16 opacity-30" />
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Aucun code actif</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Side Info Cards */}
             <div className="lg:col-span-4 space-y-6">
                <div className="p-8 bg-emerald-600 text-white rounded-[2.5rem] shadow-xl shadow-emerald-600/20 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                         <Info className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-[11px] uppercase tracking-widest">Protocoles de sécurité</h4>
                   </div>
                   <p className="text-[13px] font-bold leading-relaxed text-emerald-100 uppercase tracking-wide">
                     {t('security_protocol_desc')}
                   </p>
                </div>

                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-lg flex flex-col justify-between h-[200px]">
                   <div className="flex items-center justify-between">
                      <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">{t('identity_status')}</h4>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                   </div>
                   <div>
                      <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter">{studentStats?.matricule}</p>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">{t('verified_blockchain')}</p>
                   </div>
                   <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white dark:border-slate-800" />
                      ))}
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">
                        +24
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* ── Tab: Camarades (Students) ── */}
        {activeTab === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
             <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                <div>
                   <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tighter">{t('class_directory')}</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{t('official_registry')}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest" />
                   </div>
                   <div className="px-5 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20">
                     {classmates.length} inscrits
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {classmates.map((stud, idx) => (
                  <motion.div 
                    key={stud.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.2rem] shadow-md hover:shadow-2xl transition-all group hover:border-emerald-300 dark:hover:border-emerald-500/30"
                  >
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-950 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 font-black text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                          {stud.nom.charAt(0)}{stud.prenom.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-black text-sm text-slate-950 dark:text-white truncate uppercase tracking-tight">{stud.nom}</h4>
                           <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">{stud.prenom}</p>
                           <div className="inline-block mt-3 px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-slate-100 dark:border-slate-700">
                             {stud.matricule}
                           </div>
                        </div>
                     </div>
                  </motion.div>
                ))}
             </div>
          </motion.div>
        )}

        {/* ── Tab: Analyses (Stats) ── */}
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
             {/* Main Evolutionary Chart */}
             <div className="lg:col-span-8 space-y-8">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
                   <div className="absolute top-10 right-10 flex gap-2">
                       <div className="px-3 py-1 text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">Progression</div>
                   </div>
                   <div className="mb-10">
                      <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tighter flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-emerald-600" /> {t('performance_trajectory')}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{t('comparison_promo_avg')}</p>
                   </div>
                   
                   <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={growthData}>
                            <defs>
                               <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                            <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                            <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)' }} />
                            <Area type="monotone" dataKey="average" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAvg)" />
                            <Area type="monotone" dataKey="benchmark" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Radial Bar Chart for Credits */}
                   <div className="bg-slate-950 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group flex flex-col items-center">
                      <div className="absolute top-0 left-0 p-10">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">{t('lmd_credits')}</h4>
                      </div>
                      <div className="h-[240px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" barSize={15} data={radialData}>
                               <RadialBar
                                 background
                                 dataKey="value"
                                 cornerRadius={20}
                               />
                               <Tooltip />
                            </RadialBarChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="text-center">
                         <p className="text-5xl font-black text-white tracking-tighter">{studentStats?.creditsObtenus || 0}</p>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">{t('credits_validated')}</p>
                      </div>
                   </div>

                   {/* Distribution Pie */}
                   <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
                      <div className="mb-4">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950 dark:text-white">{t('mentions_distribution')}</h4>
                      </div>
                      <div className="h-[180px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie data={[{value: 30}, {value: 45}, {value: 25}]} innerRadius={40} outerRadius={70} paddingAngle={8} dataKey="value">
                                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                               </Pie>
                               <Tooltip />
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-slate-400">{t('excellent')}</span>
                            <span className="text-xs font-black text-emerald-500">30%</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-slate-400">{t('good')}</span>
                            <span className="text-xs font-black text-amber-500">45%</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Radar Profile */}
             <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] p-10 shadow-xl flex flex-col items-center">
                <div className="text-center mb-10">
                   <Award className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                   <h3 className="text-lg font-black text-slate-950 dark:text-white tracking-tighter capitalize">{t('skills_profile')}</h3>
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">{t('multidimensional_analysis')}</p>
                </div>
                
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                         <PolarGrid stroke="#f1f5f9" />
                         <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 10, fontWeight: 900}} />
                         <PolarRadiusAxis domain={[0, 20]} tick={false} axisLine={false} />
                         <Radar name="Notes" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={4} dot={{r: 4, fill: '#6366f1'}} />
                         <Tooltip />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>

                <div className="mt-10 w-full p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                   <div className="flex items-center gap-4 mb-4">
                      <Sparkles className="w-6 h-6 text-amber-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">{t('academic_insight')}</h4>
                   </div>
                   <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 leading-none uppercase tracking-wide">
                     Points forts détectés en <span className="text-emerald-600">Sciences Appliquées</span>. Potentiel de major de promo confirmé.
                   </p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
