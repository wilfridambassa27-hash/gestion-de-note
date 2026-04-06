'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Loader2, 
  Download, 
  ChevronLeft, 
  AlertCircle,
  FileText,
  ShieldCheck,
  CheckCircle,
  QrCode
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface TranscriptNote {
  id: string
  valeur: number
  matiere: {
    code: string
    intitule: string
    credits: number
  }
}

interface TranscriptSemester {
  moyenne: number
  creditsAcquis: number
  creditsTotal: number
  semestre: {
    id: string
    libelle: string
  }
  notes: TranscriptNote[]
}

interface TranscriptData {
  student: {
    nom: string
    prenom: string
    matricule: string
    datenaissance?: string
    lieunaissance?: string
    classe?: string
    filiere?: string
    niveau?: string
    anneeacademique: string
  }
  semesters: TranscriptSemester[]
  annualMoyenne: number
  annualCreditsAcquis: number
  annualCreditsTotal: number
  error?: string
}

export default function OfficialTranscriptPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<TranscriptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isVerified = sessionStorage.getItem('edunotes_class_verified') === 'true'
    if (!isVerified) {
      router.push('/etudiant/verification')
      return
    }

    fetch('/api/etudiant/transcript')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        toast.error('Erreur de chargement')
        setLoading(false)
      })
  }, [router])

  const handleDownloadPDF = async () => {
    if (!printRef.current || !data) return
    
    setPdfLoading(true)
    const toastId = toast.loading('Génération du relevé officiel PDF...')
    
    try {
      const element = printRef.current
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Releve_Officiel_${data.student.matricule}.pdf`)
      
      toast.success('Réussite ! Votre relevé est certifié.', { id: toastId })
    } catch (error) {
      console.error('Erreur PDF:', error)
      toast.error('Échec de la génération du PDF', { id: toastId })
    } finally {
      setPdfLoading(false)
    }
  }

  const getMentionLabel = (moy: number) => {
    if (moy >= 16) return 'A - Excellent'
    if (moy >= 14) return 'B - Très Bien'
    if (moy >= 12) return 'C - Assez Bien'
    if (moy >= 10) return 'D - Passable'
    return 'E - Échec'
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Authentification en cours...</p>
      </div>
    )
  }

  if (!data || data.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Erreur Système</h1>
        <p className="text-slate-500 max-w-md mt-2 font-bold italic">{data?.error || 'Impossible de générer le relevé.'}</p>
        <button onClick={() => router.back()} className="mt-8 px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Retour</button>
      </div>
    )
  }

  const { student, semesters, annualMoyenne, annualCreditsAcquis, annualCreditsTotal } = data

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 py-10 px-4 flex flex-col items-center gap-8">
      <Toaster position="top-center" />
      
      {/* Barre de Contrôle */}
      <div className="w-full max-w-[210mm] flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-2xl border border-emerald-50 dark:border-slate-800 print:hidden">
         <button 
           onClick={() => router.back()}
           className="flex items-center gap-2 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest"
         >
           <ChevronLeft className="w-4 h-4" /> Retour Dashboard
         </button>
         
         <div className="flex items-center gap-4">
            <button 
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="flex items-center gap-3 px-8 py-3 bg-slate-950 text-white rounded-xl shadow-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-emerald-400" />}
              Télécharger Relevé Certifié
            </button>
         </div>
      </div>

      {/* --- TEMPLATE OFFICIEL DU RELEVÉ --- */}
      <div 
        ref={printRef}
        className="bg-white p-12 w-[210mm] min-h-[297mm] mx-auto text-[10px] text-slate-800 leading-tight shadow-2xl relative print:shadow-none print:m-0"
      >
        {/* Filigrane IUG */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
           <span className="text-[180px] font-black -rotate-45 uppercase select-none">IUG OFFICIAL</span>
        </div>

        {/* HEADER : LOGOS ET ENTÊTE */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8 relative z-10">
          <div className="text-center w-1/3 space-y-1">
            <div className="w-20 h-20 border-2 border-emerald-900 mx-auto flex items-center justify-center font-black text-2xl text-emerald-900 italic">IUG</div>
            <p className="font-black text-[9px] uppercase tracking-tighter leading-none pt-2">INSTITUT UNIVERSITAIRE<br/>DU GOLFE DE GUINEE</p>
            <p className="text-[7px] font-bold text-slate-500 uppercase">BP 12489 Douala | Tel: (237) 23 43 04 52</p>
          </div>
          <div className="text-center w-1/3 pt-4">
            <h1 className="text-lg font-black underline underline-offset-4 decoration-emerald-500 decoration-4">RELEVE DE NOTES / MARKS TRANSCRIPT</h1>
            <p className="font-black text-emerald-600 tracking-widest mt-2">ID N°: {student.matricule}</p>
          </div>
          <div className="w-1/3 text-right">
             <div className="inline-block border-2 border-slate-900 px-4 py-1 text-center">
                <span className="block font-black text-[12px] italic">ISTA</span>
                <span className="block text-[6px] font-bold uppercase tracking-widest">Technologies Avancées</span>
             </div>
          </div>
        </div>

        {/* INFOS ÉTUDIANT */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 mb-8 border-2 border-slate-900 p-5 rounded-sm bg-slate-50 relative z-10">
          <div className="uppercase"><span className="font-black italic">Nom et Prénom :</span><br/><span className="text-[11px] font-black underline">{student.nom} {student.prenom}</span></div>
          <div className="uppercase"><span className="font-black italic">Matricule :</span><br/><span className="text-[11px] font-black text-rose-600">{student.matricule}</span></div>
          <div className="uppercase"><span className="font-black italic">Date de Naissance :</span><br/><span className="font-bold">{student.datenaissance ? new Date(student.datenaissance).toLocaleDateString('fr-FR') : '---'} à {student.lieunaissance || '---'}</span></div>
          <div className="uppercase"><span className="font-black italic">Année Académique :</span><br/><span className="font-bold">{student.anneeacademique}</span></div>
          <div className="uppercase"><span className="font-black italic">Filière :</span><br/><span className="font-bold">{student.filiere || student.classe}</span></div>
          <div className="uppercase"><span className="font-black italic">Parcours :</span><br/><span className="font-bold italic text-emerald-900">{student?.niveau || 'L1'} - {student.classe}</span></div>
        </div>

        {/* TABLEAU DES NOTES (Structure par Semestre) */}
        <table className="w-full border-collapse border-2 border-slate-900 relative z-10">
          <thead>
            <tr className="bg-slate-900 text-white font-black text-center uppercase tracking-widest text-[8px]">
              <th className="border border-white/20 p-2 w-16">Code UE</th>
              <th className="border border-white/20 p-2">Intitulé de l'Unité d'Enseignement</th>
              <th className="border border-white/20 p-2 w-20">Moyenne UE</th>
              <th className="border border-white/20 p-2 w-14">Crédits</th>
              <th className="border border-white/20 p-2 w-20">Note/20</th>
              <th className="border border-white/20 p-2 w-14">Mn.</th>
              <th className="border border-white/20 p-2 w-16">Session</th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((sem, sIdx) => (
              <React.Fragment key={sem.semestre.id}>
                <tr className="bg-emerald-50 border-y-2 border-slate-900 font-black">
                  <td colSpan={7} className="p-2 pl-4 uppercase text-[9px] tracking-[0.2em] flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Semestre LMD {sIdx + 1} ({sem.semestre.libelle})
                  </td>
                </tr>
                {sem.notes.length === 0 ? (
                   <tr className="border border-slate-300">
                     <td colSpan={7} className="p-4 text-center italic text-slate-400">Aucune donnée disponible pour ce semestre</td>
                   </tr>
                ) : sem.notes.map((note, uIdx) => (
                  <tr key={note.id} className="text-center font-medium border border-slate-300 h-8">
                    <td className="border border-slate-300 p-1 font-black">{note.matiere.code}</td>
                    <td className="border border-slate-300 p-1 text-left px-3 uppercase font-bold text-[9px]">{note.matiere.intitule}</td>
                    <td className="border border-slate-300 p-1 font-black bg-slate-50">{note.valeur.toFixed(2)}</td>
                    <td className="border border-slate-300 p-1 font-bold">{note.matiere.credits}</td>
                    <td className="border border-slate-300 p-1 font-black">{note.valeur.toFixed(2)}</td>
                    <td className="border border-slate-300 p-1 font-black text-emerald-700">{getMentionShort(note.valeur)}</td>
                    <td className="border border-slate-300 p-1 text-[8px] uppercase">{new Date().toLocaleDateString('fr-FR', {month: 'short', year: '2-digit'})}</td>
                  </tr>
                ))}
                <tr className="bg-slate-900 text-white font-black italic text-[8px]">
                  <td colSpan={2} className="p-2 pl-4 uppercase">Crédits acquis dans le Semestre {sIdx + 1} : {sem.creditsAcquis} / {sem.creditsTotal}</td>
                  <td className="p-2 text-center text-emerald-400">Moy : {sem.moyenne.toFixed(2)}</td>
                  <td colSpan={4} className="p-2 text-right pr-4 uppercase">Mention : {getMentionLabel(sem.moyenne)}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* FOOTER : RÉSULTAT ANNUEL ET SIGNATURES */}
        <div className="mt-8 relative z-10">
          <div className="bg-emerald-900 text-white p-3 flex justify-between font-black uppercase text-[10px] rounded-sm shadow-xl tracking-[0.1em]">
            <span>Moyenne Académique Annuelle : {annualMoyenne.toFixed(2)}</span>
            <span>Total Crédits Acquis : {annualCreditsAcquis} / {annualCreditsTotal}</span>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 text-center items-end">
            <div className="flex flex-col items-center">
              <p className="underline font-black uppercase text-[8px] mb-20 tracking-tighter">Le Chef de Département / HOD</p>
              <div className="relative">
                 <div className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center text-[7px] text-slate-300 font-bold rotate-12 uppercase italic">Signature & Cachet</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-1 border-2 border-slate-950 rounded-2xl mb-2 bg-white flex items-center justify-center">
                 <QrCode className="w-20 h-20 text-slate-900" />
              </div>
              <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">Certification Numérique</p>
              <p className="text-[6px] font-mono text-slate-300">{`IUG-VERIFY-${student.matricule}-${Date.now()}`}</p>
            </div>

            <div className="flex flex-col items-center">
              <p className="font-bold text-[8px] mb-2">Fait à Douala, le {new Date().toLocaleDateString('fr-FR')}</p>
              <p className="underline font-black uppercase text-[8px] mb-20 tracking-wider">Le Directeur / Director</p>
              <div className="text-center">
                <p className="text-[11px] font-black italic text-emerald-900 shadow-emerald-500/10">Fanjip René Constant</p>
                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter leading-none italic">Direction de l'ISTA — IUG Certification</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Bas de Page */}
        <div className="mt-16 pt-6 border-t border-slate-300 text-[7px] text-slate-400 italic text-center leading-tight">
           Ce relevé de notes est délivré en un seul exemplaire original par cycle d'étude. Le titulaire peut établir des copies certifiées.<br/>
           EduNotes Web Platform v4.5 - Signature cryptographique dynamique. Document généré sous session authentifiée.
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .min-h-screen { background: white !important; padding: 0 !important; }
          .print\:hidden { display: none !important; }
          .shadow-2xl { shadow: none !important; }
        }
      `}</style>
    </div>
  )
}

function getMentionShort(note: number) {
  if (note >= 17) return 'A+'
  if (note >= 16) return 'A'
  if (note >= 15) return 'B+'
  if (note >= 14) return 'B'
  if (note >= 13) return 'B-'
  if (note >= 12) return 'C+'
  if (note >= 10) return 'C'
  if (note >= 8) return 'D'
  return 'E'
}
