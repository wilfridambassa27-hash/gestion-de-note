'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, Download, Printer, Users, BookOpen, Award, TrendingUp, 
  Search, Filter, RefreshCw, Save, Eye, Calendar, ChevronDown, 
  Calculator, GraduationCap, User, CheckCircle, AlertCircle, 
  ChevronLeft, ChevronRight, Menu, LogOut, Bell, Sun, Moon, Home, Building2,
  Plus, X, Edit, Trash2, Check, TrendingDown, XCircle, CheckSquare, UserCircle
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { PremiumSearch, PremiumRefresh } from '@/components/PremiumUI'

// Types
interface NoteData {
  id: string
  valeur: number
  credits: number
  typenote: string
  datenote: string
  appreciation?: string
  matiere: {
    id: string
    code: string
    intitule: string
    credits: number
  }
  semestre: {
    id: string
    libelle: string
  }
  saisipar?: string | null
  validee: boolean
}

interface EtudiantData {
  id: string
  nom: string
  prenom: string
  email?: string
  matricule: string
  classe?: {
    id: string
    nom: string
  }
  notes: NoteData[]
  moyenneGenerale: number
  moyenneParMatiere: { [key: string]: { moyenne: number; credits: number; count: number } }
  moyenneParGroupe: { [key: string]: number }
  rang: number
  creditsObtenus: number
  creditsTotal: number
  actif: boolean
}

interface MatiereData {
  id: string
  code: string
  nom: string
  credits: number
  semestre?: string
  enseignant?: string | null
}

interface MatiereGroupe {
  id: string
  nom: string
  matieres: { id: string; code: string; nom: string; credits: number }[]
}

interface ClasseStats {
  id: string
  nom: string
  niveau?: string
  filiere?: string
  effectif: number
  moyenneGenerale: number
  moyenneHaute: number
  moyenneBasse: number
  admis: number
  recalés: number
  eleves: EtudiantData[]
  matieres: MatiereData[]
  matieresParGroupe: MatiereGroupe[]
  statsParMatiere: Array<{
    matiereId: string;
    matiereNom: string;
    credits: number;
    moyenne: number;
    min: number;
    max: number;
    effectif: number;
  }>
}

interface Semestre {
  id: string
  libelle: string
  datedebut: string
  datefin: string
  anneeacademique: string
  actif: boolean
  cloture: boolean
}

