'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, Award, Download, X } from 'lucide-react'

interface ReleveNotesModalProps {
  etudiant: {
    id: string
    nom: string
    prenom: string
    classe: string
    notes: {
      matiere: string
      valeur: number
      credits: number
      typenote: string
      datenote: string
    }[]
  }
  onClose: () => void
}

export default function ReleveNotesModal({ etudiant, onClose }: ReleveNotesModalProps) {
  const moyenne = etudiant.notes.reduce((sum, note) => sum + (note.valeur * note.credits), 0) / etudiant.notes.reduce((sum, note) => sum + note.credits, 1)
  const mention = moyenne >= 16 ? 'Excellent' : moyenne >= 14 ? 'Très Bien' : moyenne >= 12 ? 'Bien' : moyenne >= 10 ? 'Assez Bien' : 'Passable'

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-3xl border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">RÉLEVÉ DE NOTES DÉTAILLÉ</h2>
            <p className="text-gray-600">{etudiant.prenom} {etudiant.nom} - {etudiant.classe}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-r from-emerald-50 to-emerald-50 p-6 rounded-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{moyenne.toFixed(2)}/20</p>
              <p className="text-sm text-gray-600 uppercase font-semibold tracking-wide">Moyenne générale</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-bold text-emerald-600">{mention}</p>
              <p className="text-sm text-gray-600 uppercase font-semibold tracking-wide">Mention</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-bold text-purple-600">{etudiant.notes.length} notes</p>
              <p className="text-sm text-gray-600 uppercase font-semibold tracking-wide">Total</p>
            </div>
          </div>

          {/* Notes Table */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
              Détail des notes
            </h3>
            <div className="overflow-x-auto rounded-2xl border shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Matière</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Note</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Crédits</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {etudiant.notes.map((note, index) => {
                    const noteClass = note.valeur >= 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{note.matiere}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                            {note.typenote}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-4 py-2 font-bold text-lg rounded-full ${noteClass}`}>
                            {note.valeur.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-gray-900">×{note.credits}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {new Date(note.datenote).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <Download className="w-5 h-5" />
              Télécharger PDF
            </button>
            <button className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-200 bg-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Imprimer
            </button>
            <button onClick={onClose} className="flex items-center justify-center gap-3 px-8 py-4 text-gray-600 hover:text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all">
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

