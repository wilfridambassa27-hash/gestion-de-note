'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Download, ChevronLeft, ShieldCheck, Printer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'react-hot-toast'

interface Note {
  id: string
  matiere: string
  valeur: number
  credits: number
  type: string
}

interface Bulletin {
  id: string
  etudiant: {
    id: string
    nom: string
    prenom: string
    matricule: string
    classe: string
  }
  semestre: string
  moyennegenerale: number | null
  notes: Note[]
}

export default function QRResultPage() {
  const params = useParams()
  const router = useRouter()
  const [bulletin, setBulletin] = useState<Bulletin | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const token = params.token as string

  useEffect(() => {
    if (token) {
      verifyQR()
    }
  }, [token])

  const verifyQR = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/qrcodes/verify?token=${token}`)
      if (response.ok) {
        const data = await response.json()
        if (data.bulletin) {
          setBulletin(data.bulletin)
        } else {
          setError('QR code invalide ou expiré.')
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur vérification QR code.')
      }
    } catch (err) {
      setError('Erreur connexion.')
    } finally {
      setLoading(false)
    }
  }

  const studentInfo = {
    nom: bulletin?.etudiant.nom || "-",
    prenom: bulletin?.etudiant.prenom || "-",
    matricule: bulletin?.etudiant.matricule || "-",
    dateV: "-",
    lieuC: "-",
    annee: "2024/2025",
    cycle: "Licence / Bachelor",
    secteur: "-",
    finalite: "-",
    domaine: "-",
    filiere: bulletin?.etudiant.classe || "-",
    parcours: "-",
  }

  const generatedMatieres = bulletin?.notes?.length ? bulletin.notes.map((n, i) => ({
    ue: 'UE0' + (i+1), nomUe: n.matiere, moyUe: n.valeur.toFixed(2), ec: 'EC0' + (i+1), nomEc: n.matiere, type: n.type || 'Obligatoire', cred: n.credits, note: n.valeur.toFixed(2), acq: n.valeur >= 10 ? n.credits : 0, mention: n.valeur >= 16 ? 'A' : n.valeur >= 14 ? 'B' : n.valeur >= 12 ? 'C' : n.valeur >= 10 ? 'D' : 'E', session: bulletin.semestre || 'S1'
  })) : []

  const moyenne = bulletin?.notes?.length 
    ? (bulletin.notes.reduce((acc, n) => acc + (n.valeur * n.credits), 0) / bulletin.notes.reduce((acc, n) => acc + n.credits, 0)).toFixed(2)
    : "12.86"

  const creditsTotal = bulletin?.notes?.length
     ? bulletin.notes.reduce((acc, n) => acc + n.credits, 0)
     : 30
     
  const creditsAcquis = bulletin?.notes?.length
     ? bulletin.notes.filter(n => n.valeur >= 10).reduce((acc, n) => acc + n.credits, 0)
     : 30

  const handleDownload = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-500">Accès au registre sécurisé...</p>
        </div>
      </div>
    )
  }

  if (error || !bulletin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
         <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-lg border border-red-100">
           <h1 className="text-3xl font-black text-slate-900 mb-4">{error}</h1>
           <p className="text-slate-500 font-bold mb-8">Le QR Code utilisé est soit incorrect, soit révoqué, soit expiré.</p>
           <button onClick={() => router.push('/login')} className="w-full py-4 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest hover:bg-black transition-all">Retour à l'accueil</button>
         </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100/50 py-10 font-sans print:bg-white print:py-0">
      <Toaster position="top-right" />
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-transcript, #printable-transcript * { visibility: visible; }
          #printable-transcript {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
          }
          @page { size: A4 portrait; margin: 10mm; }
        }
      `}} />

      {/* Toolbar - Screen only */}
      <div className="max-w-[210mm] mx-auto mb-8 print:hidden flex items-center justify-between">
        <button onClick={() => router.push('/login')} className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all font-bold text-sm text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Quitter
        </button>
        <div className="flex items-center gap-3 bg-green-50 text-green-700 px-6 py-3 rounded-full font-bold text-sm border border-green-200">
           <ShieldCheck className="w-5 h-5" /> Vérifé Authentique
        </div>
      </div>

      {/* A4 Document Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        id="printable-transcript"
        className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl overflow-hidden relative"
        style={{ border: '2px solid #e2e8f0', padding: '15mm' }}
      >
        {/* Yellow Border Overlay (like the image) */}
        <div className="absolute inset-x-0 top-0 h-1 bg-yellow-400" />
        <div className="absolute inset-y-0 right-0 w-1 bg-yellow-400" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-yellow-400" />
        <div className="absolute inset-y-0 left-0 w-1 bg-yellow-400" />

        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <ShieldCheck className="w-[150mm] h-[150mm] text-slate-900" />
        </div>

        {/* Headers */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col items-center">
            <div className="flex items-end text-green-600 mb-1">
               <span className="text-4xl font-bold tracking-tighter">IUG</span>
            </div>
            <p className="text-[9px] text-center font-bold">Institut Universitaire<br/>du Golfe de Guinée</p>
            <div className="mt-1 flex gap-1 font-bold text-[8px]">
              <span className="bg-slate-800 text-white px-1">ESG</span>
              <span className="bg-slate-800 text-white px-1">ISTA</span>
              <span className="bg-slate-800 text-white px-1">ISA</span>
            </div>
          </div>

          <div className="flex flex-col items-center text-center flex-1 px-4">
            <h1 className="text-[14px] font-black uppercase text-slate-900 tracking-tight">Institut Universitaire du Golfe de Guinee</h1>
            <h2 className="text-[13px] font-bold uppercase text-slate-800 tracking-tight mb-1">Institut Superieur des Technologies Avancees</h2>
            <p className="text-[8px] font-semibold text-slate-600">B.P / P.O : 12489 Douala</p>
            <p className="text-[8px] font-semibold text-slate-600">Tel : (237) 233 43 04 52 / 33 37 53 51 Fax: (237) 233 42 89 02</p>
            <p className="text-[8px] font-semibold text-slate-600">Website: www.univ-iug.com</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-[40px] font-black text-rose-200 opacity-80 leading-none">ISTA</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6 border-t border-b border-yellow-400/30 py-2">
          <h3 className="text-[14px] font-black uppercase text-slate-900">RELEVE DE NOTES / MARKS TRANSCRIPT</h3>
          <p className="text-[10px] text-red-600 font-bold">ID N° : <span className="text-blue-800">{studentInfo.matricule} / IUG/ISTA/D</span></p>
        </div>

        {/* Student Data */}
        <div className="flex justify-between text-[11px] mb-4 font-bold leading-tight relative z-10">
          <div className="space-y-1">
            <p>Nom et Prénom étudiant : <span className="font-black text-sm uppercase">{studentInfo.nom} {studentInfo.prenom}</span></p>
            <p className="italic font-normal">Last & First Name:</p>
            <p>Date et lieu de Naissance : {studentInfo.dateV} à {studentInfo.lieuC}</p>
            <p className="italic font-normal mb-1">Date and place of birth:</p>
            <p>Année académique / Academic Year : {studentInfo.annee}</p>
            <p>Cycle / Cycle : <span className="italic">{studentInfo.cycle}</span></p>
            <p>Secteur / Sector : <span className="italic">{studentInfo.secteur}</span></p>
          </div>
          <div className="space-y-1 text-right">
            <p>Matricule : <span className="text-red-700">{studentInfo.matricule}</span></p>
            <p className="italic font-normal mb-6">Registration number :</p>
            <p>Finalité / Vocation : <span className="italic">{studentInfo.finalite}</span></p>
            <p>Domaine / Domain of study : <span className="italic">{studentInfo.domaine}</span></p>
            <p>Filière / Study : <span className="italic">{studentInfo.filiere}</span></p>
          </div>
        </div>
        
        <div className="text-[11px] font-bold text-center mb-4 relative z-10">
          <p>Parcours/Course : <span className="text-blue-800">{studentInfo.parcours}</span></p>
        </div>
        <div className="text-[10px] font-bold mb-1 relative z-10">
          Sessions d'examens déjà subis : <span className="italic text-slate-600 font-normal">Janvier 2025, Juin 2025</span>
        </div>

        {/* Table Grid (Exact Match) */}
        <div className="w-full text-[8.5px] border-collapse border border-slate-800 mb-8 mt-4 relative z-10 bg-white">
          <div className="grid grid-cols-[1fr,2fr,1fr,1fr,2.5fr,1fr,1fr,1fr,1fr,1fr,1fr] bg-slate-100 font-bold text-center text-[7.5px]">
            <div className="border border-slate-800 p-1 flex items-center justify-center">Code UE</div>
            <div className="border border-slate-800 p-1 flex items-center justify-center">Intitulé UE</div>
            <div className="border border-slate-800 p-1 flex items-center justify-center">Moyenne<br/>UE</div>
            <div className="border border-slate-800 p-1 flex items-center justify-center">Code EC</div>
            <div className="border border-slate-800 p-1 flex items-center justify-center">Eléments Constitutifs(EC)</div>
            <div className="border border-slate-800 p-1 flex items-center justify-center">Type</div>
            <div className="border border-slate-800 p-1 flex items-center justify-center">Valeurs<br/>Crédits</div>
            <div className="border border-slate-800 p-1 flex items-center justify-center bg-slate-200">Note/20</div>
            <div className="border border-slate-800 p-1 flex items-center justify-center">Crédits<br/>acquis</div>
            <div className="border border-slate-800 p-1 flex items-center justify-center">Mention</div>
            <div className="border border-slate-800 p-1 flex items-center justify-center">Session</div>
          </div>

          <div className="bg-sky-200 text-blue-900 border border-slate-800 p-1 font-bold">Semestre LMD 1</div>
          <div className="bg-slate-300 text-[7px] text-center border-x border-slate-800 font-bold p-0.5 col-span-11 w-full">UE FONDAMENTALES (30%)</div>

          {generatedMatieres.length > 0 ? generatedMatieres.map((m, i) => (
            <div key={i} className="grid grid-cols-[1fr,2fr,1fr,1fr,2.5fr,1fr,1fr,1fr,1fr,1fr,1fr] min-h-[16px] items-stretch">
              <div className="border border-slate-400 p-1 font-bold">{m.ue}</div>
              <div className="border border-slate-400 p-1 font-bold uppercase truncate max-w-[40mm]">{m.nomUe}</div>
              <div className="border border-slate-400 p-1 text-center font-bold">{m.moyUe}</div>
              <div className="border border-slate-400 p-1">{m.ec}</div>
              <div className="border border-slate-400 p-1 uppercase truncate max-w-[50mm]">{m.nomEc}</div>
              <div className="border border-slate-400 p-1 text-center">{m.type}</div>
              <div className="border border-slate-400 p-1 text-center">{m.cred}</div>
              <div className="border border-slate-400 p-1 text-center font-bold bg-slate-50 text-[9px]">{m.note}</div>
              <div className="border border-slate-400 p-1 text-center font-bold">{m.acq}</div>
              <div className="border border-slate-400 p-1 text-center font-bold text-[9px]">{m.mention}</div>
              <div className="border border-slate-400 p-1 text-center">{m.session}</div>
            </div>
          )) : (
            <div className="col-span-11 p-4 text-center font-bold text-slate-500 italic flex items-center justify-center w-full border border-slate-400">
               Aucune note disponible pour l'instant. L'enseignant doit valider les évaluations.
            </div>
          )}

          {/* Table Summary bottom */}
          <div className="flex bg-blue-500 text-white font-bold p-1 text-[8px] justify-between px-2">
             <span>Crédits acquis dans le Semestre : {creditsAcquis}/{creditsTotal}</span>
             <span>Moyenne : {moyenne}</span>
             <span>Mention : B / Assez Bien</span>
          </div>
        </div>

        {/* Footer Signatures matching photo exactly */}
        <div className="flex justify-between items-start mt-8 relative z-10">
          <div className="w-[180px] text-center">
            <h4 className="text-[11px] font-black uppercase text-slate-800 mb-1 leading-tight">Le Chef de Département</h4>
            <p className="italic text-[9px] text-slate-600 mb-20">The Head of Department</p>
            <div className="border-t border-slate-800 mx-4 pt-1">
               <p className="text-[10px] font-bold text-blue-800">Assis.ant</p>
            </div>
          </div>
          
          <div className="w-[150px] flex items-center justify-center opacity-30 mt-6">
             <div className="w-[100px] h-[100px] rounded-full border-4 border-blue-800 flex items-center justify-center flex-col scale-150 rotate-[-15deg]">
               <span className="text-[10px] font-black uppercase tracking-tighter text-blue-900 absolute top-2">Institut Superieur</span>
               <span className="text-[6px] font-black absolute bottom-2">D.T.I.C</span>
             </div>
          </div>

          <div className="w-[200px] text-center">
            <h4 className="text-[10px] font-black text-slate-800 mb-1 text-left italic">Fait à Douala, le {new Date().toLocaleDateString('fr-FR')}</h4>
            <p className="italic text-[9px] text-slate-600 text-left mb-4">Done in Douala, on</p>
            <h4 className="text-[11px] font-black uppercase text-slate-800 text-left">Le Directeur</h4>
            <p className="italic text-[9px] text-slate-600 text-left mb-16">The Director</p>
            <div className="text-left">
               <p className="text-[14px] font-[cursive] text-blue-900 leading-none">Fanjip René Constant</p>
               <p className="text-[10px] font-black text-blue-900">Docteur PhD en Science de l'Ingenieur</p>
               <p className="text-[9px] font-bold text-slate-800">Chargé de cours</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Téléchargement au fond comme demandé */}
      <div className="max-w-[210mm] mx-auto mt-8 print:hidden">
         <button onClick={handleDownload} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-xl hover:bg-indigo-700 hover:shadow-2xl transition-all flex items-center justify-center gap-4">
             <Download className="w-6 h-6" />
             TÉLÉCHARGER LE RELEVÉ PDF COMPLET
         </button>
      </div>

    </div>
  )
}