const sidebarItems = [
  { title: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/secretaire' },
  { title: 'Retrographique', icon: <FileText className="w-5 h-5" />, href: '/secretaire/retrographique' },
]

const typeNotes = [
  { value: 'CC', label: 'Contrôle Continu' },
  { value: 'DS', label: 'Devoir Surveillé' },
  { value: 'EX', label: 'Examen' },
  { value: 'TP', label: 'Travaux Pratiques' },
  { value: 'ORAL', label: 'Oral' },
]

export default function SecretaireRetrographiquePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [selectedClasse, setSelectedClasse] = useState<string>('')
  const [selectedSemestre, setSelectedSemestre] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showBulletin, setShowBulletin] = useState<EtudiantData | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteData | null>(null)
  const [newNote, setNewNote] = useState({
    etudiantId: '',
    matiereId: '',
    valeur: 0,
    credits: 0,
    typenote: 'CC',
    appreciation: ''
  })
  const [generating, setGenerating] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; message: string; date: string; read: boolean }>>([])
  const [selectedEleve, setSelectedEleve] = useState<EtudiantData | null>(null)
  const [showNotesDetail, setShowNotesDetail] = useState(false)
  const [validerLoading, setValiderLoading] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const bulletinRef = useRef<HTMLDivElement>(null)

  const [classes, setClasses] = useState<Array<{ id: string; nom: string; effectif: number; niveau?: string; filiere?: string }>>([])
  const [selectedClassData, setSelectedClassData] = useState<ClasseStats | null>(null)
  const [semestres, setSemestres] = useState<Semestre[]>([])

  // Check if user is secretaire
  useEffect(() => { 
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'SECRETAIRE') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => { 
    if (darkMode) document.documentElement.classList.add('dark'); 
    else document.documentElement.classList.remove('dark') 
  }, [darkMode])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'SECRETAIRE') {
      fetchClasses()
      fetchNotifications()
    }
  }, [status, session])

  useEffect(() => {
    if (selectedClasse) {
      fetchClassData(selectedClasse, selectedSemestre)
    }
  }, [selectedClasse, selectedSemestre])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/retrographique')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
        setSemestres(data.semestres || [])
        
        // Set default selections
        if (data.semestres?.length > 0) {
          const actif = data.semestres.find((s: Semestre) => s.actif)
          setSelectedSemestre(actif ? actif.id : data.semestres[0].id)
        }
        if (data.classes?.length > 0) {
          setSelectedClasse(data.classes[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
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

  const fetchClassData = async (classeId: string, semestreId: string) => {
    setRefreshing(true)
    try {
      const url = `/api/retrographique?classeId=${classeId}${semestreId ? `&semestreId=${semestreId}` : ''}`
      const response = await fetch(url)
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
          admis: data.stats?.admis || 0,
          recalés: data.stats?.recalés || 0,
          eleves: data.eleves || [],
          matieres: data.matieres || [],
          matieresParGroupe: data.matieresParGroupe || [],
          statsParMatiere: data.statsParMatiere || []
        })
      }
    } catch (error) {
      console.error('Error fetching class data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getMention = (moyenne: number): string => {
    if (moyenne >= 16) return 'Très Bien'
    if (moyenne >= 14) return 'Bien'
    if (moyenne >= 12) return 'Assez Bien'
    if (moyenne >= 10) return 'Passable'
    return 'Insuffisant'
  }

  const getMentionColor = (moyenne: number): string => {
    if (moyenne >= 16) return 'bg-green-100 text-green-700'
    if (moyenne >= 14) return 'bg-emerald-100 text-emerald-700'
    if (moyenne >= 12) return 'bg-yellow-100 text-yellow-700'
    if (moyenne >= 10) return 'bg-emerald-500 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  const filteredEleves = selectedClassData?.eleves.filter(e => 
    searchTerm === '' || 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.moyenneGenerale - a.moyenneGenerale) || []

  const handleEditNote = (note: NoteData) => {
    setEditingNote(note)
    setShowEditModal(true)
  }

  const handleAddNote = () => {
    if (!selectedEleve || !selectedClassData) return
    
    setNewNote({
      etudiantId: selectedEleve.id,
      matiereId: '',
      valeur: 0,
      credits: 0,
      typenote: 'CC',
      appreciation: ''
    })
    setShowAddNoteModal(true)
  }

  const saveNote = async () => {
    if (!editingNote) return
    
    try {
      const response = await fetch('/api/retrographique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: [{
            id: editingNote.id,
            etudiantId: editingNote.matiere.id, // We need the etudiant from context
            matiereId: editingNote.matiere.id,
            valeur: editingNote.valeur,
            credits: editingNote.credits,
            typenote: editingNote.typenote,
            appreciation: editingNote.appreciation,
            semestreId: editingNote.semestre.id
          }]
        })
      })
      
      if (response.ok) {
        alert('Note mise à jour avec succès!')
        setShowEditModal(false)
        refreshData()
      }
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const saveNewNote = async () => {
    if (!newNote.etudiantId || !newNote.matiereId || !selectedSemestre) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      const response = await fetch('/api/retrographique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: [{
            ...newNote,
            semestreId: selectedSemestre,
            datenote: new Date().toISOString()
          }]
        })
      })
      
      if (response.ok) {
        alert('Note ajoutée avec succès!')
        setShowAddNoteModal(false)
        refreshData()
      } else {
        const err = await response.json()
        alert(err.error || 'Erreur lors de l\'ajout')
      }
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note?')) return
    
    try {
      const response = await fetch(`/api/retrographique?id=${noteId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        alert('Note supprimée avec succès!')
        refreshData()
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const validerNotes = async (etudiantId: string) => {
    if (!selectedSemestre) return
    setValiderLoading(etudiantId)
    
    try {
      const response = await fetch('/api/retrographique', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          etudiantId, 
          semestreId: selectedSemestre,
          valider: true 
        })
      })
      
      if (response.ok) {
        alert('Notes validées avec succès!')
        refreshData()
      }
    } catch (error) {
      console.error('Error validating notes:', error)
    } finally {
      setValiderLoading(null)
    }
  }

  const viewStudentNotes = (eleve: EtudiantData) => {
    setSelectedEleve(eleve)
    setShowNotesDetail(true)
  }

  const refreshData = () => {
    if (selectedClasse) {
      fetchClassData(selectedClasse, selectedSemestre)
    }
    fetchNotifications()
  }

  // Fonction pour changer le statut de l'étudiant
  const toggleStudentStatus = async (etudiantId: string, currentStatus: boolean) => {
    setStatusLoading(etudiantId)
    try {
      const newStatus = !currentStatus
      const response = await fetch('/api/retrographique', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          etudiantId, 
          actif: newStatus
        })
      })
      
      if (response.ok) {
        alert(`Étudiant ${newStatus ? 'activé' : 'désactivé'} avec succès!`)
        refreshData()
      } else {
        const err = await response.json()
        alert(err.error || 'Erreur lors du changement de statut')
      }
    } catch (error) {
      console.error('Error changing student status:', error)
    } finally {
      setStatusLoading(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-emerald-50 via-white to-emerald-100'}`}>
      {/* Sidebar */}
      <motion.aside 
        initial={false} 
        animate={{ width: sidebarOpen ? 280 : 80 }} 
        className={`fixed left-0 top-0 h-full shadow-2xl z-50 flex flex-col border-r ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
      >
        <div className="p-4 border-b bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-lg"
            >
              <Building2 className="w-7 h-7 text-white" />
            </motion.div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-white">EduNotes</h1>
                <p className="text-xs text-emerald-100">Secretariat</p>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = item.href === '/secretaire/retrographique'
            return (
              <Link key={item.href} href={item.href}>
                <motion.div 
                  whileHover={{ x: 5, scale: 1.02 }} 
                  className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/25' 
                      : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-emerald-400' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isActive ? 'text-white' : darkMode ? 'text-gray-500' : 'text-gray-400'}>
                      {item.icon}
                    </div>
                    {sidebarOpen && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {session?.user?.name?.charAt(0) || 'S'}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white truncate">{session?.user?.name}</p>
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                  <LogOut className="w-3 h-3" /> Deconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      <motion.main 
        initial={false} 
        animate={{ marginLeft: sidebarOpen ? 280 : 80 }} 
        className="flex-1 min-h-screen"
      >
        {/* Header */}
        <header className={`sticky top-0 z-40 shadow-sm border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-lg border-gray-100'}`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)} 
                  className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Service Retrographique
                  </h2>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PremiumRefresh 
                  onClick={refreshData}
                  refreshing={refreshing}
                  label=""
                  darkMode={darkMode}
                />

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
                </motion.button>

                <div className="relative">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Bell className={`w-5 h-5 ${notifications.length > 0 ? 'text-emerald-600' : darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </motion.button>
                </div>

                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {session?.user?.name?.charAt(0) || 'S'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Service Retrographique
              </h1>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                Gestion des notes, bulletins et statistiques - Accès Complet
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={refreshData} className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-emerald-50'}`}>
                <RefreshCw className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-emerald-50'}`}>
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Filtres */}
          <div className={`rounded-2xl shadow-lg border p-4 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <PremiumSearch 
                  placeholder="Rechercher un eleve (nom, prenom, matricule)..." 
                  value={searchTerm} 
                  onChange={setSearchTerm} 
                  darkMode={darkMode}
                />
              </div>
              <select 
                value={selectedClasse} 
                onChange={(e) => setSelectedClasse(e.target.value)} 
                className={`px-4 py-2.5 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.effectif} eleves)</option>
                ))}
              </select>
              <select 
                value={selectedSemestre} 
                onChange={(e) => setSelectedSemestre(e.target.value)} 
                className={`px-4 py-2.5 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
              >
                {semestres.map(s => (
                  <option key={s.id} value={s.id}>{s.libelle} ({s.anneeacademique})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Statistiques par classe */}
          {selectedClasse && selectedClassData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <div className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-700">
                    <h3 className="text-white font-semibold">{selectedClassData.nom}</h3>
                    <p className="text-emerald-100 text-sm">{selectedClassData.filiere} - {selectedClassData.niveau}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Effectif</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedClassData.effectif}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Moyenne generale</span>
                      <span className="font-bold text-emerald-600">{selectedClassData.moyenneGenerale.toFixed(2)}/20</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-700">
                    <h3 className="text-white font-semibold">Plus haute</h3>
                  </div>
                  <div className="p-4">
                    <span className="text-3xl font-bold text-green-600">{selectedClassData.moyenneHaute.toFixed(2)}</span>
                    <span className="text-gray-500">/20</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <div className="p-4 bg-gradient-to-r from-red-600 to-orange-700">
                    <h3 className="text-white font-semibold">Plus basse</h3>
                  </div>
                  <div className="p-4">
                    <span className="text-3xl font-bold text-red-500">{selectedClassData.moyenneBasse.toFixed(2)}</span>
                    <span className="text-gray-500">/20</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <div className="p-4 bg-gradient-to-r from-emerald-600 to-green-700">
                    <h3 className="text-white font-semibold">Admis</h3>
                  </div>
                  <div className="p-4">
                    <span className="text-3xl font-bold text-emerald-600">
                      {selectedClassData.admis}
                    </span>
                    <span className="text-gray-500"> / {selectedClassData.effectif}</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <div className="p-4 bg-gradient-to-r from-purple-600 to-emerald-700">
                    <h3 className="text-white font-semibold">Recales</h3>
                  </div>
                  <div className="p-4">
                    <span className="text-3xl font-bold text-purple-600">
                      {selectedClassData.recalés}
                    </span>
                    <span className="text-gray-500"> / {selectedClassData.effectif}</span>
                  </div>
                </motion.div>
              </div>

              {/* Tableau des eleves */}
              <div className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Liste des eleves
                  </h3>
                  <div className="flex gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (selectedClassData && selectedClassData.eleves.length > 0) {
                          viewStudentNotes(selectedClassData.eleves[0])
                          setShowNotesDetail(true)
                        }
                      }}
                      disabled={!selectedClassData?.eleves.length}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-full hover:shadow-emerald-glow transition-all disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" /> Ajouter Note
                    </motion.button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Matricule</th>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Eleve</th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Statut</th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Moyenne</th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Mention</th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Credits</th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rang</th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredEleves.length === 0 ? (
                        <tr>
                          <td colSpan={7} className={`px-4 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {refreshing ? 'Chargement...' : 'Aucun eleve trouve'}
                          </td>
                        </tr>
                      ) : (
                        filteredEleves.map((eleve, idx) => (
                          <tr key={eleve.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors ${eleve.actif === false ? 'opacity-60' : ''}`}>
                            <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {eleve.matricule || '-'}
                            </td>
                            <td className={`px-4 py-3 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {eleve.prenom} {eleve.nom}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleStudentStatus(eleve.id, eleve.actif !== false)}
                                disabled={statusLoading === eleve.id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                  eleve.actif !== false
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                                }`}
                                title={eleve.actif !== false ? 'Désactiver l\'étudiant' : 'Activer l\'étudiant'}
                              >
                                {statusLoading === eleve.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : eleve.actif !== false ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                {eleve.actif !== false ? 'Actif' : 'Inactif'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-bold ${eleve.moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                                {eleve.moyenneGenerale.toFixed(2)}/20
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMentionColor(eleve.moyenneGenerale)}`}>
                                {getMention(eleve.moyenneGenerale)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                {eleve.creditsObtenus || 0} / {eleve.creditsTotal || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                {idx + 1}/{filteredEleves.length}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => viewStudentNotes(eleve)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Voir les notes">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => validerNotes(eleve.id)} 
                                disabled={validerLoading === eleve.id}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg ml-1 disabled:opacity-50" 
                                title="Valider les notes"
                              >
                                {validerLoading === eleve.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Matières par groupe */}
              {selectedClassData.matieresParGroupe.length > 0 && (
                <div className="mt-6">
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Moyennes par groupe de matieres
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedClassData.matieresParGroupe.map((groupe) => (
                      <div 
                        key={groupe.id} 
                        className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                      >
                        <div className="p-4 bg-gradient-to-r from-emerald-600 to-purple-700">
                          <h4 className="text-white font-semibold">{groupe.nom}</h4>
                          <p className="text-emerald-100 text-sm">{groupe.matieres.length} matieres</p>
                        </div>
                        <div className="p-4">
                          {selectedEleve && selectedEleve.moyenneParGroupe[groupe.nom] !== undefined ? (
                            <div className="text-center">
                              <span className="text-3xl font-bold text-emerald-600">
                                {selectedEleve.moyenneParGroupe[groupe.nom]?.toFixed(2) || '0.00'}
                              </span>
                              <span className="text-gray-500">/20</span>
                            </div>
                          ) : (
                            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Selectionnez un eleve pour voir la moyenne du groupe
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-12 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Selectionnez une classe
              </h3>
              <p className="text-gray-500">
                Choisissez une classe pour gerer les notes, calculer les moyennes et generer les bulletins
              </p>
            </motion.div>
          )}
        </div>
      </motion.main>

      {/* Modal Notes Detail */}
      <AnimatePresence>
        {showNotesDetail && selectedEleve && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNotesDetail(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedEleve.prenom} {selectedEleve.nom}
                    </h2>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Matricule: {selectedEleve.matricule || '-'}
                    </p>
                  </div>
                  <button onClick={() => setShowNotesDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats summary */}
                <div className={`grid grid-cols-4 gap-4 mb-6 p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Moyenne</p>
                    <p className={`text-2xl font-bold ${selectedEleve.moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                      {selectedEleve.moyenneGenerale.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rang</p>
                    <p className="text-2xl font-bold text-emerald-600">{selectedEleve.rang}/{selectedClassData?.effectif}</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Credits</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedEleve.creditsObtenus}/{selectedEleve.creditsTotal}</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mention</p>
                    <p className={`text-lg font-bold ${getMentionColor(selectedEleve.moyenneGenerale)} px-2 py-1 rounded inline-block`}>
                      {getMention(selectedEleve.moyenneGenerale)}
                    </p>
                  </div>
                </div>

                {/* Notes table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                      <tr>
                        <th className={`px-3 py-2 text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Matiere</th>
                        <th className={`px-3 py-2 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type</th>
                        <th className={`px-3 py-2 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Crédits</th>
                        <th className={`px-3 py-2 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Note</th>
                        <th className={`px-3 py-2 text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Appreciation</th>
                        <th className={`px-3 py-2 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {selectedEleve.notes?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className={`px-3 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Aucune note disponible
                          </td>
                        </tr>
                      ) : (
                        selectedEleve.notes?.map((note) => (
                          <tr key={note.id}>
                            <td className={`px-3 py-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {typeof note.matiere === 'string' ? note.matiere : note.matiere?.intitule || "Matière inconnue"}
                            </td>
                            <td className={`px-3 py-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {note.typenote}
                            </td>
                            <td className={`px-3 py-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {note.credits || note.matiere?.credits || 0}
                            </td>
                            <td className={`px-3 py-2 text-center font-bold ${note.valeur >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                              {note.valeur}/20
                            </td>
                            <td className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {note.appreciation || '-'}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button onClick={() => handleEditNote(note)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteNote(note.id)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between mt-6">
                  <button 
                    onClick={() => validerNotes(selectedEleve.id)}
                    disabled={validerLoading === selectedEleve.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
                  >
                    {validerLoading === selectedEleve.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Valider les notes
                  </button>
                  <button 
                    onClick={() => {
                      setShowBulletin(selectedEleve)
                      setShowNotesDetail(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                  >
                    <Download className="w-4 h-4" />
                    Voir Bulletin
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Note Modal */}
      {showEditModal && editingNote && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`rounded-2xl w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Modifier la note
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Matiere
                  </label>
                  <p className={darkMode ? 'text-white' : 'text-gray-800'}>
                    {editingNote.matiere?.intitule}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Note (0-20)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.01"
                      value={editingNote.valeur}
                      onChange={(e) => setEditingNote({ ...editingNote, valeur: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Crédits
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={editingNote.credits}
                      onChange={(e) => setEditingNote({ ...editingNote, credits: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Appreciation
                  </label>
                  <textarea
                    value={editingNote.appreciation || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, appreciation: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  Annuler
                </button>
                <button 
                  onClick={saveNote}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Bulletin */}
      {showBulletin && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowBulletin(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div ref={bulletinRef} className="p-8">
              <div className="text-center border-b-2 border-emerald-600 pb-4 mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>BULLETIN DE NOTES</h2>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Annee scolaire {semestres.find(s => s.id === selectedSemestre)?.anneeacademique || '2024-2025'}</p>
              </div>

              <div className="flex gap-6 mb-6">
                <div className={`w-24 h-24 rounded-xl flex items-center justify-center text-3xl font-bold ${
                  darkMode ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {showBulletin.prenom.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {showBulletin.prenom} {showBulletin.nom}
                  </h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    Matricule: {showBulletin.matricule || '-'}
                  </p>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    Classe: {selectedClassData?.nom || '-'}
                  </p>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Moyenne</p>
                      <p className={`font-bold text-2xl ${showBulletin.moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                        {showBulletin.moyenneGenerale.toFixed(2)}/20
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rang</p>
                      <p className="font-bold text-2xl">{showBulletin.rang}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mention</p>
                      <p className="font-bold text-lg text-emerald-600">{getMention(showBulletin.moyenneGenerale)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes par matiere */}
              <table className="w-full mb-6">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className={`px-3 py-2 text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Matiere</th>
                    <th className={`px-3 py-2 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Crédits</th>
                    <th className={`px-3 py-2 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Note</th>
                    <th className={`px-3 py-2 text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Appreciation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {showBulletin.notes?.map((note, i) => (
                    <tr key={i}>
                      <td className={`px-3 py-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {typeof note.matiere === 'string' ? note.matiere : note.matiere?.intitule || "Matière inconnue"}
                      </td>
                      <td className={`px-3 py-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {note.credits || note.matiere?.credits || 0}
                      </td>
                      <td className={`px-3 py-2 text-center font-bold ${note.valeur >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                        {note.valeur}/20
                      </td>
                      <td className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {note.appreciation || '-'}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={4} className={`px-3 py-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Aucune note disponible
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Moyenne generale</span>
                  <span className={`font-bold text-xl ${showBulletin.moyenneGenerale >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                    {showBulletin.moyenneGenerale.toFixed(2)}/20
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Credits Obtenus</span>
                  <span className="font-bold text-lg text-purple-600">
                    {showBulletin.creditsObtenus || 0} / {showBulletin.creditsTotal || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Rang</span>
                  <span className="font-bold text-lg">{showBulletin.rang} / {selectedClassData?.effectif || 0}</span>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => setShowBulletin(null)} className={`px-4 py-2 rounded-xl border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  Fermer
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                  <Download className="w-4 h-4" /> Telecharger PDF
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

