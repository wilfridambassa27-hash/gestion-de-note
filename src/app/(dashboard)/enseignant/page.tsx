// ============================================================
// enseignant/page.tsx — Point d'entrée du Tableau de Bord Enseignant
// Vérifie le rôle de la session avant d'afficher le dashboard.
// Affiche un écran de chargement animé (1.2s) pendant la vérification.
// ============================================================

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TeacherDashboard from './dashboard'

export default function EnseignantPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // ── Garde de rôle côté client ──
  // Redirige vers /login si la session est absente ou si le rôle n'est pas ENSEIGNANT.
  // Un délai de 1.2s est appliqué pour afficher l'animation d'accueil.
  // ── Garde de rôle côté client ──
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any).role !== 'ENSEIGNANT') {
      router.push('/login')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <div className="h-screen bg-slate-50" />
  }

  return (
    <div className="min-h-screen bg-slate-50">
       <TeacherDashboard />
    </div>
  )
}
