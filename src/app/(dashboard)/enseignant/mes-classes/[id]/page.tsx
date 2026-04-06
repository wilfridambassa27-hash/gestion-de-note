'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Target,
  Search,
  Loader2,
  Award,
  Sparkles,
  Info,
  Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'

interface Student {
  id: string
  matricule: string
  sexe?: string
  tuteurtelephone?: string
  user: {
    nom: string
    prenom: string
  }
}

interface ClassData {
  id: string
  nom: string
  filiere: string
  niveau: string
  anneeacademique: string
  capacitemax?: number
  professeurPrincipal?: {
    user: {
      nom: string
      prenom: string
    }
  }
  matieres?: Array<{
    id: string
    code: string
    nom: string
    intitule?: string
    coefficient?: number
  }>
}

export default function ClasseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [classe, setClasse] = useState<ClassData | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [classeRes, studentsRes] = await Promise.all([
          fetch(`/api/classes/${id}`),
          fetch(`/api/classes/${id}/etudiants`)
        ])
        
        if (classeRes.ok && studentsRes.ok) {
          setClasse(await classeRes.json())
          setStudents(await studentsRes.json())
        }
      } catch (error) {
        console.error('Error fetching class data:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  const filteredStudents = students.filter(s => 
    s.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-slate-100 border-t-[#1dff2f] rounded-full shadow-2xl"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Accès au registre sécurisé...</p>
      </div>
    )
  }

  if (!classe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="text-center space-y-6">
           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto border border-slate-100 text-slate-300">
              <Info className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Classe non trouvée</h2>
           <button onClick={() => router.back()} className="px-8 py-3 bg-slate-950 text-[#1dff2f] rounded-full font-black text-[10px] uppercase tracking-widest">
              Retour au répertoire
           </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 font-[Outfit] space-y-10 animate-in fade-in duration-700">
      
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
         <div className="space-y-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-950 transition-colors group"
            >
               <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retour au Dashboard</span>
            </button>
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-[#1dff2f] rounded-full shadow-neon" />
                  <h1 className="text-4xl font-black text-slate-950 tracking-tighter uppercase leading-none">
                     {classe.nom} <span className="text-[#1dff2f]">.</span>
                  </h1>
               </div>
               <p className="text-slate-400 font-bold tracking-widest text-[11px] ml-4">
                  {classe.filiere} • {classe.niveau} • {classe.anneeacademique}
               </p>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="px-8 py-4 bg-white border-2 border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-lg">
               <span className="text-[8px] font-black uppercase tracking-widest text-[#1dff2f]">Période Active</span>
               <span className="text-sm font-black text-slate-950 tracking-tighter leading-none mt-1">SEMESTRE 1</span>
            </div>
            <div className="px-8 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Effectif total</span>
               <span className="text-2xl font-black text-slate-950 tracking-tighter leading-none mt-1">{students.length}</span>
            </div>
            <div className="px-8 py-4 bg-slate-950 text-[#1dff2f] rounded-[2rem] flex flex-col items-center justify-center text-center shadow-xl shadow-[#1dff2f]/10">
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Capacité Max</span>
               <span className="text-2xl font-black text-white tracking-tighter leading-none mt-1">{classe.capacitemax || 40}</span>
            </div>
         </div>
      </div>

      {/* Detailed Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Academic Trends (Read Only) */}
         <div className="lg:col-span-2 space-y-8">
            <div className="glass-card rounded-[3rem] border border-slate-100 p-8 shadow-xl bg-white/60">
               <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter">Displines Assignées</h3>
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Programme pédagogique certifié</p>
                  </div>
                  <BookOpen className="w-6 h-6 text-[#1dff2f]" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classe.matieres && classe.matieres.length > 0 ? classe.matieres.map((m, idx) => (
                     <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-[#1dff2f]/30 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-950 text-[#1dff2f] rounded-xl flex items-center justify-center font-black">
                              {m.coefficient || '3'}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-950 uppercase truncate max-w-[150px]">{m.intitule || m.nom}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Code: {m.code || 'GEN-01'}</span>
                           </div>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity" />
                     </div>
                  )) : (
                     <p className="text-center text-[10px] font-bold text-slate-400 py-10">Aucune matière enregistrée pour cette classe.</p>
                  )}
               </div>
            </div>

            <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#1dff2f]/5 blur-[80px] rounded-full -mr-32 -mt-32" />
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                     <div className="w-20 h-20 bg-[#1dff2f] rounded-[2rem] flex items-center justify-center shadow-neon">
                        <GraduationCap className="w-10 h-10 text-black" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#1dff2f]">Titularat</p>
                        <h4 className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">Professeur Principal</h4>
                        <p className="text-sm font-bold opacity-60 italic">{classe.professeurPrincipal?.user?.nom || 'Non assigné'} {classe.professeurPrincipal?.user?.prenom || ''}</p>
                     </div>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
                  <div className="text-right">
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#1dff2f] mb-1">Status Session</p>
                     <p className="text-xs font-bold uppercase tracking-widest leading-none">Période d'évaluation en cours</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Class Performance Sidebar (Read Only) */}
         <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950 mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#1dff2f]" /> Performance Index
               </h4>
               <div className="space-y-6">
                  {[
                     { label: "Majors de promo", count: "05", color: "bg-emerald-500" },
                     { label: "Moyennes (10-15)", count: "24", color: "bg-amber-500" },
                     { label: "En difficulté", count: "02", color: "bg-rose-500" },
                  ].map((p, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                           <span className="text-slate-400">{p.label}</span>
                           <span className="text-slate-950">{p.count} ÉLÈVES</span>
                        </div>
                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(parseInt(p.count)/students.length)*100}%` }}
                              className={`h-full ${p.color}`} 
                           />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8">
               <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-[#1dff2f]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-950">Informations Clés</span>
               </div>
               <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                  "Ce registre est une vue en temps réel du serveur central. Toutes les données, y compris les crédits et les effectifs, sont verrouillées par l'administration."
               </p>
            </div>
         </div>

      </div>

      {/* Enrolled Students Table (Read Only) */}
      <div className="bg-white border border-slate-100 rounded-[3.5rem] shadow-2xl overflow-hidden">
         <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
            <div className="space-y-1">
               <h2 className="text-xl font-black text-slate-950 tracking-tighter uppercase">Registre des Étudiants</h2>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Liste officielle certifiée par l'administration</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-inner w-full max-w-md">
               <Search className="w-4 h-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="RECHERCHER UN ÉTUDIANT..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-[10px] font-black text-slate-950 placeholder:text-slate-300 w-full tracking-widest"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-50 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
                     <th className="px-10 py-6">ID / Matricule</th>
                     <th className="px-10 py-6">Nom Complet</th>
                     <th className="px-10 py-6">Genre</th>
                     <th className="px-10 py-6">Contact Parent</th>
                     <th className="px-10 py-6 text-right">Statut</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50/50">
                  <AnimatePresence>
                     {filteredStudents.map((student, idx) => (
                        <motion.tr 
                           key={student.id}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ delay: idx * 0.02 }}
                           className="hover:bg-slate-50/50 transition-colors group"
                        >
                           <td className="px-10 py-6">
                              <span className="px-3 py-1 bg-slate-950 text-[#1dff2f] rounded-lg text-[9px] font-black uppercase tracking-widest">
                                 {student.matricule}
                              </span>
                           </td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-[#1dff2f]/10 text-slate-950 rounded-xl flex items-center justify-center font-black text-[12px] group-hover:bg-[#1dff2f] group-hover:text-black transition-colors">
                                    {String(student.user.nom).charAt(0)}{String(student.user.prenom).charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-950 uppercase tracking-tight leading-none">{student.user.nom}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{student.user.prenom}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-6 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                              {student.sexe || 'N/A'}
                           </td>
                           <td className="px-10 py-6 text-[11px] font-bold text-slate-600">
                              {student.tuteurtelephone || 'N/A'}
                           </td>
                           <td className="px-10 py-6 text-right">
                              <div className="inline-flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 bg-[#1dff2f] rounded-full animate-pulse shadow-neon" />
                                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">Actif</span>
                              </div>
                           </td>
                        </motion.tr>
                     ))}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>

         {filteredStudents.length === 0 && (
            <div className="py-20 text-center space-y-4 opacity-30">
               <Users className="w-12 h-12 mx-auto text-slate-300" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Aucun étudiant identifié</p>
            </div>
         )}
      </div>

      {/* Footer Info Box */}
      <div className="p-8 bg-slate-950 rounded-[2.5rem] relative overflow-hidden group">
         <div className="absolute right-0 top-0 w-64 h-64 bg-[#1dff2f]/10 blur-[80px] rounded-full -mr-32 -mt-32 transition-all group-hover:scale-150 duration-700" />
         <div className="relative z-10 flex items-center gap-4">
            <Sparkles className="w-6 h-6 text-[#1dff2f]" />
            <p className="text-white font-bold tracking-wide uppercase text-[12px]">
               Ces données sont synchronisées avec le serveur central de l'administration. <span className="text-[#1dff2f]">Modification restreinte.</span>
            </p>
         </div>
      </div>

    </div>
  )
}
