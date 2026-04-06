'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ShieldCheck, 
  FileText, 
  User, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Printer,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function ReleveConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await fetch(`/api/qrcodes/verify?token=${params.hash}`)
        const result = await res.json()
        if (result.valid) {
          setData(result)
        } else {
          setError(result.error || 'Lien invalide ou expiré')
        }
      } catch (err) {
        setError('Erreur de connexion au serveur de certification')
      } finally {
        setLoading(false)
      }
    }
    if (params.hash) fetchVerification()
  }, [params.hash])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Authentification EduNotes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Accès Refusé</h1>
        <p className="text-slate-500 font-bold max-w-md italic mb-8">"{error}"</p>
        <button onClick={() => router.push('/')} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Retour à l'accueil</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Certification Header */}
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-200 relative overflow-hidden text-center">
           <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
           <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                 <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">Certification Officielle.</h1>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Document Authentifié par EduNotes Elite</p>
              </div>
           </div>
        </div>

        {/* Identity Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">
                    {data.etudiant.nom.charAt(0)}
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{data.etudiant.nom} {data.etudiant.prenom}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matricule: {data.etudiant.matricule}</p>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Classe</span>
                    <span className="text-slate-900">{data.etudiant.classe}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Session</span>
                    <span className="text-slate-900">{data.semestre}</span>
                 </div>
              </div>
           </div>

           <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center items-center text-center">
              <Award className="w-10 h-10 mb-4 opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Moyenne Générale</p>
              <h2 className="text-5xl font-black tracking-tighter mb-2">{data.moyennegenerale || 'N/A'}</h2>
              <div className="px-4 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                 Certification: {new Date().toLocaleDateString()}
              </div>
           </div>
        </div>

        {/* Grade Table */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
           <div className="p-8 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <FileText className="w-6 h-6 text-emerald-500" />
                 <span className="text-xs font-black uppercase tracking-[0.2em]">Détail des Résultats Certifiés</span>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={() => window.print()} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Printer className="w-4 h-4" /></button>
                 <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <th className="px-8 py-4">Matière</th>
                       <th className="px-8 py-4 text-center">Crédits</th>
                       <th className="px-8 py-4 text-center">Type</th>
                       <th className="px-8 py-4 text-right">Note / 20</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {data.notes.map((n: any, i: number) => (
                       <tr key={i} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold text-slate-900 uppercase italic leading-none">{n.matiere}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className="text-[10px] font-black text-slate-400">{n.credits}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className="px-3 py-1 bg-slate-100 rounded-full text-[8px] font-black uppercase text-slate-500 border border-slate-200">
                                {n.type}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-900">
                             {n.valeur.toFixed(2)}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none mb-1">Signature Numérique</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID: {params.hash?.toString().slice(0, 16)}...</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <Globe className="w-4 h-4 text-slate-300" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Verifier sur edunotes.com/verify</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}
