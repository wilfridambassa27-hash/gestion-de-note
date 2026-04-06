'use client'

import { PremiumSearch } from '@/components/PremiumUI'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, BookOpen, GraduationCap, Mail, Phone, Filter, Download, Printer, UserCheck, UserPlus } from 'lucide-react'

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  role: string
  classe?: string
  actif: boolean
}

export default function RepertoirePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => { if (status === 'unauthenticated') router.push('/login') }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status])

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-700'
      case 'ENSEIGNANT': return 'bg-emerald-100 text-emerald-700'
      case 'ETUDIANT': return 'bg-green-100 text-green-700'
      case 'PARENT': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'} uppercase tracking-tighter`}>Repertoire</h1>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-500 font-bold uppercase tracking-widest text-[10px]'}>Annuaire complet des utilisateurs</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-full hover:shadow-2xl shadow-slate-900/40 transition-all">
              <Download className="w-5 h-5" /> Exporter
            </button>
            <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-900 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-slate-50 transition-all">
              <Printer className="w-5 h-5" /> Imprimer
            </button>
          </div>
        </div>

        <div className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <PremiumSearch 
                placeholder="Rechercher par nom, prenom ou email..." 
                value={searchTerm} 
                onChange={setSearchTerm} 
                darkMode={darkMode}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className={`px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <option value="all">Tous les roles</option>
                <option value="ADMIN">Administrateurs</option>
                <option value="ENSEIGNANT">Enseignants</option>
                <option value="ETUDIANT">Etudiants</option>
                <option value="PARENT">Parents</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Utilisateur</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Role</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Telephone</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-4 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Aucun utilisateur trouve
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-600' :
                            user.role === 'ENSEIGNANT' ? 'bg-emerald-100 text-emerald-600' :
                            user.role === 'ETUDIANT' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {user.prenom?.charAt(0) || 'U'}{user.nom?.charAt(0) || ''}
                          </div>
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {user.prenom} {user.nom}
                            </p>
                            {user.classe && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.classe}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {user.telephone || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={`p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Affichage de {filteredUsers.length} utilisateur(s) sur {users.length} au total
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

