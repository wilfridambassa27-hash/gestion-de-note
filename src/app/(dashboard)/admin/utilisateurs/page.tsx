'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  LogOut,
  ChevronLeft,
  X,
  Home,
  UsersRound,
  BookOpen,
  School,
  FileText,
  BarChart3,
  Settings,
  Bell,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
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
  createdAt: string
  derniereConnexion?: string
  etudiant?: {
    classe?: {
      id: string
      nom: string
      filiere: string
      anneeacademique: string
    }
    anneeentree?: number
    moyenneGenerale?: number
    notes?: { valeur: number }[]
    bulletins?: { moyennegenerale: number }[]
  }
  enseignant?: {
    classesprincipales?: {
      id: string
      nom: string
      filiere: string
      anneeacademique: string
    }[]
  }
}

interface UserFormData {
  email: string
  password: string
  nom: string
  prenom: string
  role: string
  telephone: string
  classeId?: string
  matricule?: string
  specialite?: string
  actif?: boolean
}

interface Classe {
  id: string
  nom: string
  filiere: string
}

const sidebarItems = [
  { title: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/admin' },
  { title: 'Utilisateurs', icon: <UsersRound className="w-5 h-5" />, href: '/admin/utilisateurs' },
  { title: 'Classes', icon: <School className="w-5 h-5" />, href: '/admin/classes' },
  { title: 'Matieres', icon: <BookOpen className="w-5 h-5" />, href: '/admin/matieres' },
  { title: 'Notes', icon: <FileText className="w-5 h-5" />, href: '/admin/notes' },
  { title: 'Bulletins', icon: <FileText className="w-5 h-5" />, href: '/admin/bulletins' },
  { title: 'Statistiques', icon: <BarChart3 className="w-5 h-5" />, href: '/admin/statistiques' },
  { title: 'Parametres', icon: <Settings className="w-5 h-5" />, href: '/admin/parametres' },
]

export default function UtilisateursPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ETUDIANT')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState<UserFormData>({ email: '', password: '', nom: '', prenom: '', role: 'ETUDIANT', telephone: '', classeId: '', matricule: '', specialite: '', actif: true })
  const [saving, setSaving] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const [classes, setClasses] = useState<Classe[]>([])
  const { t } = useUI()

  useEffect(() => { if (status === 'unauthenticated') router.push('/login') }, [status, router])

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOnlineCount = async () => {
    try {
      const [statsRes, classesRes] = await Promise.all([
        fetch('/api/admin/statistiques/online'),
        fetch('/api/classes')
      ])
      if (statsRes.ok) {
        const data = await statsRes.json()
        setOnlineCount(data.onlineCount)
      }
      if (classesRes.ok) {
        const data = await classesRes.json()
        setClasses(data)
      }
    } catch (e) {}
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers()
      fetchOnlineCount()
      const interval = setInterval(fetchOnlineCount, 30000)
      return () => clearInterval(interval)
    }
  }, [status])

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.telephone && user.telephone.includes(searchTerm))
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (editingUser) {
        // Update existing user via API
        const response = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUser.id,
            nom: formData.nom,
            prenom: formData.prenom,
            telephone: formData.telephone,
            actif: editingUser.actif,
            classeId: formData.classeId
          })
        })
        
        if (response.ok) {
          const updatedUser = await response.json()
          setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updatedUser } : u))
        }
      } else {
        // Create new user via API
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (response.ok) {
          const newUser = await response.json()
          setUsers([newUser, ...users])
        }
      }
      setShowModal(false)
      setEditingUser(null)
      setFormData({ email: '', password: '', nom: '', prenom: '', role: 'ETUDIANT', telephone: '', classeId: '', matricule: '', specialite: '', actif: true })
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({ 
      email: user.email, 
      password: '', 
      nom: user.nom, 
      prenom: user.prenom, 
      role: user.role, 
      telephone: user.telephone || '',
      classeId: user.etudiant?.classe?.id || user.enseignant?.classesprincipales?.[0]?.id || '',
      actif: user.actif
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setShowDeleteConfirm(null)
    }
  }

  const toggleUserStatus = async (id: string) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          telephone: user.telephone,
          actif: !user.actif
        })
      })
      
      if (response.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, actif: !u.actif } : u))
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">Admin</span>
      case 'ENSEIGNANT': return <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs rounded-full font-medium">Enseignant</span>
      case 'ETUDIANT': return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">Etudiant</span>
      case 'PARENT': return <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full font-medium">Parent</span>
      default: return null
    }
  }

  if (status === 'loading' || loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-100"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 shadow-2xl shadow-slate-900/40"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 flex">

      <motion.main className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-950 bg-clip-text text-transparent">
               {t('user_management_title')}
            </h1>
            <div className="flex items-center gap-3 mt-1">
               <p className="text-slate-500 font-medium">{t('user_management_subtitle')}</p>
               <span className="w-1 h-1 bg-slate-300 rounded-full" />
               <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{onlineCount} {t('online')}</span>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <PremiumRefresh onClick={fetchUsers} refreshing={loading} label="ACTUALISER" />
            <button 
              onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', nom: '', prenom: '', role: 'ETUDIANT', telephone: '', classeId: '', matricule: '', specialite: '' }); setShowModal(true); }} 
              className="px-8 py-4 bg-slate-950 text-emerald-500 font-black text-[10px] uppercase tracking-widest rounded-full hover:shadow-2xl shadow-slate-900/40 transition-all border border-emerald-500/10 black-glow flex items-center gap-3"
            >
              <UserPlus className="w-5 h-5" />
              {t('nav_users')}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-100 p-4">
            <PremiumSearch 
              placeholder="Rechercher (nom, email)..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl shadow-inner border border-slate-200 overflow-x-auto">
             {['ETUDIANT', 'ENSEIGNANT', 'PARENT', 'ADMIN'].map(role => (
                <button 
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${roleFilter === role ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {role === 'ETUDIANT' ? 'Étudiants' : role === 'ENSEIGNANT' ? 'Enseignants' : role === 'PARENT' ? 'Parents' : 'Administrateurs'}
                </button>
             ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest">{t('identity_label')}</th>
                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest">{t('nav_classes')} / {t('promotion_label')}</th>
                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest">{t('contact_label')}</th>
                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest">Moyenne</th>
                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest">{t('status_label')}</th>
                <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-emerald-500 font-black text-xs shadow-lg">{user.prenom.charAt(0)}{user.nom.charAt(0)}</div>
                      <div>
                        <p className="font-black text-slate-950 text-xs uppercase">{user.prenom} {user.nom}</p>
                        <p className="text-[10px] text-slate-500 font-medium lowercase">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-950 uppercase">{user.etudiant?.classe?.nom || user.enseignant?.classesprincipales?.[0]?.nom || '-'}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{user.etudiant?.classe?.filiere || user.enseignant?.classesprincipales?.[0]?.filiere || 'Promotion'} {user.etudiant?.classe?.anneeacademique || user.enseignant?.classesprincipales?.[0]?.anneeacademique || '2024-2025'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-950">{user.telephone || '-'}</span>
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{getRoleBadge(user.role)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'ETUDIANT' ? (
                      <div className="flex items-center gap-2">
                         <TrendingUp className="w-3 h-3 text-emerald-500" />
                         <span className="text-[10px] font-black text-slate-950">
                            {user.etudiant?.bulletins?.[0]?.moyennegenerale ? user.etudiant.bulletins[0].moyennegenerale.toFixed(2) : (
                              user.etudiant?.notes?.length ? (user.etudiant.notes.reduce((acc: number, n: { valeur: number }) => acc + n.valeur, 0) / user.etudiant.notes.length).toFixed(2) : '-.--'
                            )}
                         </span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-[10px] italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleUserStatus(user.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                        user.actif 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                      }`}
                      title="Cliquez pour changer le statut"
                    >
                       <div className={`w-1.5 h-1.5 rounded-full ${user.actif ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                       <span className="text-[9px] font-black uppercase tracking-widest">
                          {user.actif ? 'Actif' : 'Passif'}
                       </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(user)} className="p-2.5 bg-slate-100 text-slate-950 hover:bg-slate-950 hover:text-emerald-500 rounded-xl transition-all shadow-sm"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setShowDeleteConfirm(user.id)} className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>

              ))}
            </tbody>
          </table>
        </div>
      </motion.main>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800">{editingUser ? 'Modifier' : 'Nouvel'} utilisateur</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-stone-100 rounded-lg"><X className="w-5 h-5 text-stone-500" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Prenom</label>
                    <input type="text" required value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Nom</label>
                    <input type="text" required value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Mot de passe</label>
                    <input type="password" required={!editingUser} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Role</label>
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="ETUDIANT">Etudiant</option>
                      <option value="ENSEIGNANT">Enseignant</option>
                      <option value="PARENT">Parent</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Telephone</label>
                    <input type="tel" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                {(formData.role === 'ETUDIANT' || formData.role === 'ENSEIGNANT') && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      {formData.role === 'ENSEIGNANT' ? 'Classe (Prof Principal)' : 'Classe (& Filière)'}
                    </label>
                    <select 
                      value={formData.classeId} 
                      onChange={(e) => setFormData({ ...formData, classeId: e.target.value })} 
                      className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    >
                      <option value="">Sélectionner une classe...</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.nom} - {c.filiere}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.role === 'ENSEIGNANT' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Matricule Enseignant</label>
                      <input 
                        type="text" 
                        placeholder="Ex: ENS-2026-001"
                        required={formData.role === 'ENSEIGNANT'}
                        value={formData.matricule || ''} 
                        onChange={(e) => setFormData({ ...formData, matricule: e.target.value })} 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Matière / Spécialité</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Mathématiques, Physique..."
                        value={formData.specialite || ''} 
                        onChange={(e) => setFormData({ ...formData, specialite: e.target.value })} 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" 
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Statut du Compte</label>
                  <select 
                    value={formData.actif ? "true" : "false"} 
                    onChange={(e) => setFormData({ ...formData, actif: e.target.value === "true" })} 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    <option value="true">Actif (Connecté)</option>
                    <option value="false">Passif (Désactivé)</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50">Annuler</button>
                  <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-xl hover:shadow-lg disabled:opacity-50 font-bold transition-all border border-white/10 hover:bg-black">
                    {saving ? 'Enregistrement...' : (editingUser ? 'Modifier' : 'Creer')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-2">Confirmer la suppression</h3>
                <p className="text-stone-500 mb-6">Voulez-vous vraiment supprimer cet utilisateur?</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-stone-200 text-stone-600 rounded-xl">Annuler</button>
                  <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-emerald-600 text-white rounded-xl">Supprimer</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
