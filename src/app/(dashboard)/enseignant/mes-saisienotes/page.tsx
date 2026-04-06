// ============================================================
// mes-saisienotes/page.tsx — Historique des Saisies de Notes
// Affiche toutes les notes enregistrées par l'enseignant connecté,
// avec recherche, suppression et création via NouvelleNoteModal.
// ============================================================

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  BookOpen, 
  Loader2,
  Calendar,
  Award,
  User,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useUI } from '@/context/UIContext'
import NouvelleNoteModal from './NouvelleNoteModal'

// ── Interface représentant une note avec ses relations imbriquées ──
interface Note {
  id: string
  valeur: number
  typenote: string          // Type : CC, DS, EXAM...
  datenote: string
  appreciation?: string     // Mention qualitative générée automatiquement
  statut?: string           // État : TRANSMIS, VALIDE, ATTENTE
  etudiant: {
    user: {
      nom: string
      prenom: string
    }
  }
  matiere: {
    nom: string
    intitule?: string       // Titre long de la matière (optionnel)
  }
}

export default function MesSaisiesPage() {
  const { data: session, status } = useSession()
  const { t } = useUI()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // ── Chargement de l'historique de notes depuis l'API ──
  // Filtré par l'ID de l'enseignant connecté (saisiparId)
  const fetchNotes = async () => {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/notes?saisiparId=${session.user.id}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(Array.isArray(data) ? data : [])
      }
    } catch {
      toast.error('Erreur lors du chargement de l\'historique')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotes()
    }
  }, [status, session])

  // ── Soumission d'une nouvelle note via la modale ──
  // Envoie les données à l'API puis rafraîchit la liste
  const handleSaveNote = async (newNote: any) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: [newNote],
          saisiparId: session?.user?.id,
          semestreId: newNote.semestreId
        })
      })

      if (res.ok) {
        toast.success('Note enregistrée avec succès', {
          style: { background: '#1dff2f', color: '#000', fontWeight: 'bold' }
        })
        setIsModalOpen(false)
        fetchNotes()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Erreur lors de l\'enregistrement')
      }
    } catch {
      toast.error('Erreur technique')
    }
  }

  // ── Suppression d'une note avec confirmation utilisateur ──
  const handleDeleteNote = async (id: string) => {
    if (!confirm('Souhaitez-vous vraiment supprimer cet enregistrement ?')) return
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Enregistrement supprimé')
        fetchNotes() // Rafraîchit la liste après suppression
      }
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  // ── Filtrage côté client par nom d'étudiant ou nom de matière ──
  const filteredNotes = notes.filter(n => 
    n.etudiant.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.etudiant.user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.matiere.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && notes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-[#1dff2f] animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Synchronisation de l'Historique...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-[Outfit] pb-20">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1">
           <div className="flex items-center gap-2">
               <div className="w-1 h-4 bg-[#1dff2f] rounded-full shadow-2xl shadow-slate-900/40" />
               <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">{t('activity_report')}</p>
           </div>
           <h1 className="text-2xl font-black bg-gradient-to-r from-slate-950 to-slate-900 dark:from-white dark:to-slate-400 bg-clip-text text-transparent tracking-tighter leading-none">
             {t('grading_history').split(' ')[0]} <span className="text-[#1dff2f] underline decoration-accent/10">{t('grading_history').split(' ').slice(1).join(' ')}.</span>
           </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
           <button 
             onClick={() => setIsModalOpen(true)}
             className="px-8 py-3.5 bg-slate-950 dark:bg-slate-800 text-[#1dff2f] rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:shadow-[#1dff2f]/20 transition-all flex items-center gap-3 active:scale-95 group"
           >
             <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
             {t('new_entry_btn')}
           </button>
           <button 
             onClick={fetchNotes}
             className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-[#1dff2f] hover:border-[#1dff2f] transition-all shadow-sm active:scale-95"
           >
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-4 items-center glass-card p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white/40 dark:bg-slate-900/40">
          <div className="flex-1 flex items-center gap-3 px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 group focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-[#1dff2f]/40 transition-all shadow-inner w-full">
             <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#1dff2f]" />
             <input
               type="text"
               placeholder={t('search_entry_placeholder')}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 w-full"
             />
          </div>

          <div className="flex items-center gap-5 px-6">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#1dff2f] rounded-full shadow-[0_0_10px_#1dff2f]" />
                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{notes.length} {t('total_entries')}</span>
             </div>
             <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-[#1dff2f] transition-all">
                <Filter className="w-4 h-4" />
             </button>
          </div>
      </div>

      {/* Table Section */}
       <div className="glass-card rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl bg-white/60 dark:bg-slate-900/60 transition-colors">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-slate-950 dark:bg-black text-[9px] font-black uppercase tracking-[0.3em] text-[#1dff2f]">
                 <th className="px-8 py-5">{t('date_col')}</th>
                 <th className="px-8 py-5">{t('student_col')}</th>
                 <th className="px-8 py-5">{t('subject_col')}</th>
                 <th className="px-8 py-5 text-center">{t('grade_col')}</th>
                 <th className="px-8 py-5 text-center">{t('type_col')}</th>
                 <th className="px-8 py-5 text-center">{t('status_col')}</th>
                 <th className="px-8 py-5 text-right">{t('actions_col')}</th>
               </tr>
             </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredNotes.length > 0 ? filteredNotes.map((note, idx) => (
                  <motion.tr 
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-[#1dff2f]/5 transition-colors group"
                  >
                     <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                           <Calendar className="w-3 h-3 text-slate-400" />
                         </div>
                         <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none">
                           {new Date(note.datenote).toLocaleDateString()}
                         </span>
                       </div>
                     </td>
                     <td className="px-8 py-6">
                       <div className="flex flex-col">
                         <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-tight">{note.etudiant.user.nom}</span>
                         <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{note.etudiant.user.prenom}</span>
                       </div>
                     </td>
                     <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1dff2f]/40" />
                          <span className="text-[10px] font-bold text-slate-900 dark:text-slate-200 uppercase italic">
                            {note.matiere.intitule || note.matiere.nom}
                          </span>
                       </div>
                     </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex items-center justify-center p-3 bg-slate-950 text-[#1dff2f] rounded-xl border border-[#1dff2f]/20 shadow-lg min-w-[50px]">
                        <span className="text-sm font-black tracking-tighter">{note.valeur.toFixed(1)}</span>
                      </div>
                    </td>
                     <td className="px-8 py-6 text-center">
                       <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[8px] font-black uppercase text-slate-400 border border-slate-200 dark:border-slate-700">
                         {note.typenote}
                       </span>
                     </td>
                     <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                           {note.statut === 'VALIDE' ? (
                             <div className="flex items-center gap-1 text-emerald-500">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-[7px] font-black uppercase tracking-widest">{t('validated_status')}</span>
                             </div>
                           ) : (
                             <div className="flex items-center gap-1 text-amber-500">
                                <Clock className="w-3 h-3" />
                                <span className="text-[7px] font-black uppercase tracking-widest">{t('pending_status')}</span>
                             </div>
                           )}
                        </div>
                     </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-[#1dff2f] hover:bg-[#1dff2f]/5 rounded-lg transition-all">
                             <ChevronRight className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                )) : (
                   <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <BookOpen className="w-12 h-12 text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-950 dark:text-white">{t('no_record_found')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <NouvelleNoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
      />
    </div>
  )
}
