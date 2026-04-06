'use client'

import React from "react"
import { motion } from "framer-motion"
import { Users2, BarChart3, Shield } from "lucide-react"

interface Pillar {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  color: string
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  
  const pillars: Pillar[] = [
    { 
      icon: Users2, 
      title: "EXTRÊME ÉTUDIANT", 
      desc: "Notes • Bulletins • QR", 
      color: "neon"
    },
    { 
      icon: BarChart3, 
      title: "ANALYTICS NEON", 
      desc: "Graphiques • Stats", 
      color: "neon"
    },
    { 
      icon: Shield, 
      title: "PROTOCOLE SÉCURITÉ", 
      desc: "Chiffrement • Backups", 
      color: "neon"
    }
  ]

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 md:p-12 font-[Plus Jakarta Sans] overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
      
      {/* Neon Mesh Background (Restored) */}
      <div className="absolute inset-0 z-0 bg-white dark:bg-slate-950 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#1dff2f]/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -80, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-[#1dff2f]/5 blur-[150px] rounded-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1dff2f08_1px,transparent_1px),linear-gradient(to_bottom,#1dff2f08_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
        
        {/* Branding Area - Left (Visible on Desktop, refined for mobile) */}
        <div className="hidden lg:flex w-1/2 flex-col space-y-12 text-left items-start">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white dark:bg-slate-900 rounded-full border border-[#1dff2f]/30 shadow-neon-soft mx-auto lg:mx-0">
                <div className="w-2.5 h-2.5 bg-[#1dff2f] rounded-full animate-pulse shadow-neon" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">EduNotes Pro Suite v4.0</span>
              </div>
              <h2 className="text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-slate-950 dark:text-white uppercase">
                Portail<br/>
                <span className="text-[#1dff2f] text-shadow-neon">Académique.</span>
              </h2>
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400 max-w-md leading-relaxed italic mx-auto lg:mx-0">
                "L'excellence est une habitude." Accédez à vos résultats et pilotes de performance Elite.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
               {pillars.map((pill, i) => (
                 <motion.div 
                    key={pill.title}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-6 p-6 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-3xl hover:border-[#1dff2f]/40 hover:shadow-neon-soft transition-all group"
                 >
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-black/5 rounded-2xl flex items-center justify-center text-[#1dff2f] group-hover:bg-[#1dff2f] group-hover:text-black transition-colors">
                       <pill.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                       <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white leading-none mb-1.5">{pill.title}</h4>
                       <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors uppercase tracking-tight">{pill.desc}</p>
                    </div>
                 </motion.div>
               ))}
            </div>
        </div>

        {/* Auth Form Area - Right */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-white dark:border-slate-800 relative overflow-hidden flex flex-col"
           >
              {/* Institutional Top Bar (Restored Neon) */}
              <div className="h-2 w-full bg-[#1dff2f] shadow-neon" />
              
              <div className="p-10 md:p-14 relative z-10">
                {children}
              </div>
           </motion.div>
        </div>
      </div>
    </main>
  )
}
