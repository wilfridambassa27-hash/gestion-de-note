'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import toast, { Toaster } from 'react-hot-toast'
import { 
  User, Settings, Globe, Moon, Sun, 
  Shield, BellRing, Smartphone, 
  CheckCircle2, Mail, GraduationCap, X, QrCode
} from 'lucide-react'

// Translation Dictionary
const dict = {
  fr: {
    studentAccount: "Compte Étudiant",
    activeStatus: "Statut Actif",
    preferencesTitle: "Préférences",
    preferencesDesc: "Personnalisez votre interface",
    languageLabel: "Langue de l'interface",
    themeLabel: "Thème d'Affichage",
    lightMode: "Mode Clair",
    darkMode: "Mode Sombre",
    themeNote: "*Le mode d'application change instantanément les couleurs du portail étudiant.",
    securityTitle: "Sécurité & Alertes",
    securityDesc: "Gérez vos notifications",
    pushNotifs: "Notifications Push",
    pushDesc: "Alertes lors de la saisie de notes",
    mobileApp: "Application Mobile",
    mobileDesc: "Scannez vos QR Codes",
    btnPair: "Associer",
    securityBanner: "Votre compte est sécurisé par l'authentification EduNotes OAuth2. Pour changer votre mot de passe, veuillez contacter l'administration de votre établissement.",
    toastLang: "Langue changée avec succès",
    toastTheme: "Thème appliqué",
    toastNotifOn: "Notifications Push activées",
    toastNotifOff: "Notifications Push désactivées",
    modalTitle: "Associer un Appareil",
    modalDesc: "Ouvrez l'application EduNotes Mobile et scannez ce code pour lier votre session étudiante instantanément.",
    close: "Fermer"
  },
  en: {
    studentAccount: "Student Account",
    activeStatus: "Active Status",
    preferencesTitle: "Preferences",
    preferencesDesc: "Customize your interface",
    languageLabel: "Interface Language",
    themeLabel: "Display Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    themeNote: "*The application mode instantly changes the colors of the student portal.",
    securityTitle: "Security & Alerts",
    securityDesc: "Manage your notifications",
    pushNotifs: "Push Notifications",
    pushDesc: "Alerts when grades are entered",
    mobileApp: "Mobile Application",
    mobileDesc: "Scan your QR Codes",
    btnPair: "Pair Device",
    securityBanner: "Your account is secured by EduNotes OAuth2 authentication. To change your password, please contact your school administration.",
    toastLang: "Language successfully changed",
    toastTheme: "Theme applied",
    toastNotifOn: "Push Notifications enabled",
    toastNotifOff: "Push Notifications disabled",
    modalTitle: "Pair a Device",
    modalDesc: "Open the EduNotes Mobile app and scan this code to link your student session instantly.",
    close: "Close"
  },
  es: {
    studentAccount: "Cuenta de Estudiante",
    activeStatus: "Estado Activo",
    preferencesTitle: "Preferencias",
    preferencesDesc: "Personaliza tu interfaz",
    languageLabel: "Idioma de la interfaz",
    themeLabel: "Tema de pantalla",
    lightMode: "Modo Claro",
    darkMode: "Modo Oscuro",
    themeNote: "*El modo de aplicación cambia instantáneamente los colores del portal estudiantil.",
    securityTitle: "Seguridad y Alertas",
    securityDesc: "Gestiona tus notificaciones",
    pushNotifs: "Notificaciones Push",
    pushDesc: "Alertas al ingresar calificaciones",
    mobileApp: "Aplicación Móvil",
    mobileDesc: "Escanea tus códigos QR",
    btnPair: "Vincular",
    securityBanner: "Su cuenta está protegida por la autenticación EduNotes OAuth2. Para cambiar su contraseña, comuníquese con la administración de su escuela.",
    toastLang: "Idioma cambiado con éxito",
    toastTheme: "Tema aplicado",
    toastNotifOn: "Notificaciones push activadas",
    toastNotifOff: "Notificaciones push desactivadas",
    modalTitle: "Vincular un dispositivo",
    modalDesc: "Abre la aplicación móvil EduNotes y escanea este código para vincular tu sesión de estudiante al instante.",
    close: "Cerrar"
  }
}

type LangKey = keyof typeof dict

