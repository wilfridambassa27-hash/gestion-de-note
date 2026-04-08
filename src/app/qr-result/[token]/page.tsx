'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, TrendingUp, Award, Download, Share2, Printer, CheckCircle } from 'lucide-react'
import { calculerMoyennePonderee, getMention } from '@/lib/calculNotes'
import { jsPDF } from 'jspdf'

interface EtudiantPublic {
  id: string
  nomComplet: string
  classe: { nom: string }
  notes: Array<{
    matiere: { nom: string }
    valeur: number
    coefficient: number
  }>
}

export default function QRResultPage() {
  const params = useParams()
  const router = useRouter()
  const [etudiant, setEtudiant] = useState<EtudiantPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = params.token as string

  useEffect(() => {
    if (token) {
      verifyQR()
    }
  }, [token])

  const verifyQR = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/qrcodes/verify?token=${token}`)
      if (response.ok) {
        const data = await response.json()
        if (data.etudiant) {
          setEtudiant(data.etudiant)
        } else {
          setError('QR code invalide ou expiré')
        }
      } else {
        setError('Erreur vérification QR code')
      }
    } catch (err) {
      setError('Erreur connexion')
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = () => {
    if (!etudiant) return
    const doc = new jsPDF()
    const moyenne = calculerMoyennePonderee(etudiant.notes)
    const mention = getMention(moyenne)

    doc.setFontSize(20)
    doc.text('BULLETIN SCOLAIRE', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text(`Élève: ${etudiant.nomComplet}`, 20, 40)
    doc.text(`Classe: ${etudiant.classe.nom}`, 20, 50)
    doc.text(`Moyenne générale: ${moyenne.toFixed(2)}/20 - ${mention}`, 20, 60)

    let y = 80
    etudiant.notes.forEach((note, i) => {
      doc.text(`${note.matiere.nom}: ${note.valeur}/20 (x${note.coefficient})`, 20, y)
      y += 10
    })

    doc.save(`bulletin-${etudiant.nomComplet.replace(/ /g, '_')}.pdf`)
  }

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mon bulletin scolaire',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié !')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error || !etudiant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md"
        >
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{error || 'QR Code invalide'}</h1>
          <p className="text-gray-600 mb-8">Le code QR a expiré ou est incorrect.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            ← Retour accueil
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const moyenne = calculerMoyennePonderee(etudiant.notes)
  const mention = getMention(moyenne)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-emerald-200/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Bulletin Scolaire</h1>
                <p className="text-sm text-emerald-600 font-semibold">{etudiant.nomComplet}</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={shareResult}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={generatePDF}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Download className="w-4 h-4" />
                PDF
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-emerald-200/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-emerald-600 mb-2">{moyenne.toFixed(2)}<span className="text-2xl">/20</span></div>
              <div className="text-sm font-bold uppercase tracking-wide text-emerald-700">{mention}</div>
            </div>
            <div className="border-l border-emerald-200">
              <div className="text-3xl font-bold text-gray-800 mb-1">{etudiant.classe.nom}</div>
              <div className="text-lg text-gray-600">Classe</div>
            </div>
            <div className="border-l border-emerald-200">
              <div className="text-3xl font-bold text-gray-800 mb-1">{etudiant.notes.length}</div>
              <div className="text-lg text-gray-600">Notes</div>
            </div>
          </div>
        </motion.div>

        {/* Notes Table */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-emerald-200/50"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <BookOpen className="w-9 h-9 text-emerald-500" />
            Détail des notes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-50 border-b border-emerald-200">
                  <th className="px-6 py-4 text-left text-lg font-bold text-gray-900">Matière</th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-gray-900">Note</th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-gray-900">Coeff.</th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-gray-900">Pond.</th>
                </tr>
              </thead>
              <tbody>
                {etudiant.notes.map((note, i) => {
                  const pond = note.valeur * note.coefficient
                  return (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-emerald-100 hover:bg-emerald-50 transition-colors"
                    >
                      <td className="px-6 py-5 font-semibold text-gray-900">{note.matiere.nom}</td>
                      <td className="px-6 py-5 text-right">
                        <span className={`px-4 py-2 rounded-full font-bold text-lg ${
                          note.valeur >= 14 ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200' :
                          note.valeur >= 10 ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-200' :
                          'bg-red-100 text-red-800 ring-2 ring-red-200'
                        }`}>
                          {note.valeur}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-gray-800">{note.coefficient}</td>
                      <td className="px-6 py-5 text-right font-bold text-emerald-600">{pond.toFixed(1)}</td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.section>
      </main>
    </div>
  )
}

