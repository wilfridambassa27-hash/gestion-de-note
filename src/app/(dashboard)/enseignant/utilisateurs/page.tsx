'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { 
  Users, 
  Search, 
  Filter, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Activity,
  ChevronLeft,
  Circle
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiumSearch, PremiumRefresh } from '@/components/PremiumUI'
import { useUI } from '@/context/UIContext'

interface Etudiant {
  id: string
  user: {
    id: string
    nom: string
    prenom: string
    email: string
    telephone?: string
    actif: boolean
    derniereConnexion?: string
  }
  classe?: {
    nom: string
  }
}

interface EditStudentData {
  nom: string
  prenom: string
  telephone?: string
  actif: boolean
}

export default function EnseignantUtilisateursPage() {
  const { data: session, status } = useSession()
  const { t } = useUI()
  const router = useRouter()
  const [students, setStudents] = useState<Etudiant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<EditStudentData>({
    nom: '',
    prenom: '',
    telephone: '',
    actif: true
  })
  const [saving, setSaving] = useState(false)

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/classes/all-students')
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch {
      toast.error(t('error_occurred'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') fetchStudents()
  }, [status])

  const handleUpdateStudent = async (etudiantId: string, userId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          nom: editData.nom,
          prenom: editData.prenom,
          telephone: editData.telephone,
          actif: editData.actif
        })
      })

      if (res.ok) {
        toast.success(t('save_success'), {
          style: { background: '#001F3F', color: '#FCD34D', borderRadius: '1.5rem', border: '1px solid #FCD34D' }
        })
        setEditingId(null)
        fetchStudents()
      } else {
        toast.error(t('error_occurred'))
      }
    } catch {
      toast.error(t('error_occurred'))
    } finally {
      setSaving(false)
    }
  }

  const isOnline = (lastSeen?: string) => {
    if (!lastSeen) return false
    const lastDate = new Date(lastSeen)
    const now = new Date()
    const diff = (now.getTime() - lastDate.getTime()) / 1000 / 60 
    return diff < 5 
  }

  const filteredStudents = students.filter(s => 
    `${s.user.nom} ${s.user.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 font-[Outfit]">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A7AD94]">Student Flux...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-[Outfit] pb-24">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6">
        <div className="flex items-center gap-6">
          <Link href="/enseignant" className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center shadow-navy hover:bg-slate-50 transition-all group active:scale-95 border border-slate-800">
            <ChevronLeft className="w-6 h-6 text-slate-950 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-emerald-500 font-black text-[8px] uppercase tracking-[0.4em] mb-1">
               <Shield className="w-3.5 h-3.5 animate-pulse" />
               {t('user_management_subtitle')}
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-950 to-slate-900 bg-clip-text text-transparent tracking-tighter leading-none">{t('user_management_title').split(' ')[0]} <br/>{t('user_management_title').split(' ').slice(1, -1).join(' ')} <span className="text-emerald-500 underline decoration-accent/10">{t('user_management_title').split(' ').slice(-1)}.</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="px-6 py-3 bg-slate-950 rounded-2xl border border-white/5 shadow-2xl shadow-slate-900/40 flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                 <span className="text-lg font-black text-white leading-none">{students.filter(s => isOnline(s.user.derniereConnexion)).length}</span>
                 <span className="text-[7px] font-black uppercase tracking-widest text-[#A7AD94]">{t('online')}</span>
              </div>
           </div>
           <PremiumRefresh onClick={fetchStudents} refreshing={loading} label={t('nav_settings')} />
        </div>
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 rounded-[2rem] border border-slate-800 shadow-sm bg-white/40 flex flex-col md:flex-row gap-4 items-center">
         <div className="flex-1 w-full">
            <PremiumSearch 
               placeholder={t('search_user_placeholder')} 
               value={searchTerm} 
               onChange={setSearchTerm} 
            />
         </div>
         <div className="flex items-center gap-2 px-6 py-3 bg-white/50 rounded-2xl border border-slate-800 cursor-pointer hover:bg-white transition-all">
            <Filter className="w-4 h-4 text-slate-950" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-950">{t('advanced_filters')}</span>
         </div>
      </div>

      {/* Students Table/Grid */}
      <div className="glass-card rounded-[2.5rem] border border-slate-800 shadow-2xl shadow-slate-900/40 overflow-hidden bg-white/60 backdrop-blur-3xl group">
         <div className="p-6 bg-slate-950 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-5 bg-emerald-600 rounded-full" />
               <h2 className="text-sm font-black text-white uppercase tracking-widest">{t('user_registry')}</h2>
            </div>
            <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-white/40 uppercase tracking-widest">
               Cluster S-12
            </span>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-800">
                     <th className="px-8 py-4 text-[8px] font-black uppercase tracking-[0.3em] text-slate-950">{t('status_label')}</th>
                     <th className="px-8 py-4 text-[8px] font-black uppercase tracking-[0.3em] text-slate-950">{t('identity_label')}</th>
                     <th className="px-8 py-4 text-[8px] font-black uppercase tracking-[0.3em] text-slate-950">{t('contact_label')}</th>
                     <th className="px-8 py-4 text-[8px] font-black uppercase tracking-[0.3em] text-slate-950">{t('promotion_label')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-black-100/30">
                  {filteredStudents.map((student) => {
                     const activeOnline = isOnline(student.user.derniereConnexion)
                     const isEditing = editingId === student.id

                     return (
                        <motion.tr key={student.id} className="hover:bg-emerald-600/[0.02] transition-colors group/row">
                           <td className="px-8 py-4">
                              <div className="flex items-center gap-2">
                                 <div className={`w-2.5 h-2.5 rounded-full ${activeOnline ? 'bg-emerald-500 shadow-green-glow' : 'bg-slate-300'} animate-pulse`} />
                                 <span className={`text-[9px] font-black uppercase tracking-widest ${activeOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {activeOnline ? t('active_status') : t('passive_status')}
                                 </span>
                              </div>
                           </td>
                           <td className="px-8 py-4">
                              {isEditing ? (
                                 <div className="space-y-2">
                                    <input 
                                       value={editData.prenom} 
                                       onChange={e => setEditData({...editData, prenom: e.target.value})}
                                       className="w-full p-2 bg-slate-50 border border-slate-800 rounded-lg text-xs font-bold text-slate-950 outline-none focus:border-emerald-500"
                                       placeholder="Prénom"
                                    />
                                    <input 
                                       value={editData.nom} 
                                       onChange={e => setEditData({...editData, nom: e.target.value})}
                                       className="w-full p-2 bg-slate-50 border border-slate-800 rounded-lg text-xs font-black text-slate-950 uppercase outline-none focus:border-emerald-500"
                                       placeholder="Nom"
                                    />
                                 </div>
                              ) : (
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-center text-emerald-500 font-black text-xs shadow-lg group-hover/row:scale-110 transition-transform">
                                       {student.user.nom[0]}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-sm font-black text-slate-950 uppercase tracking-tight">{student.user.prenom}</span>
                                       <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{student.user.nom}</span>
                                    </div>
                                 </div>
                              )}
                           </td>
                           <td className="px-8 py-4">
                              {isEditing ? (
                                 <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-800 rounded-lg">
                                       <Mail className="w-3 h-3 text-slate-950" />
                                       <span className="text-[10px] font-medium text-slate-950 truncate max-w-[150px]">{student.user.email}</span>
                                    </div>
                                    <input 
                                       value={editData.telephone} 
                                       onChange={e => setEditData({...editData, telephone: e.target.value})}
                                       className="w-full p-2 bg-slate-50 border border-slate-800 rounded-lg text-xs font-bold text-slate-950 outline-none focus:border-emerald-500"
                                       placeholder="Téléphone"
                                    />
                                 </div>
                              ) : (
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-950">
                                       <Mail className="w-3.5 h-3.5" />
                                       <span className="text-[10px] font-semibold">{student.user.email}</span>
                                    </div>
                                    {student.user.telephone && (
                                       <div className="flex items-center gap-2 text-slate-950">
                                          <Phone className="w-3.5 h-3.5" />
                                          <span className="text-[10px] font-semibold">{student.user.telephone}</span>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </td>
                           <td className="px-8 py-4">
                              <div className="px-4 py-1.5 bg-black-50 border border-slate-800 rounded-xl inline-flex items-center gap-2">
                                 <Users className="w-3.5 h-3.5 text-slate-950" />
                                 <span className="text-[9px] font-black text-slate-950 uppercase tracking-widest">{student.classe?.nom || 'NON ASSIGNÉ'}</span>
                              </div>
                           </td>
                        </motion.tr>
                     )
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && !loading && (
         <div className="py-20 text-center glass-card rounded-[3rem] border-2 border-dashed border-slate-800 bg-slate-50/50">
            <User className="w-12 h-12 mx-auto text-slate-950 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-950">{t('no_student_found')}</p>
         </div>
      )}
    </div>
  )
}
