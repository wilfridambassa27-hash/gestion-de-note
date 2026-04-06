'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  GraduationCap,
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  FileText,
  Settings,
  Users,
  BookOpen,
  ClipboardList,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  RefreshCw,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { PremiumSearch, PremiumRefresh } from '@/components/PremiumUI'

interface ActivityLog {
  id: string
  action: string
  description: string
  typeaction: string
  dateaction: string
  utilisateur?: {
    nom: string
    prenom: string
    email: string
  }
}

const sidebarItems = [
  { title: 'Dashboard', icon: <GraduationCap className="w-5 h-5" />, href: '/admin' },
  { title: 'Utilisateurs', icon: <Users className="w-5 h-5" />, href: '/admin/utilisateurs' },
  { title: 'Classes', icon: <Award className="w-5 h-5" />, href: '/admin/classes' },
  { title: 'Matières', icon: <BookOpen className="w-5 h-5" />, href: '/admin/matieres' },
  { title: 'Notes', icon: <ClipboardList className="w-5 h-5" />, href: '/admin/notes' },
  { title: 'Bulletins', icon: <FileText className="w-5 h-5" />, href: '/admin/bulletins' },
  { title: 'Activités', icon: <History className="w-5 h-5" />, href: '/admin/activites' },
  { title: 'Statistiques', icon: <Activity className="w-5 h-5" />, href: '/admin/statistiques' },
]

const activityTypes = [
  { value: 'all', label: 'Toutes les activités', icon: Activity, color: 'from-slate-500 to-slate-950' },
  { value: 'USER', label: 'Utilisateurs', icon: User, color: 'from-emerald-600 to-emerald-600' },
  { value: 'CLASSE', label: 'Classes', icon: Award, color: 'from-accent to-emerald-500' },
  { value: 'MATIERE', label: 'Matières', icon: BookOpen, color: 'from-slate-950 to-slate-600' },
  { value: 'NOTE', label: 'Notes', icon: ClipboardList, color: 'from-emerald-500 to-teal-500' },
  { value: 'AUTH', label: 'Authentification', icon: LogIn, color: 'from-rose-500 to-pink-500' },
]

