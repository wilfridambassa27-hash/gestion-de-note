'use client'

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { 
  BookOpen, Users, Search, Download, Calculator, TrendingUp, CheckCircle, AlertCircle, GraduationCap, ChevronLeft,
  School, FileText, BarChart3, Settings, Home, Menu, Sun, Moon, LogOut
} from "lucide-react"
import { signOut } from 'next-auth/react'
import { calculerMoyennePonderee, getMention, calculerStatistiquesGroupe } from "@/lib/calculNotes"
import toast from "react-hot-toast"
import { PremiumSearch, PremiumRefresh } from "@/components/PremiumUI"
import Link from "next/link"

// Types
interface Note {
  id: string
  etudiantId: string
  etudiant: {
    user: {
      nom: string
      prenom: string
    }
  }
  matiere: {
    id: string
    intitule: string
    coefficient: number
  }
  valeur: number
  credits: number // UE credits
  typenote: string
  coefficient: number // Poids de l'évaluation (affiché comme Crédit)
  datenote: string
}

interface Classe { id: string; nom: string }
interface Matiere { id: string; intitule: string; credits: number }

export default function AdminNotesPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<Classe[]>([])
  const [matieres, setMatieres] = useState<Matiere[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedClasse, setSelectedClasse] = useState('')
  const [selectedMatiere, setSelectedMatiere] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ moyenne: 0, total: 0, reussis: 0 })
  const [darkMode, setDarkMode] = useState(false)

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch("/api/classes")
      if (res.ok) setClasses(await res.json())
    } catch {}
    setLoading(false)
  }, [])

  const fetchMatieres = useCallback(async (classeId?: string) => {
    try {
      const url = classeId ? `/api/matieres?classeId=${classeId}` : "/api/matieres"
      const res = await fetch(url)
      if (res.ok) setMatieres(await res.json())
    } catch {}
  }, [])

  const fetchNotes = useCallback(async () => {
    try {
      const params = new URLSearchParams({ classeId: selectedClasse!, matiereId: selectedMatiere! })
      const res = await fetch(`/api/notes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
        const valeurs = data.map((n: Note) => n.valeur)
        const groupStats = calculerStatistiquesGroupe(valeurs)
        const reussis = data.filter((n: Note) => n.valeur >= 10).length
        setStats({ moyenne: groupStats.moyenne, total: data.length, reussis })
      }
    } catch {
      toast.error("Erreur chargement notes")
    }
  }, [selectedClasse, selectedMatiere])

  useEffect(() => {
    fetchClasses()
    fetchMatieres() // Fetch all initially or if we want empty we could pass nothing
  }, [fetchClasses, fetchMatieres])

  useEffect(() => {
    if (selectedClasse) {
      fetchMatieres(selectedClasse)
      if (selectedMatiere) {
        fetchNotes()
      }
    } else {
      // If no class selected, clear matieres or fetch all
      fetchMatieres()
      setNotes([])
    }
  }, [selectedClasse, fetchMatieres]) // fetchNotes removed to avoid loops, handled distinctly

  useEffect(() => {
    if (selectedClasse && selectedMatiere) {
      fetchNotes()
    }
  }, [selectedMatiere, fetchNotes, selectedClasse])

  const filteredNotes = notes.filter(n =>
    n.etudiant.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.etudiant.user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.matiere.intitule.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-100"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 shadow-2xl shadow-slate-900/40"></div></div>

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-slate-950" : "bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100"}`}>
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-3xl font-black ${darkMode ? "text-white" : "text-slate-800"} uppercase tracking-tighter`}>
                Gestion Globale Notes
              </h1>
              <p className={darkMode ? "text-slate-400" : "text-slate-500 font-bold uppercase tracking-widest text-[10px]"}>
                Consultation et statistiques complètes
              </p>
            </div>
            <PremiumRefresh onClick={fetchNotes} refreshing={false} label="Actualiser" />
          </div>

          <div className={`rounded-3xl p-6 shadow-xl border mb-8 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white/80 backdrop-blur-xl border-slate-100"}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest text-[10px]">Classe</label>
                <select 
                  value={selectedClasse} 
                  onChange={e => setSelectedClasse(e.target.value)}
                  className={`w-full p-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black-500 text-sm font-semibold ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  <option value="">Toutes classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest text-[10px]">Matière</label>
                <select 
                  value={selectedMatiere} 
                  onChange={e => setSelectedMatiere(e.target.value)}
                  className={`w-full p-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black-500 text-sm font-semibold ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  <option value="">Toutes matières</option>
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.intitule}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest text-[10px]">Recherche</label>
                <PremiumSearch 
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Nom élève, matière..."
                />
              </div>
            </div>
          </div>
          
          {/* STATS PAR MATIÈRE (REGISTRE) */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900 leading-none">Registre par Matières</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Cliquez sur une matière pour filtrer</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {matieres.map((m) => (
                <motion.button
                  key={m.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => setSelectedMatiere(m.id)}
                  className={`p-4 rounded-2xl border transition-all text-left group ${
                    selectedMatiere === m.id 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : `${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm hover:border-emerald-300'}`
                  }`}
                >
                  <p className={`text-[8px] font-black uppercase tracking-widest mb-2 ${selectedMatiere === m.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                    UE Code — {m.credits} CR
                  </p>
                  <p className={`text-[10px] font-black line-clamp-2 uppercase ${selectedMatiere === m.id ? 'text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                    {m.intitule}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

        {notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Moyenne generale</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.moyenne.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admis</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.reussis}</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-yellow-600 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total notes</p>
                  <p className="text-3xl font-bold text-emerald-700">{stats.total}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <motion.div 
          initial={{opacity:0, scale:0.98}} 
          animate={{opacity:1, scale:1}}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
        >
          {notes.length === 0 ? (
            <div className="p-20 text-center">
              <GraduationCap className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              {(!selectedClasse || !selectedMatiere) ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-500 mb-2">Sélection requise</h3>
                  <p className="text-gray-400">Sélectionnez une classe et une matière pour consulter les notes.</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-500 mb-2">Dossier vide</h3>
                  <p className="text-gray-400">Aucune note n'a été remplie pour le moment dans cette matière.</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Eleve</th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Matiere</th>
                    <th className="px-8 py-6 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Note</th>
                    <th className="px-8 py-6 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Crédits (UE)</th>
                    <th className="px-8 py-6 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Coeff (Eval)</th>
                    <th className="px-8 py-6 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-8 py-6 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNotes.map((note, i) => {
                    const noteColor = note.valeur >= 10 ? 'text-green-700 bg-green-100/50' : 'text-red-700 bg-red-100/50'
                    const mention = getMention(note.valeur)
                    return (
                      <tr key={note.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6 font-semibold text-slate-900 group-hover:text-slate-700">
                          {note.etudiant.user.prenom} {note.etudiant.user.nom}
                        </td>
                        <td className="px-8 py-6 text-slate-600">
                          {note.matiere.intitule}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-2 rounded-2xl font-bold text-lg ${noteColor}`}>
                            {note.valeur.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center font-mono font-bold text-slate-400">
                          x{note.credits}
                        </td>
                        <td className="px-8 py-6 text-center font-mono font-bold text-emerald-600">
                          x{note.coefficient || 1}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
                            {note.typenote}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center text-sm text-slate-500">
                          {new Date(note.datenote).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-end">
          <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:shadow-2xl shadow-slate-900/40 transition-all flex items-center gap-3 mx-auto sm:mx-0 border border-white/10">
            <Download className="w-5 h-5" />
            Exporter Excel
          </button>
        </div>
      </div>
    </motion.main>
  </div>
  )
}