export default function ProfilEtudiantPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  
  // Persist language and notifications
  const [language, setLanguage] = useState<LangKey>('fr')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isPairModalOpen, setIsPairModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydration fix for next-themes and local storage
  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('edunotes_lang') as LangKey
    if (savedLang && dict[savedLang]) setLanguage(savedLang)
    
    const savedNotifs = localStorage.getItem('edunotes_notifs')
    if (savedNotifs) setNotificationsEnabled(savedNotifs === 'true')
  }, [])

  const t = dict[language]

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as LangKey
    setLanguage(lang)
    localStorage.setItem('edunotes_lang', lang)
    toast.success(dict[lang].toastLang, { position: 'bottom-center' })
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast.success(t.toastTheme, { position: 'bottom-center' })
  }

  const toggleNotifications = () => {
    const newState = !notificationsEnabled
    setNotificationsEnabled(newState)
    localStorage.setItem('edunotes_notifs', String(newState))
    if (newState) {
      toast.success(t.toastNotifOn, { position: 'bottom-center', icon: '🔔' })
    } else {
      toast.error(t.toastNotifOff, { position: 'bottom-center', icon: '🔕' })
    }
  }

  if (!mounted) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Toaster />
      
      {/* Profil Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-500/30 relative overflow-hidden border border-emerald-400/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-white/20 p-2 rounded-[2rem] backdrop-blur-md shadow-xl border border-white/30 flex items-center justify-center">
             <div className="w-full h-full bg-white text-emerald-600 rounded-[1.5rem] flex items-center justify-center text-5xl font-black">
                {session?.user?.name?.charAt(0) || 'É'}
             </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight mb-2">{session?.user?.name || 'Étudiant'}</h1>
            <p className="text-emerald-200 font-bold uppercase tracking-widest text-sm mb-4 flex items-center justify-center md:justify-start gap-2">
               <GraduationCap className="w-5 h-5" />
               {t.studentAccount}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
               <div className="px-4 py-2 bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> {t.activeStatus}
               </div>
               <div className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <Mail className="w-4 h-4" /> {session?.user?.email}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Paramètres de la Plateforme */}
        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
               <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">{t.preferencesTitle}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{t.preferencesDesc}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Langue Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">
                <Globe className="w-4 h-4 text-emerald-500" /> {t.languageLabel}
              </label>
              <div className="relative">
                <select 
                  value={language}
                  onChange={handleLanguageChange}
                  className="w-full appearance-none py-4 px-5 rounded-2xl font-bold text-sm bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="fr">🇫🇷 Français (FR)</option>
                  <option value="en">🇬🇧 English (EN)</option>
                  <option value="es">🇪🇸 Español (ES)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <Globe className="w-5 h-5 opacity-50" />
                </div>
              </div>
            </div>

            {/* Thème */}
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">
                <Sun className="w-4 h-4 text-amber-500" /> {t.themeLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleThemeChange('light')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${theme === 'light' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:bg-slate-800'}`}
                >
                  <Sun className="w-5 h-5" /> {t.lightMode}
                </button>
                <button 
                  onClick={() => handleThemeChange('dark')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:bg-slate-800'}`}
                >
                  <Moon className="w-5 h-5" /> {t.darkMode}
                </button>
              </div>
              <p className="text-[10px] items-center text-slate-400 mt-2 font-semibold">
                {t.themeNote}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sécurité et Alertes */}
        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
               <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">{t.securityTitle}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{t.securityDesc}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Push Notifications Toggle */}
            <div 
              onClick={toggleNotifications}
              className="p-5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800 dark:text-white">{t.pushNotifs}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.pushDesc}</p>
                </div>
              </div>
              <button 
                className={`w-12 h-6 rounded-full transition-colors relative pointer-events-none ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Mobile App Pairing */}
            <div className="p-5 border-2 border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800 dark:text-white">{t.mobileApp}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.mobileDesc}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPairModalOpen(true)}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-widest rounded-xl transition-colors"
              >
                {t.btnPair}
              </button>
            </div>

            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <p>{t.securityBanner}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pairing Modal Overlay */}
      <AnimatePresence>
        {isPairModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 max-w-sm w-full shadow-2xl relative border border-slate-200 dark:border-slate-800"
            >
              <button 
                onClick={() => setIsPairModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mt-4">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6 shadow-inner">
                  <Smartphone className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t.modalTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-8">
                  {t.modalDesc}
                </p>

                {/* Simulated QR Code for pairing */}
                <div className="bg-white p-4 rounded-3xl border-4 border-slate-100 dark:border-slate-800 shadow-lg inline-block mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-3xl animate-pulse opacity-50 pointer-events-none" />
                  <QrCode className="w-48 h-48 text-emerald-950" />
                </div>

                <div className="flex gap-2 justify-center">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                   ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
