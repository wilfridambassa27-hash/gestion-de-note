'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Plus, Search, ChevronLeft, ChevronRight, Menu, LogOut, Sun, Moon, Home, Building2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { PremiumSearch, PremiumRefresh } from '@/components/PremiumUI'

const sidebarItems = [
  { title: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/admin' },
  { title: 'Annee academique', icon: <Calendar className="w-5 h-5" />, href: '/admin/annee-academique' },
  { title: 'Semestres', icon: <Calendar className="w-5 h-5" />, href: '/admin/semestres' },
  { title: 'Emplois du temps', icon: <Calendar className="w-5 h-5" />, href: '/admin/emploi-temps' },
  { title: 'Absences', icon: <AlertTriangle className="w-5 h-5" />, href: '/admin/absences' },
  { title: 'Retards', icon: <Calendar className="w-5 h-5" />, href: '/admin/retards' },
  { title: 'Sanctions', icon: <AlertTriangle className="w-5 h-5" />, href: '/admin/sanctions' },
  { title: 'Recrutement', icon: <Plus className="w-5 h-5" />, href: '/admin/recrutement' },
{ title: 'Activites', icon: <Calendar className="w-5 h-5" />, href: '/admin/activites' },
  { title: 'Statistiques', icon: <Calendar className="w-5 h-5" />, href: '/admin/statistiques' },
  { title: 'Parametres', icon: <Calendar className="w-5 h-5" />, href: '/admin/parametres' },
]

export default function SanctionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { 
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') router.push('/')
  }, [status, session, router])

  useEffect(() => { 
    if (darkMode) document.documentElement.classList.add('dark'); 
    else document.documentElement.classList.remove('dark') 
  }, [darkMode])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      setLoading(false)
    }
  }, [status, session])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100'}`}>

      <motion.main 
        className="flex-1 min-h-screen"
      >

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Gestion des Sanctions
              </h1>
              <p className={darkMode ? 'text-slate-400' : 'text-slate-500 font-bold uppercase tracking-widest text-[10px]'}>
                Suivi des sanctions disciplinaires
              </p>
            </div>
            <div className="flex items-center gap-4">
              <PremiumRefresh onClick={() => {}} refreshing={false} label="Actualiser" />
              <motion.button 
                whileHover={{ scale: 1.05}}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-full shadow-lg hover:shadow-2xl shadow-slate-900/40 transition-all"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Sanction
              </motion.button>
            </div>
          </div>

          <div className={`rounded-[2.5rem] shadow-lg border p-4 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-xl border-gray-100'}`}>
            <PremiumSearch 
              placeholder="Rechercher une sanction..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
              darkMode={darkMode}
            />
          </div>

          <div className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Eleve</th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type</th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date</th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Motif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr>
                    <td colSpan={4} className={`px-4 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Aucune sanction enregistree
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  )
}
