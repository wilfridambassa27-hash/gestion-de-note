'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  QrCode, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  ShieldAlert, 
  History,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PremiumSearch } from '@/components/PremiumUI'

interface QRCodeRecord {
  id: string
  hash: string
  dategeneration: string
  dateexpiration: string | null
  statut: string
  utilisations: number
  derniereutilisation: string | null
  bulletin: {
    etudiant: {
       user: { nom: string; prenom: string }
    }
    semestre: { libelle: string }
  }
}

export default function AdminQRCodesPage() {
  const [qrcodes, setQrcodes] = useState<QRCodeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchQRCodes()
  }, [])

  const fetchQRCodes = async () => {
    try {
      const res = await fetch('/api/admin/qrcodes') // I'll create this simple list API
      if (res.ok) {
        const data = await res.json()
        setQrcodes(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = qrcodes.filter(qr => 
    qr.bulletin.etudiant.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.hash.includes(searchTerm)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIF': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'EXPIRE': return 'bg-amber-50 text-amber-600 border-amber-100'
      case 'REVOQUE': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  return (
    <div className="p-12 space-y-12 bg-white/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-950 tracking-tighter">Gestion des <span className="text-emerald-500">QR Codes.</span></h1>
          <p className="text-sm font-medium text-slate-950">Surveillance et audit des accès sécurisés aux relevés de notes.</p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="px-10 py-6 bg-white rounded-[2rem] border border-slate-800 shadow-sm flex items-center gap-6">
              <div className="w-12 h-12 bg-black-50 rounded-2xl flex items-center justify-center">
                 <QrCode className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#A7AD94]">Total Empreintes</p>
                 <p className="text-2xl font-black text-slate-950">{qrcodes.length}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-800 shadow-2xl shadow-slate-900/40 overflow-hidden">
        <div className="p-10 border-b border-black-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1 max-w-xl">
              <PremiumSearch 
                placeholder="Rechercher par hash ou nom d'élève..." 
                value={searchTerm} 
                onChange={setSearchTerm} 
              />
            </div>
          <div className="flex items-center gap-4">
             <button className="p-6 bg-white border-2 border-slate-800 rounded-2xl text-slate-950 hover:border-slate-800 transition-all active:scale-95">
                <Filter className="w-6 h-6" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-10 py-8 text-left text-[11px] font-black uppercase tracking-[0.4em] text-[#A7AD94]">Hash Empreinte</th>
                <th className="px-10 py-8 text-left text-[11px] font-black uppercase tracking-[0.4em] text-[#A7AD94]">Élève / Semestre</th>
                <th className="px-10 py-8 text-center text-[11px] font-black uppercase tracking-[0.4em] text-[#A7AD94]">Statut</th>
                <th className="px-10 py-8 text-center text-[11px] font-black uppercase tracking-[0.4em] text-[#A7AD94]">Utilisations</th>
                <th className="px-10 py-8 text-right text-[11px] font-black uppercase tracking-[0.4em] text-[#A7AD94]">Dernière Activité</th>
                <th className="px-10 py-8 text-center text-[11px] font-black uppercase tracking-[0.4em] text-[#A7AD94]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black-50">
              {filtered.map((qr, i) => (
                <motion.tr 
                  key={qr.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-slate-50 transition-all"
                >
                  <td className="px-10 py-8">
                     <span className="font-mono text-[11px] font-black text-slate-950 uppercase tracking-widest">{qr.hash.slice(0, 16)}...</span>
                  </td>
                  <td className="px-10 py-8">
                     <div className="space-y-1">
                        <p className="font-black text-lg text-slate-950 leading-tight uppercase tracking-tight">{qr.bulletin.etudiant.user.nom} {qr.bulletin.etudiant.user.prenom}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{qr.bulletin.semestre.libelle}</p>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                     <span className={`px-5 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest ${getStatusColor(qr.statut)}`}>
                        {qr.statut}
                     </span>
                  </td>
                  <td className="px-10 py-8 text-center">
                     <div className="flex items-center justify-center gap-3">
                        <History className="w-5 h-5 text-[#A7AD94]" />
                        <span className="text-xl font-black text-slate-950">{qr.utilisations}</span>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <div className="space-y-1">
                        <p className="font-bold text-slate-950">
                           {qr.derniereutilisation ? format(new Date(qr.derniereutilisation), 'dd MMM yyyy', { locale: fr }) : 'Jamais'}
                        </p>
                        <p className="text-[10px] font-bold text-[#A7AD94] uppercase tracking-widest">
                           {qr.derniereutilisation ? format(new Date(qr.derniereutilisation), 'HH:mm', { locale: fr }) : '-'}
                        </p>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                     <div className="flex items-center justify-center gap-4">
                        <button className="p-4 bg-white border border-slate-800 rounded-xl text-slate-950 hover:text-slate-950 hover:border-slate-800 transition-all active:scale-90">
                           <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-4 bg-white border border-slate-800 rounded-xl text-red-400 hover:text-red-900 hover:border-red-900 transition-all active:scale-90">
                           <ShieldAlert className="w-5 h-5" />
                        </button>
                     </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
