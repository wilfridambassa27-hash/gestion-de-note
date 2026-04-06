// ============================================================
// TeacherDashboardGraphs.tsx — Visualisations Analytiques
// Affiche deux graphiques recharts sur le tableau de bord :
//   1. Courbe de tendance mensuelle des saisies de notes
//   2. Histogramme comparatif des moyennes par classe
// ============================================================

'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { motion } from 'framer-motion'
import { useUI } from '@/context/UIContext'

interface GraphData {
  topClasses?: Array<{ nom: string; avg_note: string | number }>
  notesByMonth?: Array<{ month: string; count: number }>
}

interface GraphsProps {
  data: GraphData
}

// ── Palette de couleurs pour les barres/segments du graphique ──
const COLORS = ['#1dff2f', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']

const TeacherDashboardGraphs = ({ data }: GraphsProps) => {
  const { t } = useUI()

  if (!data) return null

  // ── Distribution factice des tranches de notes (en attendant les données réelles de l'API) ──
  const distributionData = [
    { range: '0-5', count: 2, color: '#f43f5e' },
    { range: '5-10', count: 8, color: '#fbbf24' },
    { range: '10-15', count: 25, color: '#3b82f6' },
    { range: '15-20', count: 12, color: '#1dff2f' },
  ]

  // ── Préparation des données pour la comparaison des classes (BarChart) ──
  const classComparisonData = data.topClasses?.map((c) => ({
    name: c.nom,
    value: parseFloat(String(c.avg_note || 0)).toFixed(1)
  })) || []

  // ── Préparation de la tendance mensuelle des saisies (AreaChart) ──
  const monthlyData = data.notesByMonth?.map((m) => ({
    name: m.month,
    registres: m.count
  })) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Performance Trend (Line/Area Chart) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t('stat_trajectory')}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('stat_generated_realtime')}</p>
          </div>
          <div className="w-10 h-10 bg-[#1dff2f]/10 rounded-xl flex items-center justify-center">
            <div className="w-2 h-2 bg-[#1dff2f] rounded-full animate-pulse" />
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData.length > 0 ? monthlyData : [{name: 'Jan', registres: 10}, {name: 'Feb', registres: 25}, {name: 'Mar', registres: 15}]}>
              <defs>
                <linearGradient id="colorRegistres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1dff2f" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1dff2f" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  backgroundColor: '#0f172a',
                  color: '#fff'
                }}
                itemStyle={{ color: '#1dff2f', fontWeight: 900 }}
              />
              <Area 
                type="monotone" 
                dataKey="registres" 
                stroke="#1dff2f" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorRegistres)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Class Comparison (Bar Chart) */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t('stat_distribution')}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moyennes par promotion</p>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classComparisonData.length > 0 ? classComparisonData : [{name: 'TC', value: 14}, {name: 'L1', value: 12}]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                domain={[0, 20]}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  backgroundColor: '#0f172a',
                  color: '#fff'
                }}
                itemStyle={{ color: '#1dff2f', fontWeight: 900 }}
              />
              <Bar 
                dataKey="value" 
                radius={[10, 10, 0, 0]} 
                barSize={40}
              >
                {classComparisonData.map((_, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  )
}

export default TeacherDashboardGraphs
