'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  BarChart3, 
  QrCode, 
  User, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  Clock, 
  Zap, 
  Award, 
  Bell, 
  BookOpen,
  PieChart,
  Activity,
  Layers,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useUI } from '@/context/UIContext'
import { Toaster } from 'react-hot-toast'

export default function EtudiantDashboard() {
  const { data: session } = useSession()
  const { t } = useUI()

  const [isGenerating, setIsGenerating] = React.useState(false)
  const [qrBlobUrl, setQrBlobUrl] = React.useState<string | null>(null)
  const [showQRModal, setShowQRModal] = React.useState(false)

  const handleGenerateQR = async () => {
    setIsGenerating(true)
    const startTime = Date.now()
    try {
      const res = await fetch(`/api/etudiants/${session?.user?.id}/qrcode?t=${Date.now()}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        setQrBlobUrl(url)
        setShowQRModal(true)
        console.log(`QR Generated in ${(Date.now() - startTime) / 1000}s`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (qrBlobUrl) URL.revokeObjectURL(qrBlobUrl)
    }
  }, [qrBlobUrl])

  const quickMenus = [
    { icon: GraduationCap, label: t('nav_classes'), href: "/etudiant/ma-classe", color: "bg-[#1dff2f]" },
    { icon: Award, label: t('my_bulletin'), href: "/etudiant/bulletin", color: "bg-white" },
    { icon: User, label: t('my_profile'), href: "/etudiant/profil", color: "bg-white" },
    { icon: Calendar, label: "Syllabus", href: "#", color: "bg-white" },
    { icon: QrCode, label: t('digital_id'), href: "/etudiant/qr-code", color: "bg-white" },
  ]

  return (
    <div className="space-y-12 pb-20 pt-6">
      <Toaster position="top-center" />
      
      {/* QR MODAL OVERLAY */}
      <AnimatePresence>
        {showQRModal && qrBlobUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setShowQRModal(false)}
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[4rem] shadow-2xl border border-emerald-500/20 max-w-lg w-full text-center space-y-10 relative overflow-hidden"
               onClick={(e) => e.stopPropagation()}
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-[#1dff2f]" />
                <div className="space-y-4">
                   <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#1dff2f]/10 text-[#1dff2f] rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#1dff2f]/20">
                      <ShieldCheck className="w-4 h-4" /> Certification Live
                   </div>
                   <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter uppercase leading-none">Scannez votre Relevé.</h2>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                      Utilisez l'appareil photo de votre mobile pour<br/>développer votre relevé instantanément.
                   </p>
                </div>

                <div className="relative group inline-block p-4 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                   <img src={qrBlobUrl} alt="QR Code Transcript" className="w-64 h-64 md:w-80 md:h-80 object-contain mx-auto" />
                   <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black text-[#1dff2f] text-[9px] font-black rounded-full uppercase tracking-widest border border-[#1dff2f]/20 shadow-neon">
                      ID: {session?.user?.id?.substring(0, 10)}
                   </div>
                </div>

                <button 
                   onClick={() => setShowQRModal(false)}
                   className="w-full py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-transform"
                >
                   Fermer le Code
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Student Hero - Vision v4.0 */}
      <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         className="relative h-[480px] lg:h-[580px] rounded-[4rem] overflow-hidden group shadow-[0_30px_60px_rgba(29,255,47,0.08)] border border-slate-50 dark:border-slate-800 transition-colors"
      >
         {/* Background Styling */}
         <div className="absolute inset-0 bg-white dark:bg-slate-950">
            <img 
               src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
               alt="Student Success" 
               className="w-full h-full object-cover grayscale-0 opacity-40 group-hover:scale-105 transition-transform duration-1000" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-white/40 dark:via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 bg-[#1dff2f]/5 mix-blend-overlay" />
         </div>

         <div className="absolute inset-0 p-12 lg:p-20 flex flex-col justify-end space-y-10">
            <div className="space-y-6 max-w-3xl relative z-10">
               <div className="flex items-center gap-4">
                  <motion.div
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="inline-flex items-center gap-3 px-6 py-2 bg-[#1dff2f] text-black rounded-full shadow-neon font-black text-[10px] uppercase tracking-[0.4em]"
                  >
                     <Sparkles className="w-4 h-4" />
                     {t('academic_success')} v4.0
                  </motion.div>
                  <button 
                     onClick={handleGenerateQR}
                     disabled={isGenerating}
                     className="px-6 py-2 bg-black text-[#1dff2f] border border-[#1dff2f]/30 rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-neon hover:bg-[#1dff2f] hover:text-black transition-all flex items-center gap-3"
                  >
                     {isGenerating ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
                     GÉNÉRER QR CODE
                  </button>
               </div>
               
               <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter leading-[0.85] uppercase">
                  {t('my_vision_notes').split(',')[0]},<br/>
                  <span className="text-[#1dff2f] text-shadow-neon">{t('my_vision_notes').split(',')[1] || 'Tes Notes'}.</span>
               </h1>
               
               <p className="text-slate-400 text-xl font-bold max-w-lg leading-relaxed italic border-l-4 border-[#1dff2f] pl-6">
                  "{t('excellence_standard')}" Elite EduNotes.
               </p>
            </div>

               <div className="flex items-center gap-10 md:gap-14 relative z-10">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{t('position')}</span>
                  <span className="text-2xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tighter">TOP 5%</span>
               </div>
               <div className="w-[1px] h-10 md:h-14 bg-slate-100" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{t('progression')}</span>
                  <span className="text-2xl md:text-4xl font-black text-[#1dff2f] tracking-tighter">85%</span>
               </div>
               <div className="w-[1px] h-10 md:h-14 bg-slate-100" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{t('status_label')}</span>
                  <span className="text-2xl md:text-4xl font-black text-slate-950 dark:text-emerald-400 tracking-tighter">ELITE</span>
               </div>
            </div>
         </div>
      </motion.div>

      {/* New Professional Menu Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
         {quickMenus.map((menu, i) => (
           <Link href={menu.href} key={i}>
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.05 }}
                 whileHover={{ y: -8, boxShadow: "0 25px 50px rgba(29,255,47,0.12)" }}
                 className={`p-6 md:p-10 rounded-[2.5rem] border border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center gap-4 transition-all group ${menu.color === 'bg-[#1dff2f]' ? 'bg-[#1dff2f] border-[#1dff2f]/20 shadow-neon' : 'bg-white dark:bg-slate-900 hover:border-[#1dff2f]/30 shadow-sm'}`}
              >
                 <div className={`p-3 md:p-4 rounded-2xl ${menu.color === 'bg-[#1dff2f]' ? 'bg-black text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-[#1dff2f] group-hover:bg-[#1dff2f]/10 transition-colors'}`}>
                    <menu.icon className="w-5 h-5 md:w-7 md:h-7" />
                 </div>
                 <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-widest ${menu.color === 'bg-[#1dff2f]' ? 'text-black' : 'text-slate-900 dark:text-slate-200 group-hover:text-[#1dff2f]'}`}>{menu.label}</span>
              </motion.div>
           </Link>
         ))}
      </div>

    </div>
  )
}
