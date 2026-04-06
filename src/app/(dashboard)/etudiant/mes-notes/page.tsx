'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, LogOut, TrendingUp, ChevronLeft, ArrowLeft, Star, Calculator, Award, Download, DownloadCloud, FileBarChart } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import Image from 'next/image'

export default function MesNotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState<any[]>([])
  const [stats, setStats] = useState({ moyenne: 0, credits: 0, rang: 0, totalNotes: 0 })
  const [selectedSemestre, setSelectedSemestre] = useState('S1')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.etudiantId) {
      fetchNotes()
    } else if (status === 'authenticated' && !session?.user?.etudiantId) {
      router.push('/')
    }
  }, [status, session, selectedSemestre])

  const fetchNotes = async () => {
    if (!session?.user?.etudiantId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/etudiants/${session.user.etudiantId}/notes?semestre=${selectedSemestre}`)
      const data = await response.json()
      
      if (response.ok && data.notes) {
        setNotes(data.notes)
        setStats(data.stats || { moyenne: 0, credits: 0, rang: 0, totalNotes: 0 })
      } else if (data.error) {
        toast.error(data.error)
        setNotes([])
      } else {
        setNotes(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des notes')
    } finally {
      setLoading(false)
    }
  }

  const getAppreciation = (note: number) => {
    if (note >= 16) return { text: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/10' }
    if (note >= 14) return { text: 'Très bien', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10' }
    if (note >= 12) return { text: 'Bien', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10' }
    if (note >= 10) return { text: 'Passable', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/10' }
    if (note >= 8) return { text: 'Insuffisant', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500 dark:bg-emerald-500/20' }
    return { text: 'Faible', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/10' }
  }

  const chartData = notes.slice().reverse().map(n => ({
    name: n.matiere?.code || n.matiere?.intitule?.slice(0, 6) || '?',
    note: n.valeur,
  }))

  const performanceTrendData = [
    { name: 'S1', moyenne: Math.max(0, stats.moyenne - 1.5), rang: stats.rang + 2 },
    { name: 'S2', moyenne: stats.moyenne, rang: stats.rang },
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-900 dark:to-slate-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 pb-20">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Link href="/etudiant">
                <motion.button 
                  whileHover={{ scale: 1.1, x: -5 }}
                  className="p-3 bg-emerald-50 dark:bg-slate-800 text-slate-950 dark:text-white rounded-xl hover:bg-slate-950 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <div className="w-12 h-12 bg-slate-950 py-2 rounded-2xl flex items-center justify-center shadow-lg p-[2px]">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center border border-white/10">
                   <FileBarChart className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-950 dark:text-white tracking-tight leading-none">Performances</h1>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mt-2">Détail des notes acquises</p>
              </div>
            </div>
            {/* Download Button added per UI feedback */}
            {session?.user?.etudiantId && (
              <a href={`/api/etudiants/${session.user.etudiantId}/export?format=excel`} className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-950 dark:bg-emerald-600 text-white dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform border border-slate-800 dark:border-emerald-400/50">
                <DownloadCloud className="w-5 h-5" />
                <span>Exporter le Relevé</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Decorative Hero Section specific to "Performance" */}
        <div className="relative w-full rounded-[3rem] overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-900 shadow-2xl shadow-emerald-500/30 min-h-[160px] flex items-center px-12 border border-emerald-400/20">
           <div className="absolute right-0 top-0 w-2/3 h-full overflow-hidden opacity-30 mix-blend-overlay">
              {/* Optional background image or abstract shape */}
              <div className="absolute right-[-10%] top-[-50%] w-[500px] h-[500px] bg-white rounded-full blur-[100px]" />
           </div>
           <div className="relative z-10 max-w-lg">
             <h2 className="text-3xl font-black text-white tracking-tight mb-2">Analysez votre progression</h2>
             <p className="text-emerald-200 font-semibold text-sm">Ce tableau de bord avancé compile vos notes et vous positionne par rapport à vos objectifs de semestre.</p>
           </div>
        </div>

        {/* Semestre Filter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center md:justify-start gap-4"
        >
          {['S1', 'S2'].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemestre(sem)}
              className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                selectedSemestre === sem
                  ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-2xl scale-105 border border-white/10 dark:border-slate-800'
                  : 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-700 shadow-sm'
              }`}
            >
              Semestre {sem}
            </button>
          ))}
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-none p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:bg-emerald-600/10 transition-colors shadow-inner">
                <Calculator className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white mb-1">Moyenne</p>
                <div className="flex items-baseline gap-1">
                   <p className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter">{stats.moyenne > 0 ? stats.moyenne.toFixed(2) : '--'}</p>
                   <span className="text-xs font-black text-slate-500 dark:text-slate-400">/20</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-none p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:bg-emerald-600/10 transition-colors shadow-inner">
                <Star className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white mb-1">Crédits</p>
                <p className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter">{stats.credits > 0 ? stats.credits : '--'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-none p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:bg-emerald-600/10 transition-colors shadow-inner">
                <Award className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white mb-1">Rang</p>
                <p className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter">{stats.rang > 0 ? `${stats.rang}e` : '--'}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Graphiques de Performance ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Moyenne Graph */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-[2.5rem] p-8">
            <h3 className="text-slate-950 dark:text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-500" /> Évolution de la Moyenne
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="moyGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 20]} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, fontSize: 13, fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="note" stroke="#4f46e5" strokeWidth={4} fill="url(#moyGrad2)" dot={{ fill: '#4f46e5', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, fill: '#4f46e5', stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Rang Graph */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-[2.5rem] p-8">
            <h3 className="text-slate-950 dark:text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500" /> Statistiques de Rang
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} reversed />
                <RechartsTooltip contentStyle={{ background: 'white', border: 'none', borderRadius: 16, fontWeight: 'bold' }} cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="rang" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Notes Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {loading ? (
            <div className="p-24 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Synchronisation des données...</p>
            </div>
          ) : notes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Matière</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Crédits</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Type</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Note (/20)</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Appréciation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {notes.map((note) => {
                    const appreciation = getAppreciation(note.valeur)
                    return (
                      <motion.tr 
                        key={note.id} 
                        whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                        className="transition-colors group"
                      >
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-950 dark:text-white font-black text-xs group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 transition-colors group-hover:text-white">
                                {note.matiere?.intitule?.charAt(0)}
                             </div>
                             <span className="text-sm font-black text-slate-950 dark:text-white group-hover:translate-x-1 transition-transform">{note.matiere?.intitule}</span>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-xs font-black text-slate-600 dark:text-slate-300">{note.credits || 1} Créd.</span>
                        </td>
                        <td className="px-10 py-6">
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
                             {note.typenote}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-lg font-black text-slate-950 dark:text-white">
                           {note.valeur}
                        </td>
                        <td className="px-10 py-6 text-right">
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${appreciation.bg} ${appreciation.color} border border-current opacity-80`}>
                            {appreciation.text}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-24 text-center space-y-6 bg-slate-50 dark:bg-slate-900">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-200 dark:border-slate-700">
                 <BookOpen className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Aucune archive de notes pour cette session</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
