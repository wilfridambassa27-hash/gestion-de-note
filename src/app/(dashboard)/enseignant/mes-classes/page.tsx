'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  Loader2,
  Target,
  Users,
  X,
  Sparkles,
  MapPin
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useUI } from '@/context/UIContext'
import { PremiumRefresh } from '@/components/PremiumUI'

interface NoteEntry {
  semestre: string
  note: number
  credit: number
}

interface Classe {
  id: string
  nom: string
  niveau?: string
  filiere?: string
  capacitemax?: number
  effectif?: number
  _count?: { etudiants: number }
  performance_moyenne?: number
  salles?: string[]
}

export default function MesClassesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<Classe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Validation Modal State
  const [showValiderModal, setShowValiderModal] = useState<string | null>(null)
  const [noteEntry, setNoteEntry] = useState<NoteEntry>({ semestre: '1', note: 0, credit: 1 })
  const [matieres, setMatieres] = useState<any[]>([])
  const [selectedMatiereId, setSelectedMatiereId] = useState('')
  const { t } = useUI()

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(Array.isArray(data) ? data : [])
      }
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetchClasses()
      fetch('/api/matieres').then(res => res.json()).then(data => setMatieres(Array.isArray(data) ? data : []))
    }
  }, [status])

  const handleValiderNotes = async () => {
    if (!selectedMatiereId) return toast.error(t('selection_required'))
    setLoading(true)
    try {
      const weightedNote = noteEntry.note * noteEntry.credit
      const res = await fetch('/api/notes/valider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classeId: showValiderModal,
          semestre: noteEntry.semestre,
          note: noteEntry.note,
          credit: noteEntry.credit,
          notePonderee: weightedNote,
          adminEmail: 'admin@edunotes.com',
          matiereId: selectedMatiereId
        })
      })

      if (res.ok) {
        toast.success(t('validation_success'), {
           icon: '✉️',
           style: { background: '#001F3F', color: '#fff', borderRadius: '1.5rem' }
        })
        setShowValiderModal(null)
        setSelectedMatiereId('')
      }
    } catch {
      toast.error('Erreur de validation')
    } finally {
      setLoading(false)
    }
  }

  const filteredClasses = classes.filter(c =>
    c.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && classes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-[#1dff2f] animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Accès aux Promotions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-[Outfit] pb-20">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/20">
        <div className="space-y-1">
           <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1dff2f] rounded-full shadow-2xl shadow-slate-900/40" />
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Section Académique</p>
           </div>
           <h1 className="text-2xl font-black bg-gradient-to-r from-slate-950 to-slate-900 bg-clip-text text-transparent tracking-tighter leading-none">Répertoire des <span className="text-[#1dff2f] underline decoration-accent/10">Classes.</span></h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <PremiumRefresh
            onClick={() => { fetchClasses(); router.refresh(); }}
            refreshing={loading}
            label={t('refresh') || "Actualiser"}
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-4 items-center glass-card p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white/40 dark:bg-slate-900/40 transition-colors">
         <div className="flex-1 flex items-center gap-3 px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 group focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-[#1dff2f]/40 transition-all shadow-inner w-full">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#1dff2f]" />
            <input
              type="text"
              placeholder={t('search_class_placeholder') || "Rechercher une classe..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 w-full"
            />
         </div>

         <div className="flex items-center gap-4 shrink-0">
            <PremiumRefresh
              onClick={() => { fetchClasses(); router.refresh(); }}
              refreshing={loading}
              label="Actualiser"
            />
            <div className="flex items-center gap-3 bg-[#1dff2f]/10 px-5 py-3 rounded-2xl border border-[#1dff2f]/20">
               <BookOpen className="w-4 h-4 text-[#1dff2f]" />
               <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{classes.length} <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('nav_classes')}</span></span>
            </div>
            <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-[#1dff2f] hover:border-[#1dff2f] transition-all shadow-sm active:scale-90">
               <Filter className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredClasses.map((classe, idx) => (
            <motion.div
              key={classe.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="group relative glass-card p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl shadow-slate-900/40 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden flex flex-col min-h-[320px] bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900"
            >
              <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.1] transition-all transform group-hover:scale-125 rotate-12">
                 <GraduationCap className="w-32 h-32 text-slate-900 dark:text-white" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-950 text-[#1dff2f] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                       <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center gap-1.5">
                          <div className="w-1 h-1 bg-[#1dff2f] rounded-full animate-pulse shadow-[0_0_10px_#1dff2f]" />
                          <span className="text-[7px] font-black uppercase tracking-widest text-[#1dff2f]">{t('active_status')}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 opacity-40">
                          <Target className="w-3 h-3 text-[#1dff2f]" />
                          <p className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400">Consultation EDU.V2</p>
                       </div>
                       <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-[#1dff2f] transition-colors truncate">{classe.nom}</h3>
                       <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[7px] font-black uppercase tracking-tight text-slate-900 dark:text-slate-200">{classe.niveau || 'N/A'}</span>
                          <span className="px-2.5 py-1 bg-[#1dff2f]/10 border border-[#1dff2f]/20 rounded-lg text-[7px] font-black uppercase tracking-tight text-slate-900 dark:text-slate-200">{classe.filiere || 'Général'}</span>
                          {classe.salles && classe.salles.length > 0 && (
                            <span className="px-2.5 py-1 bg-slate-900 text-[#1dff2f] border border-slate-800 rounded-lg text-[7px] font-black uppercase tracking-tight flex items-center gap-1">
                               <MapPin className="w-2 h-2" />
                               {classe.salles.join(', ')}
                            </span>
                          )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                       <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
                          <p className="text-[6px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{t('promo_average')}</p>
                          <p className="text-sm font-black text-emerald-500">{classe.performance_moyenne || '14.5'}</p>
                       </div>
                       <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-center">
                          <p className="text-[6px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{t('total_students')}</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{classe.effectif || '0'}<span className="text-[8px] text-slate-400 dark:text-slate-500 ml-0.5">/{classe.capacitemax || '30'}</span></p>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-2 pt-6">
                     <button 
                       onClick={() => router.push(`/enseignant/mes-classes/${classe.id}`)}
                       className="flex-1 py-4 bg-slate-950 text-[#1dff2f] rounded-full font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-500/30 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/50 hover:scale-105 transition-all group active:scale-95"
                     >
                        CONSULTER REGISTRE <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                     </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredClasses.length === 0 && !loading && (
        <div className="text-center py-20 glass-card rounded-[3rem] border border-dashed border-slate-200 opacity-60">
           <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
           <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Aucune promotion trouvée</p>
        </div>
      )}

    </div>
  )
}
