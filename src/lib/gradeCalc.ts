/**
 * Grade calculation utilities for EduNotes
 * - weighted averages (by matière credits)
 * - mention labeling
 * - rank computation
 */

export interface NoteEntry {
  valeur: number
  credits: number         // Poids de la matière dans le semestre
  matiereId: string
  evalCoefficient?: number // Poids de l'évaluation dans la matière
}

export function getMention(moyenne: number): string {
  if (moyenne >= 18) return 'Excellent'
  if (moyenne >= 16) return 'Très Bien'
  if (moyenne >= 14) return 'Bien'
  if (moyenne >= 12) return 'Assez Bien'
  if (moyenne >= 10) return 'Passable'
  return 'Insuffisant'
}

export function getMentionColor(moyenne: number): string {
  if (moyenne >= 16) return '#16a34a'
  if (moyenne >= 14) return '#2563eb'
  if (moyenne >= 10) return '#d97706'
  return '#dc2626'
}

/**
 * Calcule la moyenne par matière (gestion des coefficients d'évaluation intra-matière).
 */
export function calcMoyennesParMatiere(notes: NoteEntry[]): Record<string, number> {
  const grouped: Record<string, { sum: number; coeffSum: number }> = {}
  for (const n of notes) {
    if (!grouped[n.matiereId]) grouped[n.matiereId] = { sum: 0, coeffSum: 0 }
    
    // Le poids d'une note dans sa matière est le coefficient de son Évaluation
    const coeff = n.evalCoefficient || 1
    grouped[n.matiereId].sum += n.valeur * coeff
    grouped[n.matiereId].coeffSum += coeff
  }
  const result: Record<string, number> = {}
  for (const [id, { sum, coeffSum }] of Object.entries(grouped)) {
    result[id] = coeffSum > 0 ? parseFloat((sum / coeffSum).toFixed(2)) : 0
  }
  return result
}

/**
 * Calcul de la moyenne générale (Somme(MoyenneMatiere * CreditsMatiere) / TotalCredits).
 */
export function calcMoyenneGenerale(notes: NoteEntry[], matiereCreditsMap?: Record<string, number>): number {
  if (notes.length === 0) return 0
  
  const moyennesParMatiere = calcMoyennesParMatiere(notes)
  
  const creditsMap = matiereCreditsMap || {}
  if (!matiereCreditsMap) {
     for (const n of notes) {
       if (!creditsMap[n.matiereId]) creditsMap[n.matiereId] = n.credits || 1
     }
  }

  let totalPoints = 0
  let totalCredits = 0
  
  for (const [matiereId, moyenne] of Object.entries(moyennesParMatiere)) {
    const credits = creditsMap[matiereId] || 1
    totalPoints += moyenne * credits
    totalCredits += credits
  }
  
  return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0
}

/**
 * Compute credits obtained (matières with moyenne >= 10).
 */
export function calcCreditsObtenus(
  moyennesParMatiere: Record<string, number>,
  matiereCredits: Record<string, number> // matiereId -> credits
): { creditsObtenus: number; creditsTotal: number } {
  let creditsObtenus = 0
  let creditsTotal = 0
  for (const [matiereId, credits] of Object.entries(matiereCredits)) {
    creditsTotal += credits
    const moy = moyennesParMatiere[matiereId] || 0
    if (moy >= 10) creditsObtenus += credits
  }
  return { creditsObtenus, creditsTotal }
}

/**
 * Rank students by descending moyenne.
 */
export function computeRanks<T extends { id: string; moyenne: number }>(
  items: T[]
): (T & { rang: number })[] {
  return [...items]
    .sort((a, b) => b.moyenne - a.moyenne)
    .map((item, i) => ({ ...item, rang: i + 1 }))
}
