// ============================================================
// saisie-notes/page.tsx
// ============================================================

'use client'

import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SaisieNotesForm from '@/components/SaisieNotesForm'
import { Toaster } from 'react-hot-toast'

export default function SaisieNotesPage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-slate-50 p-6 md:p-12 font-[Outfit]">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold uppercase text-xs"
        >
          <ChevronLeft className="w-5 h-5" /> Retour Dashboard
        </button>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 uppercase">
            Interface de <span className="text-emerald-500">Saisie</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Saisie des notes centralisée (Formulaire standardisé)</p>
        </div>

        {/* Intégration du formulaire demandé */}
        <SaisieNotesForm />
      </div>
    </div>
  )
}

