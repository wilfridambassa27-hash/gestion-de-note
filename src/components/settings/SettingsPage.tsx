'use client'

// ============================================================
// SettingsPage — Composant Paramètres (Settings.jsx adapté)
// Reproduit EXACTEMENT le design fourni par l'utilisateur :
// emojis, toggle checkbox peer, classes Tailwind identiques.
// Intégré avec UIContext au lieu de react-i18next.
// ============================================================

import React, { useState } from 'react'
import { useUI } from '@/context/UIContext'

export default function SettingsPage() {
  const { language: selectedLang, setLanguage, theme, setTheme, t, academicSession, setAcademicSession } = useUI()

  const darkMode = theme === 'dark'

  // Fonction pour changer la langue
  const changeLanguage = (lng: 'fr' | 'en' | 'es' | 'de') => {
    setLanguage(lng)
  }

  // Fonction pour basculer le mode nuit
  const toggleDarkMode = () => {
    setTheme(darkMode ? 'light' : 'dark')
  }

  return (
    <div className={`min-h-screen p-4 md:p-10 transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ═══════════ BLOC LANGUE ═══════════ */}
        <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>🌐</div>
            <div>
              <h2 className="font-bold text-xl">{t('language')}</h2>
              <p className="text-xs text-gray-400">MULTI-CHANNEL I18N</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'fr' as const, label: 'FRANÇAIS', flag: '🇫🇷' },
              { id: 'en' as const, label: 'ENGLISH', flag: '🇬🇧' },
              { id: 'es' as const, label: 'ESPAÑOL', flag: '🇪🇸' },
              { id: 'de' as const, label: 'DEUTSCH', flag: '🇩🇪' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => changeLanguage(lang.id)}
                className={`w-full flex justify-between items-center p-4 rounded-2xl border transition-all ${
                  selectedLang === lang.id 
                  ? 'border-emerald-500 bg-emerald-50/10' 
                  : `border-transparent ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-bold text-sm tracking-widest">{lang.label}</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedLang === lang.id ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                  {selectedLang === lang.id && <span className="text-white text-[10px]">✓</span>}
                </div>
              </button>
            ))}
          </div>
          <p className="mt-6 text-center italic text-xs text-gray-400">&quot;Traduction instantanée de tous les modules.&quot;</p>
        </div>

        {/* ═══════════ COLONNE DROITE : APPARENCE & SÉCURITÉ ═══════════ */}
        <div className="space-y-8">
          
          {/* ─── BLOC APPARENCE ─── */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-800 rounded-lg">🎨</span>
                <h2 className="font-bold">{t('appearance')}</h2>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <span>🌙</span>
                <div>
                  <p className="font-bold text-sm">{t('night_mode')}</p>
                  <p className="text-[10px] text-gray-400">DEEP BLUE VISION</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={toggleDarkMode} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            <div className="mt-6">
              <label className="text-[10px] font-bold text-emerald-500 mb-2 block uppercase">{t('session_options')}</label>
              <select 
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 ring-emerald-500 outline-none"
              >
                <option value="2024-2025">2024-2025 (Actuel)</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
          </div>

          {/* ─── BLOC SÉCURITÉ ─── */}
          <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>🔒</span>
              <h2 className="font-bold">{t('security')} Suite</h2>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase">{t('change_password')}</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className={`w-full p-3 rounded-xl border outline-none focus:border-emerald-500 ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-300'
                }`}
              />
              <button className={`w-full py-3 font-bold rounded-xl text-xs tracking-widest hover:opacity-90 transition ${
                darkMode 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-950 text-emerald-400'
              }`}>
                ACTUALISER
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
