'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  Users, 
  School,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  Home,
  ChevronLeft,
  Search,
  Edit,
  Trash2,
  UserPlus,
  X,
  Check,
  AlertCircle,
  LogOut,
  Plus,
  UsersRound,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { PremiumSearch, PremiumRefresh } from '@/components/PremiumUI'
import type { Classe, ClasseFormData } from '@/types/Classe'

const sidebarItems = [
  { title: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/admin' },
  { title: 'Utilisateurs', icon: <UsersRound className="w-5 h-5" />, href: '/admin/utilisateurs' },
  { title: 'Classes', icon: <School className="w-5 h-5" />, href: '/admin/classes' },
  { title: 'Matières', icon: <BookOpen className="w-5 h-5" />, href: '/admin/matieres' },
  { title: 'Notes', icon: <FileText className="w-5 h-5" />, href: '/admin/notes' },
  { title: 'Bulletins', icon: <FileText className="w-5 h-5" />, href: '/admin/bulletins' },
  { title: 'Statistiques', icon: <BarChart3 className="w-5 h-5" />, href: '/admin/statistiques' },
  { title: 'Paramètres', icon: <Settings className="w-5 h-5" />, href: '/admin/parametres' },
]

export default function ClassesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
const [classes, setClasses] = useState<Classe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClasse, setEditingClasse] = useState<Classe | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState<ClasseFormData>({
    nom: '',
    niveau: '',
    filiere: '',
    anneeacademique: '2024-2025',
    capacitemax: 30
  })

  const [saving, setSaving] = useState(false)

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        interface RawClasse {
          id: string
          nom: string
          niveau?: string
          filiere?: string
          anneeacademique: string
          capacitemax?: number
          _count?: { etudiants: number }
          actif: boolean
        }
        setClasses(data.map((c: RawClasse) => ({
          id: c.id,
          nom: c.nom,
          niveau: c.niveau || '',
          filiere: c.filiere || '',
          anneeacademique: c.anneeacademique,
          capacitemax: c.capacitemax || 30,
          effectif: c._count?.etudiants || 0,
          actif: c.actif
        })))
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchClasses()
    }
  }, [status])

  const filteredClasses = classes.filter(classe =>
    classe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classe.niveau.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classe.filiere.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (editingClasse) {
        const response = await fetch('/api/classes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingClasse.id,
            nom: formData.nom,
            niveau: formData.niveau,
            filiere: formData.filiere,
            anneeacademique: formData.anneeacademique,
            capacitemax: formData.capacitemax,
            actif: editingClasse.actif
          })
        })
        
        if (response.ok) {
          const updatedClasse = await response.json()
          setClasses(classes.map(c => c.id === editingClasse.id ? { ...c, ...updatedClasse } : c))
        }
      } else {
        const response = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: formData.nom,
            niveau: formData.niveau,
            filiere: formData.filiere,
            anneeacademique: formData.anneeacademique,
            capacitemax: formData.capacitemax
          })
        })
        
        if (response.ok) {
          const newClasse = await response.json()
          setClasses([...classes, { ...newClasse, effectif: 0 }])
        }
      }
      setShowModal(false)
      setEditingClasse(null)
      setFormData({ nom: '', niveau: '', filiere: '', anneeacademique: '2024-2025', capacitemax: 30 })
    } catch (error) {
      console.error('Error saving classe:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (classe: Classe) => {
    setEditingClasse(classe)
    setFormData({
      nom: classe.nom,
      niveau: classe.niveau,
      filiere: classe.filiere,
      anneeacademique: classe.anneeacademique,
      capacitemax: classe.capacitemax
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/classes?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setClasses(classes.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting classe:', error)
    } finally {
      setShowDeleteConfirm(null)
    }
  }

  const toggleClasseStatus = async (id: string) => {
    const classe = classes.find(c => c.id === id)
    if (!classe) return
    
    try {
      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: classe.id,
          nom: classe.nom,
          niveau: classe.niveau,
          filiere: classe.filiere,
          anneeacademique: classe.anneeacademique,
          capacitemax: classe.capacitemax,
          actif: !classe.actif
        })
      })
      
      if (response.ok) {
        setClasses(classes.map(c => c.id === id ? { ...c, actif: !c.actif } : c))
      }
    } catch (error) {
      console.error('Error toggling classe status:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 shadow-2xl shadow-slate-900/40"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 flex">
      {/* Sidebar */}

      <motion.main className="flex-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/40 border border-white/10 group hover:rotate-6 transition-transform">
               <School className="text-emerald-600 w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[7px] uppercase tracking-[0.4em] mb-1">
                 <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                 ELITE V4.0 • GESTION ACADÉMIQUE
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-950 bg-clip-text text-transparent tracking-tighter leading-none uppercase">
                LES <span className="text-emerald-600">CLASSES.</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <PremiumRefresh onClick={fetchClasses} refreshing={loading} label="ACTUALISER" />
            <button
               onClick={() => { setEditingClasse(null); setFormData({ nom: '', niveau: '', filiere: '', anneeacademique: '2024-2025', capacitemax: 30 }); setShowModal(true); }}
               className="px-8 py-4 bg-slate-950 text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-2xl shadow-slate-900/40 hover:bg-black transition-all border border-emerald-600/20 flex items-center gap-3 active:scale-95 relative overflow-hidden group"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
               <Plus className="w-5 h-5" />
               NOUVELLE CLASSE
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-100 p-4 mb-6">
          <PremiumSearch 
            placeholder="Rechercher une classe (nom, niveau)..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classe) => (
            <motion.div
              key={classe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950 rounded-[2rem] shadow-2xl shadow-slate-900/40 overflow-hidden border border-white/5 group hover:border-emerald-600/30 transition-all p-[1px]"
            >
              <div className="bg-slate-950 rounded-[1.95rem] p-7 h-full flex flex-col relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 transition-all duration-1000 ${classe.actif ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`} />
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight leading-none uppercase">{classe.nom}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{classe.niveau} • {classe.filiere}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                    classe.actif 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {classe.actif ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>
                
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase tracking-widest text-emerald-600/60">Session Académique</span>
                    <span className="text-[10px] font-black text-white">{classe.anneeacademique}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase tracking-widest text-emerald-600/60">Capacité Modulaire</span>
                    <span className="text-[10px] font-black text-white">{classe.capacitemax} <span className="text-[7px] text-slate-500">PLACES</span></span>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Effectif Reel</span>
                       <span className="text-[10px] font-black text-white">{classe.effectif} <span className="text-[7px] text-slate-500">APPRENANTS</span></span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (classe.effectif / (classe.capacitemax || 30)) * 100)}%` }}
                        className={`h-full rounded-full ${
                          (classe.effectif / (classe.capacitemax || 30)) > 0.9 ? 'bg-rose-500' : 'bg-emerald-600'
                        } shadow-2xl shadow-slate-900/40`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto relative z-10">
                  <button
                    onClick={() => handleEdit(classe)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center gap-3 text-[8px] font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-600" /> MODIFIER
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(classe.id)}
                    className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
            Aucune classe trouvée
          </div>
        )}
      </motion.main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingClasse ? 'Modifier la classe' : 'Nouvelle classe'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la classe</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    placeholder="Ex: Terminales S"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Niveau</label>
                    <input
                      type="text"
                      required
                      value={formData.niveau}
                      onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                      placeholder="Ex: TS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Filière</label>
                    <input
                      type="text"
                      required
                      value={formData.filiere}
                      onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                      placeholder="Ex: Scientifique"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Année académique</label>
                    <input
                      type="text"
                      required
                      value={formData.anneeacademique}
                      onChange={(e) => setFormData({ ...formData, anneeacademique: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Capacité</label>
                    <input
                      type="number"
                      required
                      value={formData.capacitemax}
                      onChange={(e) => setFormData({ ...formData, capacitemax: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all">
                    Annuler
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 font-bold transition-all border border-white/10 hover:bg-black">
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Check className="w-4 h-4" />}
                    {editingClasse ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmer la suppression</h3>
                <p className="text-gray-500 mb-6">Êtes-vous sûr de vouloir supprimer cette classe?</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50">
                    Annuler
                  </button>
                  <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
