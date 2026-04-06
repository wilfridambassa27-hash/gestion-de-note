// ============================================================
// NouvelleNoteModal.tsx
// Modal de saisie certifiée — Protocole Elite Bright v4.0 (OPTIMISÉ)
// Refonte ergonomique pour une visibilité immédiate du champ Note.
// ============================================================

'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  X,           
  Loader2,     
  BookOpen,    
  GraduationCap, 
  User,        
  Calendar,    
  Award,       
  Sparkles,    
  Check,       
  ShieldCheck, 
  Users,       
  Zap,
  ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'                 
import { useSession } from 'next-auth/react'            
import { useUI } from '@/context/UIContext'             

interface SessionUser {
  id: string
  role: string
  name?: string | null
}

interface Note {
  id?: string
  etudiantId: string   
  matiereId: string    
  semestreId: string   
  valeur: number       
  typenote: string     
  coefficient: number  
  datenote: string     
}

interface Classe {
  id: string
  nom: string
  filiere?: string 
}

interface Etudiant {
  id: string
  matricule: string   
  user: {
    nom: string
    prenom: string
  }
}

interface Matiere {
  id: string
  intitule: string
  credits?: number    
}

interface Semestre {
  id: string
  libelle: string           
  anneeacademique: string   
}

interface Props {
  isOpen: boolean               
  onClose: () => void           
  onSave: (note: Omit<Note, 'id'>) => void 
  editingNote?: Note | null     
}

