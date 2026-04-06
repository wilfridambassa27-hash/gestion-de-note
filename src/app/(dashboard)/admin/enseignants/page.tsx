'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, Users, UserPlus, Search, Edit, Trash2, Home, 
  School, BookOpen, FileText, BarChart3, Settings, Calendar, Briefcase
} from 'lucide-react'
import { PremiumSearch, PremiumRefresh } from '@/components/PremiumUI'
import { useUI } from '@/context/UIContext'

interface User {
  id: string
  email: string
  nom: string
  prenom: string
  role: string
  telephone?: string
  actif: boolean
}

export default function AdminEnseignantsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ email: '', password: '', nom: '', prenom: '', telephone: '', matiere: '', actif: true })
  const [saving, setSaving] = useState(false)
  const { t, theme } = useUI()

  // Custom current date
  const todayDate = new Date()
  const dateStr = todayDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const capitalize = (s: string) => s && s.charAt(0).toUpperCase() + s.slice(1)

  useEffect(() => { if (status === 'unauthenticated') router.push('/login') }, [status, router])

  const fetchEnseignants = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.filter((u: User) => u.role === 'ENSEIGNANT'))
      }
    } catch (error) {
      console.error('Error fetching teachers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') fetchEnseignants()
  }, [status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingUser) {
        // Mocking the update slightly since this is standard API
        await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUser.id,
            nom: formData.nom,
            prenom: formData.prenom,
            telephone: formData.telephone,
            actif: formData.actif
            // matiere would require modifying teacher relation if exists
          })
        })
      } else {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, role: 'ENSEIGNANT' })
        })
      }
      setShowModal(false)
      fetchEnseignants()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer cet enseignant ?")) {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      setUsers(users.filter(u => u.id !== id))
    }
  }

  const filteredUsers = users.filter(user => 
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-100"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 flex p-6">
      <motion.main className="flex-1 max-w-7xl mx-auto space-y-6">
        
        {/* Calendar & Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-emerald-500" />
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-950 bg-clip-text text-transparent">
                Corps Enseignant
              </h1>
            </div>
            <p className="text-slate-500 font-medium">Gérez vos professeurs et intervenants.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-950 px-6 py-4 rounded-2xl shadow-2xl shadow-slate-900/40 border border-slate-800">
            <Calendar className="w-6 h-6 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-white font-black text-sm capitalize">{capitalize(dateStr)}</span>
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Aujourd'hui</span>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="glass-card p-4 rounded-2xl border border-slate-100 shadow-sm bg-white/80 flex flex-wrap gap-4 items-center">
          <div className="flex-1 w-full min-w-[250px]">
            <PremiumSearch placeholder="Rechercher un professeur..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="flex items-center gap-2">
            <PremiumRefresh onClick={fetchEnseignants} refreshing={loading} label="Actualiser" />
            <button 
              onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', nom: '', prenom: '', telephone: '', matiere: '', actif: true }); setShowModal(true); }} 
              className="px-6 py-3 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden border border-slate-100">
          <table className="w-full">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest">Enseignant</th>
                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black text-xs">{user.prenom[0]}{user.nom[0]}</div>
                      <div>
                        <p className="font-black text-slate-950 text-xs uppercase">{user.prenom} {user.nom}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Professeur</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-950">{user.email}</span>
                    <br /><span className="text-[10px] text-slate-500">{user.telephone || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {user.actif ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-600 font-black text-[9px] uppercase tracking-widest rounded-full">Actif</span>
                    ) : (
                      <span className="px-2 py-1 bg-rose-100 text-rose-600 font-black text-[9px] uppercase tracking-widest rounded-full">Passif</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => {
                        setEditingUser(user);
                        setFormData({ email: user.email, password: '', nom: user.nom, prenom: user.prenom, telephone: user.telephone || '', matiere: '', actif: user.actif });
                        setShowModal(true);
                      }} className="p-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-900 hover:text-white transition-all"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && <div className="p-10 text-center text-slate-500 uppercase text-xs font-bold">Aucun enseignant trouvé</div>}
        </div>

      </motion.main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">
                {editingUser ? 'Modifier' : 'Ajouter'} Enseignant
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="p-3 border rounded-xl" />
                  <input required placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="p-3 border rounded-xl" />
                </div>
                <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-xl" />
                {!editingUser && <input required type="password" placeholder="Mot de passe provisoire" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 border rounded-xl" />}
                <input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="w-full p-3 border rounded-xl" />
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl">Annuler</button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl">{saving ? '...' : (editingUser ? 'Modifier' : 'Ajouter')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
