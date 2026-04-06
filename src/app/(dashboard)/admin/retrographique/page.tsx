'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, Download, Printer, Users, BookOpen, Award, TrendingUp, TrendingDown, 
  Search, Filter, RefreshCw, Save, Eye, Calendar, ChevronDown, ChevronUp,
  Calculator, GraduationCap, User, CheckCircle, AlertCircle, Image,
  ChevronLeft, ChevronRight, Menu, LogOut, Bell, Sun, Moon, Home, Building2,
  BarChart3, Settings
} from 'lucide-react'
import Link from 'next/link'
import ReleveNotesModal from './ReleveNotesModal'
import { signOut } from 'next-auth/react'
import { PremiumSearch, PremiumRefresh } from '@/components/PremiumUI'

interface EtudiantData {
  id: string
  nom: string
  prenom: string
  email?: string
  classe?: string
  moyenne: number
  rang: number
  notes: { matiere: string; valeur: number; credits: number; semestre: string }[]
}

interface ClasseData {
  id: string
  nom: string
  niveau: string
  filiere: string
  effectif: number
  matieres?: { id: string; nom: string; credits: number }[]
}

interface ClassStats {
  id: string
  nom: string
  niveau: string
  filiere: string
  effectif: number
  moyenneGenerale: number
  moyenneHaute: number
  moyenneBasse: number
  eleves: EtudiantData[]
}

