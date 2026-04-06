'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Loader2, 
  GraduationCap, 
  Search,
  Filter,
  CheckCircle2,
  Lock,
  ChevronRight,
  School,
} from 'lucide-react'
import { Zap } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Classe {
  id: string
  nom: string
  filiere?: string
  niveau?: string
  anneeacademique?: string
}

export default function MesClassesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [classes, setClasses] = useState<Classe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all')

  useEffect(() => {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        setClasses(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        toast.error('Erreur de chargement des données.')
        setLoading(false)
      })
  }, [])

  const filteredClasses = classes.filter(c => 
    c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.filiere?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectClass = (c: Classe) => {
    // Redirect to verification with target class info
    router.push(`/etudiant/verification?targetClassId=${c.id}&className=${encodeURIComponent(c.nom)}`)
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Initialisation du registre...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <Toaster position="top-center" />
      
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-emerald-500/10 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 dark:bg-emerald-500/5 rounded-full -mr-48 -mt-48 transition-transform group-hover:scale-110 blur-3xl opacity-60" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-600/30 shrink-0 transform -rotate-12">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-3">Mes Classes.</h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs max-w-md leading-loose">
                Explorez le registre complet des classes enregistrées. Sélectionnez l'entité que vous souhaitez identifier.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
             <button 
               onClick={() => {
                 // Open a small modal or redirect to a page with QR
                 // For now, let's just make it consistent and redirect to dashboard where QR is handled
                 // OR implement the same modal here.
                 // The user wants it "dans la session mes classes".
                 router.push('/etudiant?showQR=true')
               }}
               className="px-8 py-3 bg-black text-[#1dff2f] border border-[#1dff2f]/30 rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-neon hover:bg-[#1dff2f] hover:text-black transition-all flex items-center gap-3"
             >
                <Zap className="w-4 h-4" />
                GÉNÉRER QR CODE
             </button>
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[2rem] shadow-inner">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Registre Global
                </button>
                <button 
                  onClick={() => setActiveTab('mine')}
                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mine' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Ma Filière
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Registry Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between px-4">
         <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher une classe, filière, niveau..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-16 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] pl-16 pr-6 text-sm font-bold shadow-xl shadow-slate-200/50 dark:shadow-none focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
            />
         </div>
         <div className="flex items-center gap-4 text-slate-400">
            <Filter className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{filteredClasses.length} Entrées trouvées</span>
         </div>
      </div>

      {/* Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 px-4">
        <AnimatePresence>
          {filteredClasses.map((item, idx) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ y: -5 }}
              className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all"
            >
               <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 bg-slate-950 text-[#1dff2f] rounded-[1.2rem] flex items-center justify-center font-black text-2xl shadow-xl transform -rotate-12 group-hover:rotate-0 transition-all duration-500 border-2 border-[#1dff2f]/20">
                    {item.nom.charAt(0)}
                  </div>
                  <div className="px-5 py-2 bg-[#1dff2f]/10 rounded-full border border-[#1dff2f]/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1dff2f] truncate">{item.anneeacademique}</span>
                  </div>
               </div>
               
               <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Entité Académique</p>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight group-hover:text-emerald-600 transition-colors">
                    {item.nom}
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-2">
                     <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                       <CheckCircle2 className="w-3 h-3" /> {item.filiere || 'Filière Initiale'}
                     </span>
                     <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                       <School className="w-3 h-3" /> {item.niveau || 'Licence'}
                     </span>
                  </div>
               </div>

               <button 
                 onClick={() => handleSelectClass(item)}
                 className="w-full py-5 bg-slate-950 text-[#1dff2f] rounded-[1.5rem] flex items-center justify-center gap-4 font-black text-[10px] uppercase tracking-[0.3em] group/btn active:scale-95 transition-all shadow-2xl shadow-slate-950/20 relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-[#1dff2f]/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <Lock className="w-4 h-4 text-[#1dff2f]" />
                  <span>IDENTIFIER & ACCÉDER</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
               </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredClasses.length === 0 && (
         <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-40">
               <Search className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Aucun résultat pour cette recherche.</p>
         </div>
      )}
    </div>
  )
}
