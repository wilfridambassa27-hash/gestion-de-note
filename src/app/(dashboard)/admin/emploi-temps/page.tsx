'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Calendar, Save, Users, BookOpen, Clock, ChevronLeft } from "lucide-react"
import { toast } from "react-hot-toast"

interface Classe { id: string; nom: string }
interface Enseignant { id: string; nom: string; specialite?: string }
interface Matiere { id: string; intitule: string; credits: number }

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const HEURES = ["08h00", "09h10", "10h20", "11h30", "14h00", "15h10", "16h20", "17h30"]

export default function EmploiTempsPage() {
  const { data: session } = useSession()
  const [classes, setClasses] = useState<Classe[]>([])
  const [enseignants, setEnseignants] = useState<Enseignant[]>([])
  const [matieres, setMatieres] = useState<Matiere[]>([])
    const [selectedClasse, setSelectedClasse] = useState('')
  const [emploi, setEmploi] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [classesRes, enseignantsRes, matieresRes] = await Promise.all([
        fetch('/api/classes').then(r => r.json()),
        fetch('/api/users?role=ENSEIGNANT').then(r => r.json()),
        fetch('/api/matieres').then(r => r.json())
      ])
      setClasses(classesRes)
      setEnseignants(enseignantsRes)
      setMatieres(matieresRes)
    } catch (error) {
      toast.error('Erreur chargement données emploi-temps')
    } finally {
      setLoading(false)
    }
  }

  const handleSlotChange = (jour: string, heure: string, value: string) => {
    setEmploi(prev => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        [heure]: value
      }
    }))
  }

  const saveEmploi = async () => {
    if (!selectedClasse) {
      toast.error('Sélectionnez une classe')
      return
    }
    setSaving(true)
    try {
      const response = await fetch(`/api/emploi-temps/${selectedClasse}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emploi)
      })
      if (response.ok) {
        toast.success('Emploi du temps sauvegardé!')
      } else {
        toast.error('Erreur serveur')
      }
    } catch (error) {
      toast.error('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  const emploiClasse = emploi[selectedClasse] || {} as Record<string, string>

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><Calendar className="w-16 h-16 animate-spin text-emerald-500" /></div>

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <ChevronLeft className="w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => window.history.back()} />
        <h1 className="text-3xl font-bold text-gray-900">Emploi du temps</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border p-6">
        <div className="flex gap-4 mb-6">
          <select 
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            <option value="">Sélectionnez une classe</option>
            {classes.map(c => <option key={c.id}>{c.nom}</option>)}
          </select>
          <button 
            onClick={saveEmploi}
            disabled={!selectedClasse || saving}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </button>
        </div>

        {selectedClasse ? (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left font-semibold text-gray-800 border-b">Heure / Jour</th>
                  {JOURS.map(jour => (
                    <th key={jour} className="p-4 text-center font-semibold text-gray-800 border-b uppercase">
                      {jour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEURES.map(heure => (
                  <tr key={heure} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold bg-emerald-50 border-r">{heure}</td>
                    {JOURS.map(jour => (
                      <td key={jour} className="p-3">
                        <select 
                          value={emploiClasse[heure] || ''}
                          onChange={(e) => handleSlotChange(jour, heure, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                        >

                          <option value="">Libre</option>
                          {matieres.map(matiere => (
                            enseignants.map(enseignant => (
                              <option key={`${matiere.id}-${enseignant.id}`} value={`${matiere.id}-${enseignant.id}`}>
                                📚 {matiere.intitule} ({enseignant.nom})
                              </option>
                            ))
                          ))}

                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl">
            <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-500 mb-2">Sélectionnez une classe</h3>
            <p className="text-gray-400">Pour commencer à éditer l'emploi du temps</p>
          </div>
        )}
      </div>
    </div>
  )
}