const sidebarItems = [
  { title: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/admin' },
  { title: 'Utilisateurs', icon: <Users className="w-5 h-5" />, href: '/admin/utilisateurs' },
  { title: 'Classes', icon: <Building2 className="w-5 h-5" />, href: '/admin/classes' },
  { title: 'Matières', icon: <BookOpen className="w-5 h-5" />, href: '/admin/matieres' },
  { title: 'Notes', icon: <FileText className="w-5 h-5" />, href: '/admin/notes' },
  { title: 'Bulletins', icon: <FileText className="w-5 h-5" />, href: '/admin/bulletins' },
  { title: 'Statistiques', icon: <BarChart3 className="w-5 h-5" />, href: '/admin/retrographique' },
  { title: 'Paramètres', icon: <Settings className="w-5 h-5" />, href: '/admin/parametres' },
]

export default function RetrographiquePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [selectedClasse, setSelectedClasse] = useState<string>('all')
  const [selectedSemestre, setSelectedSemestre] = useState<string>('S1')
  const [searchTerm, setSearchTerm] = useState('')
  const [showBulletin, setShowBulletin] = useState<EtudiantData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const bulletinRef = useRef<HTMLDivElement>(null)

  const [classes, setClasses] = useState<ClasseData[]>([])
  const [selectedClassData, setSelectedClassData] = useState<ClassStats | null>(null)

  useEffect(() => { 
    if (status === 'unauthenticated') router.push('/login') 
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchClasses()
      fetchNotifications()
    }
  }, [status])

  useEffect(() => {
    if (selectedClasse && selectedClasse !== 'all') {
      fetchClassData(selectedClasse)
    }
  }, [selectedClasse, selectedSemestre])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/retrographique')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClassData = async (classeId: string) => {
    setRefreshing(true)
    try {
      const response = await fetch(`/api/retrographique?classeId=${classeId}&semestre=${selectedSemestre}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedClassData({
          id: data.classe?.id || classeId,
          nom: data.classe?.nom || '',
          niveau: data.classe?.niveau || '',
          filiere: data.classe?.filiere || '',
          effectif: data.stats?.effectif || 0,
          moyenneGenerale: data.stats?.moyenneGenerale || 0,
          moyenneHaute: data.stats?.moyenneHaute || 0,
          moyenneBasse: data.stats?.moyenneBasse || 0,
          eleves: data.eleves || []
        })
      }
    } catch (error) {
      console.error('Error fetching class data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const calculateMoyenne = (notes: { matiere: string; valeur: number; credits: number }[]) => {
    if (notes.length === 0) return 0
    const totalCredits = notes.reduce((sum, n) => sum + n.credits, 0)
    const totalPoints = notes.reduce((sum, n) => sum + (n.valeur * n.credits), 0)
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00'
  }

  const filteredEleves = selectedClassData?.eleves.filter(e => 
    searchTerm === '' || 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.moyenne - a.moyenne) || []

  const refreshData = () => {
    if (selectedClasse && selectedClasse !== 'all') {
      fetchClassData(selectedClasse)
    }
    fetchNotifications()
  }

  const [showReleve, setShowReleve] = useState<EtudiantData | null>(null)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 shadow-2xl shadow-slate-900/40"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-slate-950" : "bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100"} flex`}>

      <motion.main className="flex-1 min-h-screen">

        <div className="max-w-7xl mx-auto px-6 py-8">
           <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-3xl font-black ${darkMode ? "text-white" : "text-slate-800"} uppercase tracking-tighter`}>
                 Service Rétrographique
              </h1>
              <p className={darkMode ? "text-slate-400" : "text-slate-500 font-bold uppercase tracking-widest text-[10px]"}>
                Génération des bulletins et statistiques globales
              </p>
            </div>
             <PremiumRefresh onClick={refreshData} refreshing={refreshing} label="Actualiser" />
          </div>

          {/* Filtres */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl shadow-xl p-6 mb-8 border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white/80 backdrop-blur-xl border-slate-100"}`}
          >
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <PremiumSearch 
                  placeholder="Rechercher un eleve..." 
                  value={searchTerm} 
                  onChange={setSearchTerm} 
                  darkMode={darkMode}
                />
              </div>
              <div className="w-full md:w-auto">
                <select 
                  value={selectedClasse} 
                  onChange={(e) => setSelectedClasse(e.target.value)} 
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black-500 text-sm font-semibold ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  <option value="all">Toutes les classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nom} ({c.effectif})</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-auto">
                <select 
                  value={selectedSemestre} 
                  onChange={(e) => setSelectedSemestre(e.target.value)} 
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black-500 text-sm font-semibold ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  <option value="S1">Semestre 1</option>
                  <option value="S2">Semestre 2</option>
                  <option value="ANNUEL">Annuel</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Statistiques par classe */}
          {selectedClasse !== 'all' && selectedClassData ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-3xl shadow-xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
              >
                <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-emerald-100 rounded-2xl">
                     <Users className="w-6 h-6 text-emerald-600" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Effectif</p>
                     <p className="text-2xl font-black text-slate-800 dark:text-white">{selectedClassData.effectif}</p>
                   </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`p-6 rounded-3xl shadow-xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
              >
                <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-emerald-100 rounded-2xl">
                     <TrendingUp className="w-6 h-6 text-emerald-600" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moyenne Générale</p>
                     <p className="text-2xl font-black text-emerald-600">{selectedClassData.moyenneGenerale.toFixed(2)}</p>
                   </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-3xl shadow-xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
              >
                <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-emerald-100 rounded-2xl">
                     <Award className="w-6 h-6 text-emerald-600" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plus Haute</p>
                     <p className="text-2xl font-black text-emerald-600">{selectedClassData.moyenneHaute.toFixed(2)}</p>
                   </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className={`p-6 rounded-3xl shadow-xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
              >
                <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-rose-100 rounded-2xl">
                     <TrendingDown className="w-6 h-6 text-rose-600" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plus Basse</p>
                     <p className="text-2xl font-black text-rose-600">{selectedClassData.moyenneBasse.toFixed(2)}</p>
                   </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {classes.slice(0, 3).map((classe, idx) => (
                <motion.div 
                  key={classe.id}
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-3xl shadow-xl border overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
                >
                  <div className="p-5 bg-slate-900">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest">{classe.nom}</h3>
                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mt-1">{classe.filiere} - {classe.niveau}</p>
                  </div>
                  <div className="p-5 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Effectif</p>
                      <p className={`text-xl font-black ${darkMode ? "text-white" : "text-slate-800"}`}>{classe.effectif}</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                       <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tableau des eleves */}
          {selectedClasse !== 'all' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl shadow-2xl border overflow-hidden ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
            >
              <div className="p-6 border-b border-white/5 bg-slate-900">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                  Liste des eleves - {selectedSemestre}
                </h3>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className={darkMode ? "bg-slate-950/50" : "bg-slate-50"}>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Photo</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Élève</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Classe</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Moyenne</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Rang</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? "divide-slate-800" : "divide-slate-100"}`}>
                    {filteredEleves.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={`px-6 py-12 text-center text-sm font-bold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                          {refreshing ? 'Chargement...' : 'Aucun eleve trouve'}
                        </td>
                      </tr>
                    ) : (
                      filteredEleves.map((eleve, idx) => (
                        <tr key={eleve.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-4 text-center">
                            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-emerald-500 font-black text-sm border border-white/10 shadow-lg">
                              {eleve.prenom.charAt(0)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-slate-800"}`}>{eleve.prenom} {eleve.nom}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{eleve.classe}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-black ${eleve.moyenne >= 10 ? 'text-emerald-600' : 'text-rose-500'}`}>
                               {eleve.moyenne.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${idx < 3 ? 'bg-amber-100 text-amber-700' : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                              {idx + 1}/{filteredEleves.length}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setShowReleve(eleve)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                <FileText className="w-4 h-4" />
                              </button>
                              <button className="p-2 bg-emerald-600 text-slate-950 rounded-xl shadow-lg hover:scale-110 transition-all">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Empty State for class selection */}
          {selectedClasse === 'all' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className={`rounded-3xl shadow-xl p-20 text-center border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white/80 backdrop-blur-xl border-slate-100"}`}
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/50">
                <BarChart3 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                Sélectionnez une classe
              </h3>
              <p className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400 font-medium"}`}>
                Choisissez une classe pour accéder aux statistiques détaillées et à la génération des bulletins
              </p>
            </motion.div>
          )}
        </div>
      </motion.main>

      {/* Modal Releve */}
      {showReleve && (
        <ReleveNotesModal 
          etudiant={{ 
            ...showReleve, 
            classe: showReleve.classe || "",
            notes: showReleve.notes.map(n => ({
              ...n,
              typenote: "EXAMEN",
              datenote: new Date().toISOString()
            }))
          }} 
          onClose={() => setShowReleve(null)} 
        />
      )}
    </div>
  )
}
