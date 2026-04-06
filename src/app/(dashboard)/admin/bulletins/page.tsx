'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  GraduationCap,
  FileText,
  Download,
  Printer,
  Search,
  Filter,
  Users,
  School,
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Eye,
  Mail,
  RefreshCw,
  Award,
  TrendingUp,
  Menu,
  Sun,
  Moon,
  ChevronLeft,
  Home,
  BookOpen,
  BarChart3,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { PremiumSearch, PremiumRefresh } from '@/components/PremiumUI'

interface Bulletin {
  id: string
  etudiantId: string
  etudiantNom: string
  etudiantPrenom: string
  classe: string
  anneeScolaire: string
  semestre: string
  moyenneGenerale: number
  mention: string
  rang: number
  totalEleves: number
  matieres: {
    nom: string;
    moyenne: number;
    credits: number;
    moyennePondere: number;
    rang: number;
  }[]
  dateGeneration: string
}

interface Classe {
  id: string
  nom: string
  niveau: string
}

const sidebarItems = [
  { title: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/admin' },
  { title: 'Utilisateurs', icon: <Users className="w-5 h-5" />, href: '/admin/utilisateurs' },
  { title: 'Classes', icon: <School className="w-5 h-5" />, href: '/admin/classes' },
  { title: 'Matières', icon: <BookOpen className="w-5 h-5" />, href: '/admin/matieres' },
  { title: 'Notes', icon: <FileText className="w-5 h-5" />, href: '/admin/notes' },
  { title: 'Bulletins', icon: <FileText className="w-5 h-5" />, href: '/admin/bulletins' },
  { title: 'Statistiques', icon: <BarChart3 className="w-5 h-5" />, href: '/admin/retrographique' },
  { title: 'Paramètres', icon: <Settings className="w-5 h-5" />, href: '/admin/parametres' },
]

export default function BulletinsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [classes, setClasses] = useState<Classe[]>([])
  const [selectedClasse, setSelectedClasse] = useState('')
  const [selectedSemestre, setSelectedSemestre] = useState('1')
  const [bulletins, setBulletins] = useState<Bulletin[]>([])
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState<Bulletin | null>(null)

  useEffect(() => { 
    if (status === 'unauthenticated') router.push('/login') 
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchClasses()
    }
  }, [status])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.map((c: Classe) => ({ id: c.id, nom: c.nom, niveau: c.niveau })))
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateBulletins = async () => {
    if (!selectedClasse) {
      alert('Veuillez sélectionner une classe')
      return
    }
    
    setGenerating(true)
    
    // Simulate bulletin generation
    setTimeout(() => {
      const mockBulletins: Bulletin[] = [
        {
          id: '1',
          etudiantId: '1',
          etudiantNom: 'Keita',
          etudiantPrenom: 'Moussa',
          classe: 'TS2',
          anneeScolaire: '2024-2025',
          semestre: selectedSemestre === '1' ? 'Semestre 1' : 'Semestre 2',
          moyenneGenerale: 15.5,
          mention: 'Bien',
          rang: 3,
          totalEleves: 25,
          matieres: [
            { nom: 'Mathématiques', moyenne: 16, credits: 4, moyennePondere: 64, rang: 2 },
            { nom: 'Physique-Chimie', moyenne: 15, credits: 4, moyennePondere: 60, rang: 4 },
            { nom: 'SVT', moyenne: 16.5, credits: 3, moyennePondere: 49.5, rang: 1 },
            { nom: 'Français', moyenne: 14, credits: 3, moyennePondere: 42, rang: 8 },
            { nom: 'Anglais', moyenne: 15, credits: 2, moyennePondere: 30, rang: 5 },
          ],
          dateGeneration: new Date().toISOString()
        },
        {
          id: '2',
          etudiantId: '2',
          etudiantNom: 'Camara',
          etudiantPrenom: 'Fatou',
          classe: 'TS2',
          anneeScolaire: '2024-2025',
          semestre: selectedSemestre === '1' ? 'Semestre 1' : 'Semestre 2',
          moyenneGenerale: 17.2,
          mention: 'Très Bien',
          rang: 1,
          totalEleves: 25,
          matieres: [
            { nom: 'Mathématiques', moyenne: 18, credits: 4, moyennePondere: 72, rang: 1 },
            { nom: 'Physique-Chimie', moyenne: 17, credits: 4, moyennePondere: 68, rang: 2 },
            { nom: 'SVT', moyenne: 17.5, credits: 3, moyennePondere: 52.5, rang: 2 },
            { nom: 'Français', moyenne: 16, credits: 3, moyennePondere: 48, rang: 3 },
            { nom: 'Anglais', moyenne: 17, credits: 2, moyennePondere: 34, rang: 1 },
          ],
          dateGeneration: new Date().toISOString()
        },
        {
          id: '3',
          etudiantId: '3',
          etudiantNom: 'Diallo',
          etudiantPrenom: 'Mamadou',
          classe: 'TS2',
          anneeScolaire: '2024-2025',
          semestre: selectedSemestre === '1' ? 'Semestre 1' : 'Semestre 2',
          moyenneGenerale: 12.8,
          mention: 'Assez Bien',
          rang: 12,
          totalEleves: 25,
          matieres: [
            { nom: 'Mathématiques', moyenne: 13, credits: 4, moyennePondere: 52, rang: 10 },
            { nom: 'Physique-Chimie', moyenne: 12, credits: 4, moyennePondere: 48, rang: 15 },
            { nom: 'SVT', moyenne: 14, credits: 3, moyennePondere: 42, rang: 8 },
            { nom: 'Français', moyenne: 12, credits: 3, moyennePondere: 36, rang: 12 },
            { nom: 'Anglais', moyenne: 13, credits: 2, moyennePondere: 26, rang: 10 },
          ],
          dateGeneration: new Date().toISOString()
        }
      ]
      
      setBulletins(mockBulletins)
      setGenerating(false)
    }, 2000)
  }

  const getMentionColor = (mention: string) => {
    switch (mention) {
      case 'Très Bien': return 'bg-green-100 text-green-700 border-green-200'
      case 'Bien': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Assez Bien': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Passable': return 'bg-emerald-500 text-orange-700 border-emerald-100'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getMoyenneColor = (moyenne: number) => {
    if (moyenne >= 16) return 'text-green-600'
    if (moyenne >= 14) return 'text-emerald-600'
    if (moyenne >= 12) return 'text-yellow-600'
    if (moyenne >= 10) return 'text-emerald-700'
    return 'text-red-600'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 shadow-2xl shadow-slate-900/40"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-slate-950" : "bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100"} flex`}>

      <motion.main
        className="flex-1 min-h-screen"
      >

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-3xl font-black ${darkMode ? "text-white" : "text-slate-800"} uppercase tracking-tighter`}>
                Gestion des Bulletins
              </h1>
              <p className={darkMode ? "text-slate-400" : "text-slate-500 font-bold uppercase tracking-widest text-[10px]"}>
                Générez et téléchargez les bulletins de notes
              </p>
            </div>
            <PremiumRefresh onClick={fetchClasses} refreshing={loading} label="Actualiser" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl shadow-xl p-6 mb-8 border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white/80 backdrop-blur-xl border-slate-100"}`}
          >
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
              <FileText className="w-5 h-5 text-emerald-500" />
              Générer des bulletins
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-widest text-[10px]">Classe</label>
                <select 
                  value={selectedClasse} 
                  onChange={e => setSelectedClasse(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black-500 text-sm font-semibold ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map((classe) => (
                    <option key={classe.id} value={classe.id}>
                      {classe.nom} - {classe.niveau}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-widest text-[10px]">Semestre</label>
                <select 
                  value={selectedSemestre} 
                  onChange={e => setSelectedSemestre(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black-500 text-sm font-semibold ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
                >
                  <option value="1">Semestre 1</option>
                  <option value="2">Semestre 2</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={generateBulletins}
                  disabled={generating || !selectedClasse}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-full hover:shadow-2xl shadow-slate-900/40 transition-all border border-white/10"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Générer les bulletins
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {bulletins.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-black uppercase tracking-widest text-[10px] ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Bulletins générés ({bulletins.length})
                </h2>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:shadow-2xl shadow-slate-900/40 transition-all">
                    <Download className="w-4 h-4" />
                    Tout télécharger
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bulletins.map((bulletin, index) => (
                  <motion.div
                    key={bulletin.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-2xl shadow-lg overflow-hidden border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white/80 backdrop-blur-xl border-slate-100"}`}
                  >
                    <div className="bg-slate-900 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-bold text-sm">
                            {bulletin.etudiantPrenom} {bulletin.etudiantNom}
                          </h3>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{bulletin.classe}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 ${getMentionColor(bulletin.mention)} shadow-lg`}>
                          {bulletin.mention}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Moyenne générale</p>
                          <p className={`text-3xl font-black ${getMoyenneColor(bulletin.moyenneGenerale)}`}>
                            {bulletin.moyenneGenerale.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Rang</p>
                          <p className={`text-xl font-black ${darkMode ? "text-white" : "text-slate-800"}`}>
                            {bulletin.rang}/{bulletin.totalEleves}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        {bulletin.matieres.slice(0, 3).map((matiere, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                            <span className={darkMode ? "text-slate-400" : "text-slate-500"}>{matiere.nom}</span>
                            <span className={getMoyenneColor(matiere.moyenne)}>
                              {matiere.moyenne.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowPreview(bulletin)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:shadow-2xl shadow-slate-900/40 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-emerald-600 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/40 transition-all">
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {bulletins.length === 0 && !generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`rounded-3xl shadow-xl p-20 text-center border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white/80 backdrop-blur-xl border-slate-100"}`}
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                Aucun bulletin généré
              </h3>
              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Sélectionnez une classe et cliquez sur "Générer les bulletins" pour commencer
              </p>
            </motion.div>
          )}
        </div>
      </motion.main>

      {showPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${darkMode ? "bg-slate-900 border border-slate-800" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase">Bulletin de Notes</h2>
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">{showPreview.semestre} - {showPreview.anneeScolaire}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Classe</p>
                    <p className="text-xl font-black text-emerald-500">{showPreview.classe}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-8 border-b ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Élève</p>
                  <p className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {showPreview.etudiantPrenom} {showPreview.etudiantNom}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-lg font-black border-2 ${getMentionColor(showPreview.mention)} shadow-lg`}>
                  {showPreview.mention}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                    <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Matière</th>
                    <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Crédits</th>
                    <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Moyenne</th>
                    <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Rang</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? "divide-slate-800" : "divide-slate-100"}`}>
                  {showPreview.matieres.map((matiere, idx) => (
                    <tr key={idx}>
                      <td className={`py-4 font-bold text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{matiere.nom}</td>
                      <td className={`py-4 text-center text-sm font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{matiere.credits}</td>
                      <td className={`py-4 text-center font-black text-lg ${getMoyenneColor(matiere.moyenne)}`}>
                        {matiere.moyenne.toFixed(2)}
                      </td>
                      <td className={`py-4 text-center text-sm font-black ${darkMode ? "text-white" : "text-slate-800"}`}>{matiere.rang}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`p-8 bg-slate-50 dark:bg-slate-950 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Moyenne générale</p>
                  <p className={`text-4xl font-black ${getMoyenneColor(showPreview.moyenneGenerale)}`}>
                    {showPreview.moyenneGenerale.toFixed(2)}/20
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Rang</p>
                  <p className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {showPreview.rang}<span className="text-sm font-bold text-slate-400 ml-1">sur {showPreview.totalEleves}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-8 border-t flex gap-4 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <button
                onClick={() => setShowPreview(null)}
                className={`flex-1 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${darkMode ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                Fermer
              </button>
              <button className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:shadow-2xl shadow-slate-900/40 transition-all">
                <Download className="w-5 h-5" />
                Télécharger PDF
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