export default function ActivitesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { 
    if (status === 'unauthenticated') router.push('/login') 
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchActivities()
    }
  }, [status])

  useEffect(() => {
    filterActivities()
  }, [activities, searchTerm, selectedType, dateFilter])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/admin/notifications')
      if (response.ok) {
        const data = await response.json()
        // Convert notifications to activities format
        interface RawActivity {
          id: string
          action: string
          description: string
          typeaction?: string
          dateaction: string
          utilisateur?: {
            nom: string
            prenom: string
            email: string
          }
        }
        const formattedActivities = data.map((item: RawActivity) => ({
          id: item.id,
          action: item.action,
          description: item.description,
          typeaction: item.typeaction || 'USER',
          dateaction: item.dateaction,
          utilisateur: item.utilisateur
        }))
        setActivities(formattedActivities)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      // Use mock data if API fails
      setActivities(getMockActivities())
    } finally {
      setLoading(false)
    }
  }

  const getMockActivities = (): ActivityLog[] => [
    {
      id: '1',
      action: 'Connexion',
      description: 'Connexion réussie à la plateforme',
      typeaction: 'AUTH',
      dateaction: new Date().toISOString(),
      utilisateur: { nom: 'Diallo', prenom: 'Mamadou', email: 'diallo@test.com' }
    },
    {
      id: '2',
      action: 'Ajout utilisateur',
      description: 'Nouvel étudiant ajouté: Keita Moussa',
      typeaction: 'USER',
      dateaction: new Date(Date.now() - 3600000).toISOString(),
      utilisateur: { nom: 'Admin', prenom: 'Système', email: 'admin@edunotes.com' }
    },
    {
      id: '3',
      action: 'Modification note',
      description: 'Note de Mathématiques mise à jour pour Camara Fatou',
      typeaction: 'NOTE',
      dateaction: new Date(Date.now() - 7200000).toISOString(),
      utilisateur: { nom: 'Sylla', prenom: 'Aicha', email: 'sylla@edunotes.com' }
    },
    {
      id: '4',
      action: 'Création classe',
      description: 'Nouvelle classe créée: Terminales S2',
      typeaction: 'CLASSE',
      dateaction: new Date(Date.now() - 86400000).toISOString(),
      utilisateur: { nom: 'Admin', prenom: 'Système', email: 'admin@edunotes.com' }
    },
    {
      id: '5',
      action: 'Ajout matière',
      description: 'Nouvelle matière ajoutée: Sciences de l\'Ingénieur',
      typeaction: 'MATIERE',
      dateaction: new Date(Date.now() - 172800000).toISOString(),
      utilisateur: { nom: 'Bah', prenom: 'Oumar', email: 'bah@edunotes.com' }
    },
    {
      id: '6',
      action: 'Déconnexion',
      description: 'Déconnexion de la plateforme',
      typeaction: 'AUTH',
      dateaction: new Date(Date.now() - 259200000).toISOString(),
      utilisateur: { nom: 'Camara', prenom: 'Fatou', email: 'camara@test.com' }
    },
  ]

  const filterActivities = () => {
    let filtered = [...activities]
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.utilisateur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.utilisateur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.typeaction === selectedType)
    }
    
    // Date filter
    const now = new Date()
    if (dateFilter !== 'all') {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.dateaction)
        const diffTime = now.getTime() - activityDate.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)
        
        switch (dateFilter) {
          case 'today': return diffDays < 1
          case 'week': return diffDays < 7
          case 'month': return diffDays < 30
          default: return true
        }
      })
    }
    
    setFilteredActivities(filtered)
  }

  const refreshActivities = async () => {
    setRefreshing(true)
    await fetchActivities()
    setRefreshing(false)
  }

  const getActivityIcon = (type: string) => {
    const typeConfig = activityTypes.find(t => t.value === type)
    if (typeConfig) {
      return <typeConfig.icon className="w-5 h-5" />
    }
    return <Activity className="w-5 h-5" />
  }

  const getActivityColor = (type: string) => {
    const typeConfig = activityTypes.find(t => t.value === type)
    if (typeConfig) {
      return typeConfig.color
    }
    return 'from-gray-500 to-slate-500'
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`
    
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Hier'
    if (days < 7) return `Il y a ${days} jours`
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-100">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-slate-800 border-t-accent rounded-full shadow-lg"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 flex">

      <motion.main
        className="flex-1 p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-950 bg-clip-text text-transparent">
              Historique des Activités
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Suivi en temps réel de toutes les actions performed sur la plateforme</p>
          </div>
          <div className="flex gap-4 items-center">
            <PremiumRefresh 
              onClick={refreshActivities} 
              refreshing={refreshing} 
            />
            <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-full hover:shadow-2xl shadow-slate-900/40 transition-all shadow-xl">
              <Download className="w-4 h-4" />
              Exporter Logs
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total activités</p>
                <p className="text-2xl font-bold text-gray-800">{activities.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-800">
                  {activities.filter(a => {
                    const date = new Date(a.dateaction)
                    const today = new Date()
                    return date.toDateString() === today.toDateString()
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cette semaine</p>
                <p className="text-2xl font-bold text-gray-800">
                  {activities.filter(a => {
                    const date = new Date(a.dateaction)
                    const now = new Date()
                    const diff = now.getTime() - date.getTime()
                    return diff < 7 * 24 * 60 * 60 * 1000
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ce mois</p>
                <p className="text-2xl font-bold text-gray-800">
                  {activities.filter(a => {
                    const date = new Date(a.dateaction)
                    const now = new Date()
                    const diff = now.getTime() - date.getTime()
                    return diff < 30 * 24 * 60 * 60 * 1000
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 mb-6"
        >
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <PremiumSearch 
                placeholder="Rechercher une activité (action, utilisateur)..." 
                value={searchTerm} 
                onChange={setSearchTerm} 
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </motion.div>

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden"
        >
          {filteredActivities.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getActivityColor(activity.typeaction)} flex items-center justify-center text-white flex-shrink-0`}>
                      {getActivityIcon(activity.typeaction)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">{activity.action}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                          {activity.utilisateur && (
                            <div className="flex items-center gap-2 mt-2">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {activity.utilisateur.prenom} {activity.utilisateur.nom}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(activity.dateaction)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 bg-gradient-to-r ${getActivityColor(activity.typeaction)} text-white`}>
                            {activity.typeaction}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Aucune activité trouvée
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos filtres de recherche
              </p>
            </div>
          )}
        </motion.div>

        {/* Load More */}
        {filteredActivities.length > 0 && (
          <div className="text-center mt-6">
            <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
              Charger plus d'activités
            </button>
          </div>
        )}
      </motion.main>
    </div>
  )
}

