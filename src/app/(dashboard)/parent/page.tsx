'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, GraduationCap, TrendingUp, BookOpen, 
  Award, Calendar, ChevronRight, Activity, Sparkles, AlertCircle
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { PremiumRefresh } from '@/components/PremiumUI'
import Link from 'next/link'

interface EnfantCard {
  id: string
  nom: string
  prenom: string
  classe: string
  moyenne: number
  rang: number
  effectif: number
  assiduite: number
}

export default function ParentDashboard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [enfants, setEnfants] = useState<EnfantCard[]>([])

  // Mock data for Phase 3 visual presentation before API wiring
  const fetchEnfants = async () => {
    setLoading(true)
    try {
      // Future API call: const res = await fetch('/api/parent/enfants')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Temporary mock data for the Elite v4.0 demonstration
      setEnfants([
        {
          id: '1',
          nom: 'Dubois',
          prenom: 'Lucas',
          classe: 'Terminales S',
          moyenne: 15.75,
          rang: 3,
          effectif: 32,
          assiduite: 98
        },
        {
          id: '2',
          nom: 'Dubois',
          prenom: 'Emma',
          classe: '1ère ES',
          moyenne: 16.20,
          rang: 1,
          effectif: 28,
          assiduite: 100
        }
      ])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnfants()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#000033]/10 border-t-[#D4AF37] rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 animate-pulse">Initialisation Family Insight...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-[7px] uppercase tracking-[0.4em] mb-1">
             <Sparkles className="w-3.5 h-3.5 animate-pulse" />
             PORTAIL FAMILLE • ELITE V4.0
          </div>
          <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tighter leading-none">
            VUE <span className="text-emerald-600">GLOBALE.</span>
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-2">Suivi académique et performances de vos enfants.</p>
        </div>
        
        <PremiumRefresh onClick={fetchEnfants} refreshing={loading} label="ACTUALISER" />
      </div>

      {/* Children Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card bg-slate-950 p-8 rounded-[2rem] shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 blur-[50px] rounded-full -mr-16 -mt-16 transition-all duration-1000 group-hover:bg-emerald-600/20" />
            <div className="relative z-10">
               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-6">
                  <User className="w-6 h-6 text-emerald-600" />
               </div>
               <h3 className="text-4xl font-black text-white tracking-tighter mb-1">{enfants.length}</h3>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Enfants Inscrits</p>
            </div>
         </div>

         <div className="glass-card bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -mr-16 -mt-16 transition-all duration-1000 group-hover:bg-emerald-500/20" />
            <div className="relative z-10">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-6">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
               </div>
               <h3 className="text-4xl font-black text-slate-950 tracking-tighter mb-1">
                 {enfants.length > 0 ? (enfants.reduce((acc, e) => acc + e.moyenne, 0) / enfants.length).toFixed(2) : '-'}
               </h3>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Moyenne Globale</p>
            </div>
         </div>

         <div className="glass-card bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -mr-16 -mt-16 transition-all duration-1000 group-hover:bg-emerald-500/20" />
            <div className="relative z-10">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-6">
                  <Activity className="w-6 h-6 text-emerald-500" />
               </div>
               <h3 className="text-4xl font-black text-slate-950 tracking-tighter mb-1">
                 {enfants.length > 0 ? Math.round(enfants.reduce((acc, e) => acc + e.assiduite, 0) / enfants.length) : '-'}%
               </h3>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Taux d'Assiduité</p>
            </div>
         </div>
      </div>

      {/* Detailed Profiles */}
      <div className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Profils Détaillés</h2>
        
        {enfants.map((enfant, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={enfant.id}
            className="glass-card bg-white p-6 md:p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
          >
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-slate-900 to-emerald-600" />
            
            {/* Avatar & Name */}
            <div className="flex items-center gap-6 md:w-1/3">
               <div className="w-20 h-20 bg-[#F8FAFF] rounded-3xl flex items-center justify-center border border-slate-800/5 shadow-inner">
                  <span className="text-2xl font-black text-slate-900">{enfant.prenom.charAt(0)}{enfant.nom.charAt(0)}</span>
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-950 tracking-tight leading-none uppercase">{enfant.prenom} <br/><span className="text-lg text-slate-400">{enfant.nom}</span></h3>
                  <div className="flex items-center gap-2 mt-3">
                     <span className="px-3 py-1 bg-slate-900/5 text-slate-900 font-black text-[8px] uppercase tracking-widest rounded-lg border border-slate-800/10">
                        {enfant.classe}
                     </span>
                  </div>
               </div>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:flex-1 w-full">
               <div className="p-4 bg-[#F8FAFF] rounded-2xl border border-slate-100 text-center">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Moyenne</p>
                  <p className="text-2xl font-black text-slate-950">{enfant.moyenne.toFixed(2)}</p>
               </div>
               <div className="p-4 bg-emerald-600/5 rounded-2xl border border-emerald-600/10 text-center">
                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-1">Rang</p>
                  <p className="text-2xl font-black text-emerald-600">{enfant.rang}<span className="text-sm">/{enfant.effectif}</span></p>
               </div>
               <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-1">Assiduité</p>
                  <p className="text-2xl font-black text-emerald-600">{enfant.assiduite}%</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex items-center justify-center">
                  <Link href={`/parent/bulletins?etudiantId=${enfant.id}`} className="w-full">
                     <button className="w-full py-3 bg-slate-950 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-colors border border-white/10 shadow-2xl shadow-slate-900/40">
                        Détails
                     </button>
                  </Link>
               </div>
            </div>
          </motion.div>
        ))}

        {enfants.length === 0 && (
          <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
             </div>
             <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Aucun enfant associé à votre profil.</p>
             <p className="text-xs text-slate-400 mt-2">Veuillez contacter l'administration pour lier vos enfants.</p>
          </div>
        )}
      </div>

    </div>
  )
}
