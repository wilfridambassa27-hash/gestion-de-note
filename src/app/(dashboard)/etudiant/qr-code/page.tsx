'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'react-hot-toast'
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  CheckCircle, 
  GraduationCap, 
  LogOut,
  ChevronLeft,
  Sparkles,
  Zap,
  Info,
  ShieldCheck,
  FileText,
  ArrowRight
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function EtudiantQRCodePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isScanned, setIsScanned] = useState(false)

  // Identity guard
  useEffect(() => {
    const isVerified = sessionStorage.getItem('edunotes_class_verified') === 'true'
    if (!isVerified) {
      router.push('/etudiant/verification')
    }
  }, [router])

  const generateQRCode = async () => {
    setLoading(true)
    // Clear previous state
    setQrCodeUrl(null)
    setIsScanned(false)
    
    // Performance marker
    const startTime = Date.now()
    
    try {
      // Use the real internal API for secure QR generation
      const realQrUrl = `/api/etudiants/${session?.user?.id}/qrcode?t=${Date.now()}`
      
      const response = await fetch(realQrUrl)
      if (response.ok) {
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        setQrCodeUrl(objectUrl)
        
        const duration = (Date.now() - startTime) / 1000
        console.log(`QR Generated in ${duration}s`)

        toast.success('QR Code Officiel Généré !', {
          style: { background: '#000', color: '#1dff2f', borderRadius: '1rem', border: '1px solid #1dff2f' }
        })
      } else {
        throw new Error('API Error')
      }
    } catch (error) {
      toast.error('Erreur technique de génération')
    } finally {
      setLoading(false)
    }
  }

  // Cleanup blob URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (qrCodeUrl && qrCodeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(qrCodeUrl)
      }
    }
  }, [qrCodeUrl])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50/50">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Accès Sécurisé...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-emerald-50/20 dark:bg-slate-950 p-6 md:p-10 font-sans">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => router.back()}
                className="w-12 h-12 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-50 transition-colors group"
              >
                <ChevronLeft className="w-5 h-5 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                 <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                    <Sparkles className="w-4 h-4 animate-pulse" /> MON ESPACE CERTIFICATION
                 </div>
                 <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Mon QR Code.</h1>
              </div>
           </div>

           <div className="flex bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl border border-emerald-50 dark:border-slate-800">
              <div className="flex items-center gap-4 px-6 py-2">
                 <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black border-2 border-emerald-400">
                   {session?.user?.name?.charAt(0) || 'É'}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{session?.user?.name}</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Identité Vérifiée</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Main Generation Panel */}
           <div className="lg:col-span-12 xl:col-span-8">
              <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-16 shadow-2xl shadow-emerald-500/5 border border-emerald-50 dark:border-slate-800 relative overflow-hidden group text-center">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 dark:bg-emerald-500/5 rounded-full -mr-64 -mt-64 blur-3xl opacity-50" />
                 
                 <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                    
                    {!qrCodeUrl && (
                      <div className="space-y-8 max-w-lg mx-auto">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                           <QrCode className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="space-y-4">
                           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">GÉNÉRER MON CODE D'ACCÈS ELITE</h2>
                           <p className="text-slate-500 dark:text-slate-400 font-bold leading-loose italic">
                               "Générez votre QR Code instantané. Scannez-le ensuite avec votre téléphone pour accéder immédiatement à votre relevé de notes annuel certifié."
                           </p>
                        </div>
                        <button 
                          onClick={generateQRCode}
                          disabled={loading}
                          className="px-12 py-6 bg-slate-950 dark:bg-white dark:text-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-950/20 active:scale-95 transition-all flex items-center gap-4 mx-auto hover:bg-emerald-600 dark:hover:bg-emerald-50 disabled:opacity-50"
                        >
                          {loading ? <div className="w-6 h-6 border-2 border-white rounded-full animate-spin border-t-transparent" /> : <Zap className="w-6 h-6" />}
                          GÉNÉRER MAINTENANT
                        </button>
                      </div>
                    )}

                    {qrCodeUrl && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="space-y-12 w-full max-w-md mx-auto"
                       >
                          <div className="relative p-8 md:p-12 bg-white dark:bg-slate-950 rounded-[3rem] border border-emerald-500/20 shadow-2xl overflow-hidden group">
                             <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                             
                             <div className="relative bg-white p-4 rounded-3xl inline-block shadow-inner">
                                <img 
                                  src={qrCodeUrl} 
                                  alt="Student QR Code" 
                                  className="w-64 h-64 md:w-80 md:h-80 object-contain mx-auto"
                                />
                             </div>

                             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-8 py-3 bg-slate-950 text-[#1dff2f] text-[10px] font-black rounded-full uppercase tracking-[0.3em] shadow-2xl border border-emerald-500/30 whitespace-nowrap">
                                CODE ACTIF • SCANNEZ AVEC VOTRE MOBILE
                             </div>
                          </div>
                          
                          <div className="space-y-6">
                             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                  onClick={() => setQrCodeUrl(null)}
                                  className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-800 active:scale-95 transition-all"
                                >
                                  ANNULER & RE-GÉNÉRER
                                </button>
                             </div>
                             <div className="flex items-center justify-center gap-4 py-4 px-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500 animate-pulse max-w-xs mx-auto">
                                <Zap className="w-4 h-4 fill-current" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">PRÊT POUR ACCÈS INSTANTANÉ</p>
                             </div>
                          </div>
                       </motion.div>
                    )}
                 </div>
              </div>
           </div>

           {/* Informative Sidebar */}
           <div className="lg:col-span-12 xl:col-span-4 space-y-6">
              <div className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-600/20 relative overflow-hidden group">
                 <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mb-20" />
                 <ShieldCheck className="w-12 h-12 text-emerald-200 mb-8" />
                 <h3 className="text-2xl font-black tracking-tighter mb-6 uppercase">Sécurité EduNotes.</h3>
                 <div className="space-y-4">
                    {[
                      "Vérification par cluster universitaire",
                      "QR Code temporaire unique",
                      "Session d'archive sécurisée",
                      "Signature numérique intégrée"
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                        <div className="w-6 h-6 bg-white text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black">{i+1}</div>
                        <span className="text-[11px] font-black uppercase tracking-widest">{step}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                 <Info className="w-10 h-10 text-emerald-400 mb-6" />
                 <h4 className="text-lg font-black tracking-tight mb-3 uppercase">Procédure ISTA</h4>
                 <p className="text-slate-400 text-sm font-semibold leading-relaxed italic">
                    "Une fois le QR Code scanné, le document PDF généré dispose d'un cachet d'école numérique. Veillez à télécharger et sauvegarder votre exemplaire immédiatement."
                 </p>
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}