export default function NouvelleNoteModal({
  isOpen,
  onClose,
  onSave,
  editingNote
}: Props) {
  const { data: session } = useSession() 
  const { t } = useUI()                  
  
  const [classes, setClasses] = useState<Classe[]>([])     
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]) 
  const [matieres, setMatieres] = useState<Matiere[]>([])  
  const [semestres, setSemestres] = useState<Semestre[]>([]) 

  const [selectedClasseId, setSelectedClasseId] = useState('')   
  const [selectedFiliere, setSelectedFiliere] = useState('')      
  const [etudiantId, setEtudiantId] = useState(editingNote?.etudiantId || '')  
  const [matiereId, setMatiereId] = useState(editingNote?.matiereId || '')     
  const [semestreId, setSemestreId] = useState(editingNote?.semestreId || '')  
  const [valeur, setValeur] = useState<number | ''>(editingNote?.valeur !== undefined ? editingNote.valeur : '')               
  const [typeEvaluation, setTypeEvaluation] = useState(editingNote?.typenote || 'CC') 
  const [coefficient, setCoefficient] = useState(editingNote?.coefficient || 1)     

  const [loading, setLoading] = useState(false)         
  const [fetchingData, setFetchingData] = useState(false) 

  const teacherName = session?.user?.name || 'Enseignant'
  const teacherId = (session?.user as any)?.role === 'ENSEIGNANT' ? (session?.user as any)?.id : ''

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      setFetchingData(true)
      const sessionQuery = session?.user?.academicSession ? `&session=${session.user.academicSession}` : ''
      
      Promise.all([
        fetch(`/api/classes?session=${session?.user?.academicSession || ''}`).then(res => res.json()),
        fetch('/api/semestres?actif=true').then(res => res.json())
      ]).then(([classesData, semestresData]) => {
        console.log('Classes reçues:', classesData)
        setClasses(Array.isArray(classesData) ? classesData : [])
        setSemestres(Array.isArray(semestresData) ? semestresData : [])
        if (semestresData.length > 0 && !semestreId) {
          setSemestreId(semestresData[0].id)
        }
        setFetchingData(false)
      }).catch((err) => {
        console.error('Erreur chargement initial:', err)
        setFetchingData(false)
      })
    }
  }, [isOpen, session, semestreId])

  useEffect(() => {
    if (selectedClasseId) {
      setLoading(true)
      const sessionQuery = session?.user?.academicSession ? `&session=${session.user.academicSession}` : ''
      
      Promise.all([
        fetch(`/api/classes/${selectedClasseId}/etudiants`).then(res => res.json()),
        fetch(`/api/matieres?classeId=${selectedClasseId}${sessionQuery}&teacherId=${teacherId}`).then(res => res.json())
      ]).then(([etudData, matData]) => {
        console.log('Données classe chargées:', { etudiants: etudData, matieres: matData })
        setEtudiants(Array.isArray(etudData) ? etudData : [])
        setMatieres(Array.isArray(matData) ? matData : [])
        
        const cls = classes.find(c => c.id === selectedClasseId)
        if (cls?.filiere) setSelectedFiliere(cls.filiere)
        
        setLoading(false)
      }).catch((err) => {
        console.error('Erreur chargement classe:', err)
        setLoading(false)
      })
    }
  }, [selectedClasseId, session, classes, teacherId])

  const selectedStudent = useMemo(() => etudiants.find(e => e.id === etudiantId), [etudiants, etudiantId])
  const selectedMatiere = useMemo(() => matieres.find(m => m.id === matiereId), [matieres, matiereId])
  const handleActions = async (actionType: string) => {
    if (actionType === 'actualiser') {
      setEtudiantId('')
      setValeur('')
      toast("Formulaire vidé")
      return
    }

    if (actionType === 'valider') {
      if (valeur === '' || Number(valeur) > 20 || Number(valeur) < 0) {
        toast.error("Note invalide (0-20)")
        return
      }
      toast.success("Validation OK")
    }

    if (actionType === 'enregistrer') {
      if (!etudiantId) {
        toast.error("Veuillez sélectionner un Étudiant.")
        return
      }
      if (!matiereId) {
        toast.error("Veuillez sélectionner une Matière (UE).")
        return
      }
      if (valeur === '') {
        toast.error("Veuillez saisir une Note.")
        return
      }
      if (!semestreId) {
        toast.error("Session académique non identifiée. Veuillez vérifier votre connexion.")
        return
      }

      setLoading(true)
      try {
        const response = await fetch('/api/retrographie/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matricule: etudiantId,
            id_matiere: matiereId,
            note: valeur,
            id_semestre: semestreId,
            date_saisie: new Date().toISOString()
          })
        })

        if (response.ok) {
          toast.success("Note certifiée & enregistrée !")
          onSave({ etudiantId, matiereId, semestreId, valeur: Number(valeur), typenote: typeEvaluation, coefficient: coefficient, datenote: new Date().toISOString() })
          setValeur('')
          setEtudiantId('')
        } else {
          toast.error("Erreur d'enregistrement")
        }
      } catch (err) {
        toast.error("Erreur technique")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 font-[Outfit]">
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-3xl" 
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }} 
            className="bg-white rounded-[3rem] w-full max-w-6xl shadow-2xl relative overflow-hidden flex flex-col xl:flex-row max-h-[92vh]"
          >
            {/* Sidebar (Desktop) */}
            <div className="hidden xl:flex xl:w-[320px] bg-slate-950 p-10 flex-col justify-between relative overflow-hidden shrink-0">
               <div className="absolute top-0 right-0 w-60 h-60 bg-[#1dff2f]/5 blur-[80px] rounded-full -mr-32 -mt-32" />
               
               <div className="relative z-10 space-y-12">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-[#1dff2f] rounded-2xl flex items-center justify-center shadow-lg">
                       <ShieldCheck className="w-8 h-8 text-black" />
                    </div>
                    <div className="space-y-1">
                       <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Elite <span className="text-[#1dff2f]">Bright.</span></h2>
                       <p className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.4em]">Certification v4.1</p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-white/5">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#1dff2f]">Enseignant</p>
                        <p className="text-sm font-bold text-white truncate">{teacherName}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Localisation</p>
                        <p className="text-xs font-bold text-slate-300 uppercase leading-snug">
                           {selectedClasseId ? classes.find(c => c.id === selectedClasseId)?.nom : 'Attente...'} <br/>
                           <span className="text-[#1dff2f] italic opacity-60">{selectedFiliere || 'Filière...'}</span>
                        </p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Cible Étudiante</p>
                        <p className="text-xs font-bold text-white uppercase italic">
                           {selectedStudent ? `${selectedStudent.user.nom} ${selectedStudent.user.prenom}` : 'Non Identifié'}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="relative z-10 flex items-center gap-3 opacity-40">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1dff2f] animate-pulse" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">{t('pro_suite')}</span>
               </div>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 p-6 md:p-10 bg-slate-50 overflow-y-auto custom-scrollbar">
               
               <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Saisie de <span className="text-[#1dff2f]">Note.</span></h3>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Compléter tous les index obligatoires</p>
                  </div>
                  <button onClick={onClose} className="p-3 bg-white hover:bg-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-950 border border-slate-100 shadow-sm">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="space-y-6">
                  {/* CRITICAL ROW: Student Selection + Note Input */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                     {/* Halo décoratif sur l'élément actif */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#1dff2f]/10 blur-[50px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

                     {/* 1. Étudiant Select */}
                     <div className="lg:col-span-2 space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 px-2">
                           <Users className="w-3.5 h-3.5 text-slate-950" /> 1. Nom de l&apos;Étudiant
                        </label>
                        <div className="relative">
                           <select 
                             value={etudiantId} 
                             onChange={(e) => setEtudiantId(e.target.value)} 
                             disabled={!selectedClasseId || loading} 
                             className="w-full bg-slate-100 text-slate-950 border-2 border-transparent focus:border-[#1dff2f] focus:bg-white outline-none rounded-2xl px-6 py-4 text-base font-black shadow-sm transition-all disabled:opacity-20 uppercase appearance-none" 
                             required
                           >
                              <option value="">-- {loading ? 'Chargement...' : 'Sélectionner Étudiant'} --</option>
                              {etudiants.map(e => ( 
                                <option key={e.id} value={e.id} className="text-black">
                                   {e.user.nom} {e.user.prenom}
                                </option> 
                              ))}
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                     </div>

                     {/* MAIN FIELD: The Grade /20 */}
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-[#1dff2f] flex items-center gap-2 px-2">
                           <Zap className="w-3.5 h-3.5" /> Note / 20
                        </label>
                        <input 
                           type="number" 
                           min="0" 
                           max="20" 
                           step="0.1" 
                           value={valeur} 
                           onChange={(e) => {
                              const val = e.target.value
                              setValeur(val === '' ? '' : parseFloat(val))
                           }} 
                           placeholder="00.0"
                           className="w-full h-[68px] bg-slate-950 text-[#1dff2f] rounded-2xl text-3xl font-black text-center shadow-xl border-4 border-transparent focus:border-[#1dff2f]/50 outline-none transition-all placeholder:opacity-20" 
                           required 
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {/* 3. Promotion (Classe) */}
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 px-2">
                           <GraduationCap className="w-3.5 h-3.5 text-slate-900" /> 3. Promotion (Classe)
                        </label>
                        <div className="relative">
                           <select 
                              value={selectedClasseId} 
                              onChange={(e) => setSelectedClasseId(e.target.value)} 
                              className="w-full bg-white border border-slate-200 focus:border-[#1dff2f] outline-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider shadow-sm appearance-none transition-all" 
                              required
                           >
                              <option value="">{fetchingData ? 'Sync...' : '-- Sélection Classe --'}</option>
                              {classes.map(c => ( <option key={c.id} value={c.id}>{c.nom}</option> ))}
                           </select>
                           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                     </div>

                     {/* 5. Matière */}
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 px-2">
                           <BookOpen className="w-3.5 h-3.5 text-slate-900" /> 5. Matière (Crédit)
                        </label>
                        <div className="relative">
                           <select 
                              value={matiereId} 
                              onChange={(e) => setMatiereId(e.target.value)} 
                              disabled={!selectedClasseId || loading} 
                              className="w-full bg-white border border-slate-200 focus:border-[#1dff2f] outline-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider shadow-sm disabled:opacity-20 appearance-none transition-all" 
                              required
                           >
                              <option value="">-- {loading ? '...' : 'Choisir Matière'} --</option>
                              {matieres.map(m => ( <option key={m.id} value={m.id}>{m.intitule} ({m.credits} CR)</option> ))}
                           </select>
                           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                     </div>

                     {/* 4. Matricule (Read only select looking) */}
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 px-2">
                           <ShieldCheck className="w-3.5 h-3.5 text-slate-900" /> 4. Matricule ID
                        </label>
                        <div className="w-full bg-slate-900 text-[#1dff2f] rounded-xl px-4 py-3 text-xs font-black tracking-[0.2em] shadow-lg flex items-center justify-center min-h-[46px]">
                           {selectedStudent?.matricule || '---'}
                        </div>
                     </div>

                     {/* 8. Evaluation Type */}
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 px-2">
                           <Zap className="w-3.5 h-3.5 text-slate-900" /> Type d'Éval
                        </label>
                        <div className="relative">
                           <select 
                              value={typeEvaluation} 
                              onChange={(e) => setTypeEvaluation(e.target.value)} 
                              className="w-full bg-white border border-slate-200 focus:border-[#1dff2f] outline-none rounded-xl px-4 py-3 text-[10px] font-black uppercase appearance-none transition-all" 
                              required
                           >
                              <option value="CC">Contrôle Continu (CC)</option>
                              <option value="DS">Devoir Surveillé (DS)</option>
                              <option value="EXAM">Examen Final (EXAM)</option>
                              <option value="TP">Travaux Pratiques (TP)</option>
                           </select>
                           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                     </div>

                     {/* 9. Coeff */}
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 px-2">
                           <Sparkles className="w-3.5 h-3.5 text-slate-900" /> Crédit (UE)
                        </label>
                        <input 
                           type="number"
                           min="1"
                           max="10"
                           value={coefficient} 
                           onChange={(e) => setCoefficient(parseInt(e.target.value) || 1)} 
                           className="w-full bg-white border border-slate-200 focus:border-[#1dff2f] outline-none rounded-xl px-4 py-3 text-[10px] font-black shadow-sm transition-all" 
                           required
                        />
                     </div>

                     {/* 7. Semestre (Compact) */}
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 px-2">
                           <Calendar className="w-3.5 h-3.5 text-slate-900" /> 7. Semestre
                        </label>
                        <div className="relative">
                           <select 
                              value={semestreId} 
                              onChange={(e) => setSemestreId(e.target.value)} 
                              className="w-full bg-white border border-slate-200 focus:border-[#1dff2f] outline-none rounded-xl px-4 py-3 text-[10px] font-black uppercase appearance-none transition-all" 
                              required
                           >
                              {semestres.map(s => ( <option key={s.id} value={s.id}>{s.libelle}</option> ))}
                           </select>
                           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                     </div>
                  </div>

                  {/* BOTTOM ACTION BAR (Elite Triple standard) */}
                  <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row gap-4">
                     <button 
                        type="button" 
                        onClick={() => handleActions('actualiser')}
                        className="flex-1 h-16 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[1rem] font-black text-[10px] uppercase tracking-widest transition-all"
                     >
                        Actualiser
                     </button>
                     <button 
                        type="button" 
                        onClick={() => handleActions('valider')}
                        className="flex-1 h-16 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-[1rem] font-black text-[10px] uppercase tracking-widest transition-all"
                     >
                        Valider
                     </button>
                     <button 
                        type="button" 
                        onClick={() => handleActions('enregistrer')}
                        disabled={loading || fetchingData}
                        className="flex-[2] h-16 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 rounded-[1rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                     >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        CERTIFIER & ENREGISTRER
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
