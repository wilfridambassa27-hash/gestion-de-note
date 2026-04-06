'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react'
import { PremiumSearch, PremiumRefresh } from '@/components/PremiumUI'

interface Matiere {
  id: string
  code: string
  intitule: string
  seuilreussite: number
  credits: number
  actif: boolean
}

interface MatiereFormData {
  code: string
  intitule: string
  seuilreussite: number
  credits: number
}

export default function MatieresPage() {
  const { status } = useSession()
  const router = useRouter()
  const [matieres, setMatieres] = useState<Matiere[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMatiere, setEditingMatiere] = useState<Matiere | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState<MatiereFormData>({
    code: '',
    intitule: '',
    seuilreussite: 10,
    credits: 0
  })
  const [saving, setSaving] = useState(false)

  const fetchMatieres = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/matieres')
      if (response.ok) {
        const data = await response.json()
        interface RawMatiere {
          id: string
          code: string
          intitule: string
          seuilreussite: number
          credits: number
          actif?: boolean
        }
        setMatieres(data.map((m: RawMatiere) => ({
          ...m,
          actif: m.actif ?? true
        })))
      }
    } catch (error) {
      console.error('Error fetching matieres:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMatieres()
    }
  }, [status])

  const filteredMatieres = matieres.filter((matiere: Matiere) =>
    matiere.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    matiere.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const url = '/api/matieres'
      const method = editingMatiere ? 'PUT' : 'POST'
      const body = editingMatiere ? { id: editingMatiere.id, ...formData } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        await fetchMatieres()
        setShowModal(false)
        setEditingMatiere(null)
        setFormData({ code: '', intitule: '', seuilreussite: 10, credits: 0 })
      }
    } catch (error) {
      console.error('Error saving matiere:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (matiere: Matiere) => {
    setEditingMatiere(matiere)
    setFormData({
      code: matiere.code,
      intitule: matiere.intitule,
      seuilreussite: matiere.seuilreussite,
      credits: matiere.credits
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/matieres?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setMatieres(matieres.filter((m: Matiere) => m.id !== id))
      }
    } catch (error) {
      console.error('Error deleting matiere:', error)
    } finally {
      setShowDeleteConfirm(null)
    }
  }

  const toggleMatiereStatus = async (id: string) => {
    const matiere = matieres.find((m: Matiere) => m.id === id)
    if (!matiere) return
    
    try {
      const response = await fetch('/api/matieres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...matiere,
          actif: !matiere.actif
        })
      })
      
      if (response.ok) {
        setMatieres(matieres.map((m: Matiere) => m.id === id ? { ...m, actif: !m.actif } : m))
      }
    } catch (error) {
      console.error('Error toggling matiere status:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] relative overflow-hidden font-[Outfit]">
      {/* Background Nuances */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-900/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/40 border border-white/10 group hover:rotate-6 transition-transform">
               <BookOpen className="text-emerald-600 w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[7px] uppercase tracking-[0.4em] mb-1">
                 <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                 ELITE V4.0 • RÉFÉRENTIEL
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-950 bg-clip-text text-transparent tracking-tighter leading-none uppercase">
                LES <span className="text-emerald-600">MATIÈRES.</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <PremiumRefresh onClick={fetchMatieres} refreshing={loading} label="ACTUALISER" />
            <button
               onClick={() => { 
                 setEditingMatiere(null)
                 setFormData({ code: '', intitule: '', seuilreussite: 10, credits: 0 })
                 setShowModal(true)
               }}
               className="px-8 py-4 bg-slate-950 text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-2xl shadow-slate-900/40 hover:bg-black transition-all border border-emerald-600/20 flex items-center gap-3 active:scale-95 relative overflow-hidden group"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
               <Plus className="w-5 h-5" />
               NOUVELLE MATIÈRE
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-100 p-4 mb-6">
          <PremiumSearch 
            placeholder="Rechercher une matiere (code, intitule)..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
        </div>

        <div className="glass-card bg-slate-950/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-900/40 overflow-hidden border border-white/10">
          <table className="w-full border-collapse">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-8 py-6 text-left text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">S-CODE</th>
                <th className="px-8 py-6 text-left text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">INTITULÉ DE LA MATIÈRE</th>
                <th className="px-8 py-6 text-center text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">SEUIL</th>
                <th className="px-8 py-6 text-center text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">CRÉDITS</th>
                <th className="px-8 py-6 text-center text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">STATUS</th>
                <th className="px-8 py-6 text-right text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">GESTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMatieres.map((matiere: Matiere) => (
                <motion.tr 
                  key={matiere.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-white/5 text-emerald-600 text-[10px] font-black rounded-lg border border-white/10">{matiere.code}</span>
                  </td>
                  <td className="px-8 py-5 font-bold text-white text-xs tracking-tight">{matiere.intitule}</td>
                  <td className="px-8 py-5 text-center">
                     <span className="text-[10px] font-black text-slate-400">{matiere.seuilreussite}</span>
                     <span className="text-[7px] text-slate-600 ml-1">/20</span>
                  </td>
                  <td className="px-8 py-5 text-center font-black text-white text-sm">{matiere.credits}</td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => toggleMatiereStatus(matiere.id)} 
                      className={`px-4 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest border transition-all ${
                        matiere.actif 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-green-glow' 
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {matiere.actif ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleEdit(matiere)} 
                        className="p-3 bg-white/5 hover:bg-white/10 text-emerald-600 rounded-xl border border-white/5 transition-all active:scale-95"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(matiere.id)} 
                        className="p-3 bg-rose-500/5 hover:bg-rose-500/20 text-rose-500 rounded-xl border border-rose-500/10 transition-all active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{editingMatiere ? 'Modifier la matière' : 'Nouvelle matière'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Code</label>
                    <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all font-bold text-sm" placeholder="Ex: MATH01" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Crédits</label>
                    <input type="number" required value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all font-bold text-sm" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Intitulé</label>
                  <input type="text" required value={formData.intitule} onChange={(e) => setFormData({ ...formData, intitule: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all font-bold text-sm" placeholder="Ex: Mathématiques Générales" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Seuil de réussite (/20)</label>
                  <input type="number" required value={formData.seuilreussite} onChange={(e) => setFormData({ ...formData, seuilreussite: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none transition-all font-bold text-sm" />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border border-slate-100 text-slate-500 rounded-xl hover:bg-slate-50 font-bold transition-all uppercase text-[10px] tracking-widest">Annuler</button>
                  <button type="submit" disabled={saving} className="flex-1 py-4 bg-slate-900 text-white rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all">
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Check className="w-4 h-4" />}
                    {editingMatiere ? 'Mettre à jour' : 'Confirmer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Supprimer ?</h3>
              <p className="text-slate-500 text-sm mb-8">Cette action est irréversible. Toutes les notes associées seront affectées.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-4 border border-slate-100 rounded-xl hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest transition-all">Garder</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-200">Supprimer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
