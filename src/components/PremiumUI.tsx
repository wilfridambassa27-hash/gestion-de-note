'use client'

import React, { useState } from 'react'
import { Search, RefreshCw, Sparkles, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PremiumSearchProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  darkMode?: boolean
  accentColor?: string // e.g., 'orange', 'emerald', 'blue', 'accent'
}

export const PremiumSearch: React.FC<PremiumSearchProps> = ({ 
  placeholder = "Rechercher...", 
  value, 
  onChange,
  darkMode = false,
  accentColor = 'accent'
}) => {
  const [isFocused, setIsFocused] = useState(false)

  // Color mapping
  const colorClass = accentColor === 'accent' ? 'emerald' : accentColor

  return (
    <div className="relative group w-full max-w-md">
      <motion.div
        animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
        className={`relative flex items-center transition-all duration-500 overflow-hidden rounded-full border-2 ${
          isFocused 
            ? `border-${colorClass}-500 shadow-${colorClass}-glow bg-white` 
            : darkMode ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'
        }`}
      >
        <Search className={`absolute left-5 w-4 h-4 transition-colors duration-300 ${
          isFocused ? `text-${colorClass}-500` : 'text-slate-400'
        }`} />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full pl-14 pr-6 py-4 bg-transparent outline-none text-xs font-bold tracking-tight ${
            darkMode ? 'text-white placeholder:text-white/30' : 'text-slate-900 placeholder:text-slate-400'
          }`}
        />

        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-4"
            >
              <Sparkles className={`w-3.5 h-3.5 text-${colorClass}-400 animate-pulse`} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

interface PremiumRefreshProps {
  onClick: () => void
  refreshing?: boolean
  label?: string
  darkMode?: boolean
  accentColor?: string
}

export const PremiumRefresh: React.FC<PremiumRefreshProps> = ({ 
  onClick, 
  refreshing = false,
  label = "Actualiser",
  darkMode = false,
  accentColor = 'accent'
}) => {
  const colorClass = accentColor === 'accent' ? 'emerald' : accentColor

  return (
    <motion.button
      whileHover={{ scale: 1.05, translateY: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={refreshing}
      className={`relative flex items-center gap-3 px-8 py-4 rounded-full font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-500 border border-emerald-500/30 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 ${
        darkMode 
          ? 'bg-slate-900 text-[#1dff2f]' 
          : 'bg-slate-950 text-[#1dff2f]'
      }`}
    >
      {refreshing ? (
        <Loader2 className={`w-4 h-4 animate-spin text-[#1dff2f]`} />
      ) : (
        <RefreshCw className={`w-4 h-4 text-[#1dff2f] group-hover:rotate-180 transition-transform duration-700`} />
      )}
      <span className="relative z-10">{label}</span>
      
      {!refreshing && (
        <div className="absolute inset-0 bg-[#1dff2f]/5 blur-xl rounded-full -z-10 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.button>
  )
}
