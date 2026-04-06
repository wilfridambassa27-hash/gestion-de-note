'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
// Custom button for theme toggle

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-12 h-12 rounded-3xl shadow-lg hover:shadow-2xl transition-all bg-white/80 backdrop-blur-xl hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-slate-800" />}
    </button>
  )
}

