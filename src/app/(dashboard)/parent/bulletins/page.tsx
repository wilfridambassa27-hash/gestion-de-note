'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, Download, Printer, User, Search, ChevronDown, Sparkles
} from 'lucide-react'
import { PremiumRefresh } from '@/components/PremiumUI'
import { toast } from 'react-hot-toast'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function ParentBulletinsPage() {
  const [loading, setLoading] = useState(false)
  const [selectedEnfant, setSelectedEnfant] = useState('1')
  
  // Mock data for Phase 3 visual presentation
  const enfants = [
    { id: '1', nom: 'Dubois Lucas', classe: 'Terminales S' },
    { id: '2', nom: 'Dubois Emma', classe: '1ère ES' }
  ]

  const periodes = [
    { id: 'S1', label: 'Semestre 1 - 2024/2025', status: 'Disponible' },
    { id: 'S2', label: 'Semestre 2 - 2024/2025', status: 'En cours' }
  ]

  const notesRecentes = [
    { matiere: 'Mathématiques', note: 16.5, type: 'Devoir Surveillé', date: '12 Mars 2025', prof: 'M. Dupont' },
    { matiere: 'Physique-Chimie', note: 14.0, type: 'TP', date: '10 Mars 2025', prof: 'Mme. Martin' },
    { matiere: 'SVT', note: 15.5, type: 'Interrogation', date: '08 Mars 2025', prof: 'M. Bernard' },
  ]

  const handleDownloadPDF = async (periodeLabel: string) => {
    toast.success('Génération du PDF officiel en cours...')
    setLoading(true)
    
    try {
      const enfant = enfants.find(e => e.id === selectedEnfant)
      if (!enfant) throw new Error("Enfant non trouvé")

      // Initialize jsPDF
      const doc = new jsPDF()
      
      // Elite V4.0 Branding Header
      doc.setFillColor(0, 0, 51) // Navy Blue
      doc.rect(0, 0, 210, 40, 'F')
      
      doc.setTextColor(212, 175, 55) // Gold
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('EDUNOTES', 105, 20, { align: 'center' })
      
      doc.setFontSize(10)
      doc.text('RÉPUBLIQUE FRANÇAISE - MINISTÈRE DE L\'ÉDUCATION', 105, 30, { align: 'center' })

      // Student Info
      doc.setTextColor(0, 0, 51)
      doc.setFontSize(14)
      doc.text('BULLETIN SCOLAIRE OFFICIEL', 105, 55, { align: 'center' })
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Élève : ${enfant.nom}`, 20, 75)
      doc.text(`Classe : ${enfant.classe}`, 20, 82)
      doc.text(`Période : ${periodeLabel}`, 20, 89)
      
      // AutoTable for Grades
      const tableData = notesRecentes.map(n => [
        n.matiere,
        n.prof,
        n.note.toFixed(2),
        '12.50', // Mock class average
        'Bon travail continu.' // Mock appreciation
      ])

      // @ts-ignore
      doc.autoTable({
        startY: 100,
        head: [['Matière', 'Professeur', 'Moyenne', 'Moy. Classe', 'Appréciation']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 51], textColor: [212, 175, 55], fontStyle: 'bold' },
        styles: { font: 'helvetica', fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 250, 255] }
      })

      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 150
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.text('Document généré électroniquement par EduNotes Elite V4.0.', 105, finalY + 30, { align: 'center' })

      doc.save(`Bulletin_${enfant.nom.replace(' ', '_')}_${periodeLabel}.pdf`)
      
      toast.success('Bulletin Elite V4.0 téléchargé avec succès.', { icon: '📄' })
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la génération du PDF.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-[7px] uppercase tracking-[0.4em] mb-1">
             <Sparkles className="w-3.5 h-3.5 animate-pulse" />
             DOCUMENTS OFFICIELS • ELITE V4.0
          </div>
          <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tighter leading-none">
            BULLETINS <span className="text-emerald-600">& NOTES.</span>
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-2">Consultez et téléchargez les relevés de notes.</p>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Enfant Selector */}
           <div className="relative group">
              <select 
                 value={selectedEnfant}
                 onChange={(e) => setSelectedEnfant(e.target.value)}
                 className="appearance-none pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-950 focus:border-emerald-600 outline-none shadow-sm cursor-pointer min-w-[200px]"
              >
                 {enfants.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
           </div>
           
           <PremiumRefresh onClick={() => {}} refreshing={loading} label="ACTUALISER" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Bulletins Officiels */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Bulletins Périodiques</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {periodes.map((periode, idx) => (
                 <div key={idx} className="glass-card bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/5 blur-[30px] rounded-full -mr-12 -mt-12 transition-all duration-700 group-hover:bg-slate-900/10" />
                    
                    <div className="flex items-start justify-between mb-8 relative z-10">
                       <div className="w-12 h-12 bg-[#F8FAFF] rounded-xl flex items-center justify-center border border-slate-100">
                          <FileText className="w-5 h-5 text-slate-900" />
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                         periode.status === 'Disponible' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                       }`}>
                          {periode.status}
                       </span>
                    </div>
                    
                    <div className="relative z-10 mb-8">
                       <h3 className="text-sm font-black text-slate-950 tracking-tight">{periode.label}</h3>
                       <p className="text-[10px] text-slate-500 font-bold mt-1">Bulletin certifié EduNotes.</p>
                    </div>

                    <button 
                       onClick={() => handleDownloadPDF(periode.label)}
                       disabled={periode.status !== 'Disponible'}
                       className="w-full relative z-10 p-3 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-slate-900/40 active:scale-95"
                    >
                       {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                       TÉLÉCHARGER LE PDF
                    </button>
                 </div>
               ))}
            </div>
         </div>

         {/* Notes Récentes */}
         <div className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Dernières Évaluations</h2>
            
            <div className="glass-card bg-slate-950 rounded-[2rem] p-6 shadow-2xl shadow-slate-900/40 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/10 blur-[60px] rounded-full -mr-20 -mt-20 pointer-events-none" />
               
               <div className="space-y-4 relative z-10">
                  {notesRecentes.map((note, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-white uppercase tracking-wider">{note.matiere}</span>
                          <span className="text-lg font-black text-emerald-600 leading-none">{note.note.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-400">{note.type}</span>
                          <span className="text-white/40 italic">{note.date}</span>
                       </div>
                    </div>
                  ))}
               </div>

               <button className="w-full mt-6 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border border-white/10">
                  Voir tout l'historique
               </button>
            </div>
         </div>
      </div>
    </div>
  )
}
