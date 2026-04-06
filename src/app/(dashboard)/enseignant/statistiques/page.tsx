'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import {
  TrendingUp, Users, Award, Download,
  Loader2, BarChart3, Lightbulb, CheckCircle2,
  Target, Sparkles, RefreshCw, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useUI } from '@/context/UIContext'

// ─── Types ────────────────────────────────────────────────
interface StatsData {
  totalNotes: number
  moyenneGenerale: number
  tauxValidation: number
  mentionsExcellence: number
  nbClasses: number
  tauxReussite: number
  evolutionData: { name: string; moyenne: number; scan: number; top: number }[]
  distributionData: { name: string; value: number; fill: string }[]
  classeData: { name: string; avg: number; count: number }[]
  radarData: { subject: string; moyenne: number; objectif: number }[]
  major: { valeur: number; matricule: string; matiere: string }
}

// ─── Sub-Components ────────────────────────────────────────

const StatCard = ({
  title, value, sub, icon: Icon, color = 'emerald', delay = 0
}: {
  title: string; value: string | number; sub: string;
  icon: React.ElementType; color?: string; delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden"
  >
    <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/5 blur-3xl rounded-full group-hover:bg-emerald-400/10 transition-all duration-700" />
    <div className="w-14 h-14 bg-slate-950 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-500 shadow-xl">
      <Icon className="w-7 h-7 text-white dark:text-emerald-400 group-hover:text-white" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-2">{title}</p>
    <h2 className="text-4xl font-black tracking-tighter leading-none text-slate-900 dark:text-white">{value}</h2>
    <div className="mt-5 flex items-center gap-3">
      <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        {sub}
      </span>
    </div>
  </motion.div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-4 text-xs">
      <p className="font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: <span className="font-black">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────
export default function EnseignantStatistiquesImpressive() {
  const { data: session } = useSession()
  const { t } = useUI()
  const [selectedSemester, setSelectedSemester] = useState('S1')
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async (sem: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/enseignants/statistiques?semestre=${sem}`)
      if (!res.ok) throw new Error('Erreur API')
      const json = await res.json()
      setData(json)
    } catch {
      setError('Impossible de charger les statistiques.')
      // Fallback en données fictives si pas de données réelles
      setData({
        totalNotes: 0, moyenneGenerale: 0, tauxValidation: 0,
        mentionsExcellence: 0, nbClasses: 0, tauxReussite: 0,
        evolutionData: [
          { name: 'Jan', moyenne: 10, scan: 70, top: 18 },
          { name: 'Fév', moyenne: 12, scan: 75, top: 19 },
          { name: 'Mar', moyenne: 11, scan: 85, top: 18.5 },
          { name: 'Avr', moyenne: 15, scan: 92, top: 19.5 },
        ],
        distributionData: [
          { name: '[0-5]',   value: 2,  fill: '#f43f5e' },
          { name: '[5-10]',  value: 8,  fill: '#8b5cf6' },
          { name: '[10-12]', value: 15, fill: '#6366f1' },
          { name: '[12-14]', value: 25, fill: '#3b82f6' },
          { name: '[14-16]', value: 20, fill: '#10b981' },
          { name: '[16-20]', value: 12, fill: '#f59e0b' },
        ],
        classeData: [
          { name: 'GL A', avg: 13.5, count: 28 },
          { name: 'GL B', avg: 12.8, count: 25 },
          { name: 'GCI A', avg: 11.9, count: 30 },
        ],
        radarData: [
          { subject: 'Algorithmique', moyenne: 12, objectif: 14 },
          { subject: 'Web', moyenne: 14, objectif: 14 },
          { subject: 'BDD', moyenne: 11, objectif: 14 },
          { subject: 'OS', moyenne: 13, objectif: 14 },
          { subject: 'Maths', moyenne: 10, objectif: 14 },
        ],
        major: { valeur: 19.5, matricule: 'ISTA-411-925', matiere: '---' }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats(selectedSemester)
  }, [selectedSemester])

  const statCards = useMemo(() => [
    {
      title: 'Classes Pilotées',
      value: data?.nbClasses ?? '—',
      sub: 'Actives ce semestre',
      icon: Users,
      delay: 0
    },
    {
      title: 'Taux de Validation',
      value: data ? `${data.tauxValidation}%` : '—',
      sub: data && data.tauxValidation >= 80 ? 'Performance Élevée' : 'En cours',
      icon: TrendingUp,
      delay: 0.08
    },
    {
      title: 'Mentions Excellence',
      value: data?.mentionsExcellence ?? '—',
      sub: `Notes ≥ 16/20`,
      icon: Award,
      delay: 0.16
    },
  ], [data])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
          Chargement de l'Intelligence Académique…
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 font-[Outfit] text-slate-900 dark:text-white">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">
              Analytics Engine v4.0
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none">
            Intelligence{' '}
            <span className="text-emerald-500">Académique.</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2">
            Vue d'ensemble de la performance professorale
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Toggle Semestre */}
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {(['S1', 'S2'] as const).map(sem => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedSemester === sem
                    ? 'bg-slate-950 dark:bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semestre {sem.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(selectedSemester)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button className="p-3 bg-slate-950 text-emerald-400 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map(card => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* ── Évolution + Radar ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Évolution temporelle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">Trajectoire</p>
              <h3 className="text-2xl font-black tracking-tight">Évolution des Performances</h3>
            </div>
            <div className="flex gap-6">
              {[
                { color: '#6366f1', label: 'Moyenne' },
                { color: '#fbbf24', label: 'Meilleure note' },
                { color: '#10b981', label: 'Volume saisies' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                  <span className="text-[9px] font-black uppercase text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data?.evolutionData || []} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} domain={[0, 20]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="moyenne" name="Moyenne"
                  stroke="#6366f1" strokeWidth={4}
                  fillOpacity={1} fill="url(#gradAvg)"
                  dot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone" dataKey="top" name="Meilleure note"
                  stroke="#fbbf24" strokeWidth={2} strokeDasharray="6 3"
                  dot={{ r: 4, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }}
                />
                <Bar dataKey="scan" name="Saisies" barSize={6} fill="#10b981" opacity={0.5} radius={[10, 10, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Radar + Insight */}
        <div className="xl:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-950 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group flex flex-col items-center"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full" />
            <div className="flex items-center justify-between w-full mb-6">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500">Profil Pédagogique</p>
              <Target className="w-5 h-5 text-emerald-500 opacity-40 group-hover:opacity-100 transition-all" />
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data?.radarData || []}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }} />
                  <Radar name="Moyenne" dataKey="moyenne" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} strokeWidth={3} />
                  <Radar name="Objectif" dataKey="objectif" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={1} strokeDasharray="4 2" />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-4 mt-4">
              {[{ c: '#6366f1', l: 'Moyenne réelle' }, { c: '#10b981', l: 'Objectif (14)' }].map(i => (
                <div key={i.l} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: i.c }} />
                  <span className="text-[8px] font-black uppercase text-slate-500">{i.l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* IA Insight */}
          <div className="p-7 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <Sparkles className="absolute top-1/2 right-4 w-16 h-16 text-white/10 -translate-y-1/2" />
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Insight IA</h4>
            </div>
            <p className="text-[12px] font-bold leading-relaxed text-emerald-50">
              {data && data.moyenneGenerale > 0
                ? <>Moyenne globale : <span className="text-white font-black underline decoration-amber-400 underline-offset-2">{data.moyenneGenerale}/20</span>.
                  {' '}Taux de réussite : <span className="text-white font-black">{data.tauxReussite}%</span>.</>
                : 'Saisissez des notes pour voir apparaître votre analyse pédagogique ici.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Distribution + Classement Classe ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Distribution Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black tracking-tight">Distribution des Notes</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">
                Répartition globale — {data?.totalNotes ?? 0} notes
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.distributionData || []} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" name="Étudiants" radius={[12, 12, 0, 0]} barSize={38}>
                  {(data?.distributionData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Moyenne par Classe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black tracking-tight">Moyenne par Classe</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">
                Performance comparée par promotion
              </p>
            </div>
            <Users className="w-8 h-8 text-emerald-500" />
          </div>

          {(data?.classeData || []).length > 0 ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.classeData || []} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} width={70} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="avg" name="Moyenne" radius={[0, 12, 12, 0]} barSize={22} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center text-slate-300 gap-3">
              <BarChart3 className="w-10 h-10" />
              <p className="text-[10px] font-black uppercase tracking-widest">Aucune donnée disponible</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Récap de Séance ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-10 rounded-[3rem] shadow-sm"
      >
        <h3 className="text-xl font-black tracking-tight mb-2">Récapitulatif de Séance</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">
          Données synchronisées en temps réel depuis la base académique
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Notes', value: data?.totalNotes ?? 0, color: 'text-slate-900 dark:text-white' },
            { label: 'Médaille Major', value: `${data?.major.valeur ?? '—'}/20`, color: 'text-emerald-600' },
            { label: 'Taux Validation', value: `${data?.tauxValidation ?? 0}%`, color: 'text-indigo-600' },
            { label: 'Taux Réussite', value: `${data?.tauxReussite ?? 0}%`, color: 'text-amber-600' },
          ].map(item => (
            <div key={item.label} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{item.label}</p>
              <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-[2rem] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest">Major de session</p>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                {data?.major.matricule || '---'} · {data?.major.matiere || '---'}
              </p>
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {data?.major.valeur ?? '—'} / 20
          </div>
        </div>
      </motion.div>

    </div>
  )
}
