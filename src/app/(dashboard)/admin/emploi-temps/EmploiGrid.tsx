'use client'

import { useState, useEffect, DragEvent } from 'react'
import { motion } from 'framer-motion'
import { Calendar, User, BookOpen, MapPin, Save, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface EmploiSlot {
  id: string
  jour: string
  heureDebut: string
  heureFin: string
  enseignantId?: string
  enseignant?: { user: { nom: string; prenom: string } }
  matiereId: string
  matiere: { intitule: string }
  salle?: string
}

interface Props {
  emplois: EmploiSlot[]
  classeId: string
  enseignants: Array<{id: string; nom: string; prenom: string; specialite?: string}>
  matieres: Array<{id: string; intitule: string; credits: number}>
  onSave: () => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function EmploiGrid({ emplois, classeId, enseignants, matieres, onSave, onDelete }: Props) {
const [emploiMap, setEmploiMap] = useState<Record<string, EmploiSlot | undefined>>({})
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [selectedClasse, setSelectedClasse] = useState('')
  const [saving, setSaving] = useState(false)
  const [conflicts, setConflicts] = useState<string[]>([])

  const JOURS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM']
  const SLOTS = [
    { debut: '08h00', fin: '09h00' },
    { debut: '09h10', fin: '10h10' },
    { debut: '10h20', fin: '11h20' },
    { debut: '11h30', fin: '12h30' },
    { debut: '14h00', fin: '15h00' },
    { debut: '15h10', fin: '16h10' },
    { debut: '16h20', fin: '17h20' },
    { debut: '17h30', fin: '18h30' }
  ]

  useEffect(() => {
    const map: Record<string, EmploiSlot | undefined> = {}
    emplois.forEach(emploi => {
      const key = `${emploi.jour}-${emploi.heureDebut}`
      map[key] = emploi
    })
    setEmploiMap(map)
  }, [emplois])

  const detectConflicts = () => {
    const teacherSlots = new Map<string, string[]>()
    const conflicts: string[] = []

    Object.values(emploiMap).forEach((slot) => {
      if (slot?.enseignantId) {
        if (!teacherSlots.has(slot.enseignantId)) {
          teacherSlots.set(slot.enseignantId, [])
        }
        teacherSlots.get(slot.enseignantId)!.push(`${slot.jour}-${slot.heureDebut}`)
      }
    })

    teacherSlots.forEach((slots, teacherId) => {
      if (slots.length > 1) {
        conflicts.push(`Prof ${enseignants.find(e => e.id === teacherId)?.nom} surbooké`)
      }
    })

    setConflicts(conflicts)
    return conflicts.length === 0
  }

  const onDragStart = (e: DragEvent, item: string, type: 'enseignant' | 'matiere' | 'salle') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: item, type }))
    setDraggedItem(item)
  }

  const onDrop = async (e: DragEvent, jour: string, heureDebut: string) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('text/plain')
    const { id, type } = JSON.parse(data)
    
    const key = `${jour}-${heureDebut}`
    const existing = emploiMap[key]

    if (existing && existing.id) {
      // Update existing
      const updated = {
        ...existing,
        [type === 'enseignant' ? 'enseignantId' : type === 'matiere' ? 'matiereId' : 'salle']: id
      }
      await onDelete(existing.id)
      await createSlot({
        classeId,
        jour,
        heureDebut: updated.heureDebut || SLOTS.find(s => s.debut === heureDebut)?.debut || '08h00',
        heureFin: SLOTS.find(s => s.debut === heureDebut)?.fin || '09h00',
        enseignantId: updated.enseignantId,
        matiereId: updated.matiereId,
        salle: updated.salle
      })
    } else {
      // Create new
      await createSlot({
        classeId,
        jour,
        heureDebut,
        heureFin: SLOTS.find(s => s.debut === heureDebut)?.fin || '09h00',
        enseignantId: type === 'enseignant' ? id : undefined,
        matiereId: type === 'matiere' ? id : undefined,
        salle: type === 'salle' ? id : undefined
      })
    }

    setDraggedItem(null)
  }

  const createSlot = async (data: any) => {
    try {
      const response = await fetch(`/api/emploi-temps/${classeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        toast.success('Créneau ajouté')
        // Refresh data
        window.location.reload()
      }
    } catch (error) {
      toast.error('Erreur création créneau')
    }
  }

  const getSlotKey = (slot: EmploiSlot) => `${slot.jour}-${slot.heureDebut}`

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <h2 className="text-2xl font-bold text-gray-800">Emploi du temps</h2>
        <div className="flex gap-2 ml-auto">
          <button 
            onClick={() => detectConflicts() && onSave()}
            disabled={conflicts.length > 0 || saving}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
          {conflicts.length > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-orange-800 rounded-lg text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {conflicts.length} conflit(s)
            </div>
          )}
        </div>
      </div>

      {/* Drag Sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Enseignants
          </h3>
          <div className="space-y-2">
            {enseignants.map(e => (
              <div
                key={e.id}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-emerald-200 transition-all flex items-center gap-3"
                draggable
                onDragStart={(ev) => onDragStart(ev, e.id, 'enseignant')}
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {e.prenom.charAt(0)}{e.nom.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">{e.prenom} {e.nom}</p>
                  <p className="text-xs text-gray-500">{e.specialite}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Matières
          </h3>
          <div className="space-y-2">
            {matieres.map(m => (
              <div
                key={m.id}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-emerald-200 transition-all flex items-center gap-3"
                draggable
                onDragStart={(ev) => onDragStart(ev, m.id, 'matiere')}
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  📚
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">{m.intitule}</p>
                  <p className="text-xs text-gray-500">Crédits: {m.credits}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Salles
          </h3>
          <div className="space-y-2">
            {['A101', 'A102', 'A103', 'Lab1', 'Lab2', 'Amphi', 'SalleInfo'].map(salle => (
              <div
                key={salle}
                className="p-3 bg-green-50 hover:bg-green-100 rounded-xl cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-green-200 transition-all flex items-center gap-3"
                draggable
                onDragStart={(ev) => onDragStart(ev, salle, 'salle')}
              >
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  🏫
                </div>
                <p className="font-medium text-sm text-gray-800">{salle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-3xl p-8 shadow-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full min-w-[1600px] border-collapse">
          <thead>
            <tr className="bg-white/60 backdrop-blur">
              <th className="p-6 text-left font-bold text-slate-800 border border-slate-200 rounded-l-3xl">Heure / Jour</th>
              {JOURS.map(jour => (
                <th key={jour} className="p-6 text-center font-bold text-slate-800 border border-slate-200 uppercase tracking-wide">
                  {jour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map(slot => (
              <tr key={slot.debut}>
                <td className="p-6 font-bold text-lg bg-gradient-to-r from-emerald-500/10 to-emerald-500/10 text-emerald-800 border-r border-slate-200">
                  {slot.debut}<br />
                  <span className="text-sm font-normal text-emerald-600">{slot.fin}</span>
                </td>
                {JOURS.map(jour => {
                  const key = `${jour}-${slot.debut}`
                  const emploi = emploiMap[key]
                  const isConflict = false // TODO: compute

                  return (
                    <td 
                      key={jour}
                      className="relative p-4 border border-slate-200 min-w-[200px] h-24 align-top hover:bg-slate-50 group"
onDragOver={(e) => e.dataTransfer.dropEffect = 'move'}
                      onDrop={(e) => onDrop(e, jour, slot.debut)}
                    >
                      {emploi ? (
                        <div className="h-full p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-200 rounded-xl group-hover:shadow-md transition-all">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              {emploi.matiere?.intitule.charAt(0)}
                            </div>
                            <p className="text-xs text-emerald-800 font-semibold">{emploi.matiere?.intitule}</p>
                          </div>
                          {emploi.enseignant && (
                            <p className="text-xs text-emerald-700">{emploi.enseignant.user.prenom} {emploi.enseignant.user.nom.charAt(0)}.</p>
                          )}
                          {emploi.salle && (
                            <p className="text-xs text-gray-600 mt-1">{emploi.salle}</p>
                          )}
                          <button
                            onClick={() => onDelete(emploi.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-full border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 transition-colors cursor-pointer flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      {isConflict && (
                        <AlertTriangle className="absolute top-1 left-1 w-4 h-4 text-emerald-600" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

