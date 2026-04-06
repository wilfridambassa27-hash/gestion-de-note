'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart, LineChart, ResponsiveContainer, XAxis, YAxis, 
  Tooltip, Bar, Line, CartesianGrid, AreaChart, Area 
} from 'recharts'
import { 
  Users, TrendingUp, GraduationCap, FileCheck, 
  Zap, Calendar, Shield, Sparkles, LayoutDashboard 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const AdminStatsPage = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const stats = await response.json()
          setData(stats)
        } else {
          toast.error("Erreur de synchronisation des données")
        }
      } catch (error) {
        toast.error("Échec de connexion au serveur d'intelligence")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Sync Intelligence Académique...</p>
      </div>
    )
  }

  const kpis = [
    { label: 'Effectif Total', val: data?.kpis?.totalEtudiants || '0', color: 'text-slate-900', icon: Users, circleBg: 'bg-slate-100' },
    { label: 'Taux de Validation', val: `${data?.kpis?.tauxReussite || '0'}%`, color: 'text-emerald-500', icon: TrendingUp, circleBg: 'bg-emerald-50' },
    { label: 'Moyenne Générale', val: data?.kpis?.moyenneGenerale || '0', color: 'text-blue-500', icon: GraduationCap, circleBg: 'bg-blue-50' },
    { label: 'QR Scannés Actifs', val: data?.kpis?.qrActifs || '0', color: 'text-purple-500', icon: FileCheck, circleBg: 'bg-purple-50' }
  ]

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto font-[Outfit]">
      {/* Header Statistique Elite */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
             <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-neon-elite">
                <LayoutDashboard className="w-6 h-6 text-[#1dff2f]" />
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
               Intelligence <span className="text-emerald-500">Académique.</span>
             </h1>
          </motion.div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Pilotez la performance globale de l'Elite Faculty.</p>
        </div>
        
        <div className="bg-white p-2.5 rounded-[2rem] shadow-xl border border-slate-100 flex gap-2">
           <button className="px-6 py-3 bg-slate-950 text-[#1dff2f] rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-neon-soft transition-all">Semestre 1</button>
           <button className="px-6 py-3 text-slate-400 hover:text-slate-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all">Semestre 2</button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-100 border border-slate-50 hover:border-emerald-200 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-50 transition-colors" />
            <div className={`w-14 h-14 ${kpi.circleBg} rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform relative z-10`}>
               <kpi.icon className="w-7 h-7 text-current" />
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{kpi.label}</p>
               <p className={`text-4xl font-black ${kpi.color} tracking-tighter`}>{kpi.val}</p>
               <div className="mt-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Live Data Sync</span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Line Chart: Evolution / Moyenne */}
        <motion.div 
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
           className="bg-white p-10 rounded-[4rem] border border-slate-50 shadow-2xl relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-10">
             <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Trajectoire Académique</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Évolution mensuelle des performances</p>
             </div>
             <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">Real-time update</span>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dataPerformance}>
                <defs>
                   <linearGradient id="colorMoy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#cbd5e1'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#cbd5e1'}} dx={-10} domain={[0, 20]} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}}
                  labelStyle={{fontWeight: 900, fontSize: '12px', color: '#0f172a', marginBottom: '8px'}}
                />
                <Area type="monotone" dataKey="moyenne" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorMoy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart: Success by Filiale/Filière */}
        <motion.div 
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           className="bg-white p-10 rounded-[4rem] border border-slate-50 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-10">
             <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Réussite par Filière</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Taux de validation (%) par département</p>
             </div>
             <Shield className="w-6 h-6 text-slate-100" />
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.dataFiliere}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="f" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#cbd5e1'}} dx={-10} domain={[0, 100]} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                <Bar 
                  dataKey="val" 
                  radius={[12, 12, 12, 12]} 
                  barSize={45}
                >
                  {data?.dataFiliere.map((entry: any, index: number) => (
                    <motion.rect key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#0f172a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Live Rétrographie Journal Elite */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-950 rounded-[4rem] p-12 text-white shadow-3xl shadow-slate-950/20 relative overflow-hidden"
      >
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full -mb-48 -mr-48" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 relative z-10">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-black uppercase tracking-widest text-[#1dff2f]">Journal de Rétrographie Élite</h3>
             </div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-9">Certification cryptographique en temps réel</p>
          </div>
          <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-full transition-all border border-white/5">
             Voir tout le registre des scellages
          </button>
        </div>

        <div className="space-y-6 relative z-10">
          {data?.logsBulletins?.length > 0 ? data.logsBulletins.map((log: any, i: number) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col md:flex-row justify-between md:items-center p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/[0.08] transition-all group"
            >
              <div className="flex gap-6 items-center flex-1">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500 transition-colors">
                   <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black tracking-tight text-white group-hover:text-[#1dff2f] transition-colors">
                    Relevé Certifié - {log.ref}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Porteur : <span className="text-white italic">{log.name}</span>
                  </p>
                  <p className="text-[8px] text-emerald-500/60 font-medium uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {format(new Date(log.date), 'dd MMMM yyyy HH:mm', { locale: fr })} • Vérifié via Blockchain Elite
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
                 <div className="px-5 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                    <span className="text-emerald-400 font-black text-[9px] tracking-[0.3em] uppercase">{log.status}</span>
                 </div>
                 <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Scellage Définitif</span>
              </div>
            </motion.div>
          )) : (
            <div className="p-20 text-center space-y-4 bg-white/5 rounded-[3rem] border border-white/5">
                <Zap className="w-10 h-10 text-slate-800 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 italic">En attente de nouvelles certifications rétrographiques...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminStatsPage
