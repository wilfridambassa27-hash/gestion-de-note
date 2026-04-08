'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUI } from '@/context/UIContext'
import { 
  GraduationCap,
  Home,
  UsersRound,
  School,
  BookOpen,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Search,
  Activity,
  History,
  Building2,
  UserPlus,
  Shield,
  Database,
  Zap,
  Award
} from 'lucide-react'

interface SidebarProps {
  children?: React.ReactNode
}

// Move sidebarItems inside component or use a function to allow translation
const getSidebarItems = (t: (key: string) => string) => [
  { title: t('nav_dashboard'), icon: <Home className="w-5 h-5" />, href: '/admin', color: 'from-emerald-500 to-cyan-500' },
  { title: t('nav_users'), icon: <UsersRound className="w-5 h-5" />, href: '/admin/utilisateurs', color: 'from-emerald-500 to-emerald-500' },
  { title: t('nav_classes'), icon: <Building2 className="w-5 h-5" />, href: '/admin/classes', color: 'from-purple-500 to-pink-500' },
  { title: t('nav_matieres') || 'Matières', icon: <BookOpen className="w-5 h-5" />, href: '/admin/matieres', color: 'from-orange-500 to-amber-500' },
  { title: t('nav_notes') || 'Notes', icon: <ClipboardList className="w-5 h-5" />, href: '/admin/notes', color: 'from-pink-500 to-rose-500' },
  { title: t('nav_stats') || 'Statistiques', icon: <BarChart3 className="w-5 h-5" />, href: '/admin/retrographique', color: 'from-cyan-500 to-emerald-500' },
  { title: t('nav_settings'), icon: <Settings className="w-5 h-5" />, href: '/admin/parametres', color: 'from-slate-500 to-zinc-500' },
]

export default function Sidebar({ children }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { t } = useUI()
  
  const sidebarItems = getSidebarItems(t)

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex transition-colors duration-500">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 300 : 90 }}
        className="fixed left-0 top-0 h-screen bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl shadow-2xl z-50 flex flex-col border-r border-slate-200/50 dark:border-slate-800/50 transition-colors duration-500"
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            {/* Logo Animation */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative w-14 h-14 bg-gradient-to-br from-emerald-600 via-emerald-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <GraduationCap className="w-8 h-8 text-white" />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
            </motion.div>
            
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1"
                >
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
                    EduNotes
                  </h1>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('administration')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Toggle Button */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-4 top-20 w-8 h-8 bg-gradient-to-r from-emerald-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 z-10"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </motion.button>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-thin">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            const isHovered = hoveredItem === item.href

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  whileHover={{ x: 8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 cursor-pointer
                    ${isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-purple-600 text-white shadow-lg shadow-emerald-500/25' 
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white font-semibold'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                    />
                  )}
                  
                  {/* Icon with gradient background on hover */}
                  <div className={`
                    relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : isHovered 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-semibold'
                    }
                  `}>
                    {item.icon}
                    {isHovered && !isActive && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl opacity-20`} 
                      />
                    )}
                  </div>

                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`font-bold drop-shadow-sm ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-200'}`}
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {!sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg whitespace-nowrap z-50"
                    >
                      {item.title}
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className={`
            flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
            ${sidebarOpen ? '' : 'justify-center'}
          `}>
            {/* Avatar */}
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="relative w-12 h-12 bg-gradient-to-r from-emerald-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
            >
              {session?.user?.name?.charAt(0) || 'A'}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            </motion.div>

            <AnimatePresence>
              {sidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {session?.user?.name || t('administrator')}
                  </p>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    {t('logout')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Database className="w-3 h-3" />
              <span>v1.0.0 • {currentYear}</span>
            </div>
          </motion.div>
        )}
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 300 : 90 }}
        className="flex-1 min-h-screen"
      >
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
                >
                  <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </motion.button>
                
                {/* Search Bar */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={`${t('search_user_placeholder').substring(0, 15)}...`}
                    className="pl-11 pr-5 py-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-72 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
                </motion.button>

                {/* Quick Stats */}
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">99.9% uptime</span>
                </div>

                {/* User Avatar */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg cursor-pointer"
                >
                  {session?.user?.name?.charAt(0) || 'A'}
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </motion.main>
    </div>
  )
}

