'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Sparkles } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Background Nuance */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10B981]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full" />

      {/* Main Loader Container */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          {/* Animated Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-12 border border-[#10B981]/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 border border-emerald-600/10 rounded-full"
          />

          {/* Logo Shell */}
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.15)] border border-[#10B981]/5 relative overflow-hidden group">
            <motion.div
              animate={{ 
                y: [0, -4, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <GraduationCap className="w-12 h-12 text-[#10B981]" />
            </motion.div>
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </div>
        </motion.div>

        {/* Pulsing Gold Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-emerald-600 blur-3xl -z-10 rounded-full"
        />
      </div>

      {/* Loading Text */}
      <div className="mt-16 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1D1F10]">Chargement du Système</span>
        </div>
        <div className="h-1 w-48 bg-[#10B981]/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-full w-24 bg-gradient-to-r from-transparent via-[#10B981] to-transparent"
          />
        </div>
      </div>
    </div>
  )
}
