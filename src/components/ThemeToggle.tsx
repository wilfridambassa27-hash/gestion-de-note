'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const currentTheme = theme === 'system' ? resolvedTheme : theme

  return (
    <button
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      className="w-12 h-12 rounded-3xl shadow-lg hover:shadow-2xl transition-all bg-white/80 backdrop-blur-xl hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700"
      aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {currentTheme === 'dark' ? <Moon className="w-6 h-6 text-slate-800 dark:text-white" /> : <Sun className="w-6 h-6 text-amber-500" />}
    </button>
  )
}

