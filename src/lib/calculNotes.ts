/**
 * Utilitaire de calcul des notes - Système 类似Pronote
 * Inclut le calcul des moyennes, classements, mentions et crédits
 * Utilise lodash pour les opérations sur les tableaux et objets
 */

import _ from 'lodash'

// Types pour le calcul
export interface NoteInput {
  valeur: number
  credits: number
}

export interface ResultatMatiere {
  matiereId: string
  matiereNom: string
  credits: number
  notes: NoteInput[]
  moyenne: number
  valeurMax: number
  valeurMin: number
}

export interface ResultatSemestre {
  semestreId: string
  semestreNom: string
  resultatsMatieres: ResultatMatiere[]
  moyenneGenerale: number
  totalCredits: number
  rang: number
  mention: string
  creditsObtenus: number
  creditsTotal: number
}

export interface Decision {
  decision: string
  couleur: string
  description: string
}

// Configuration du système de notation
export const CONFIG_NOTATION = {
  noteMin: 0,
  noteMax: 20,
  seuilReussite: 10,
  seuilMention: {
    TB: 16,  // Très Bien
    B: 14,   // Bien
    AB: 12,  // Assez Bien
    P: 10,   // Passable
  },
  baremeCredits: {
    // Crédits par tranche de moyenne
    18: 3,
    16: 3,
    14: 2,
    12: 2,
    10: 1,
    0: 0,
  }
}

/**
 * Calcule la moyenne pondérée d'un ensemble de notes
 * Utilise lodash pour une meilleure gestion des tableaux
 */
export function calculerMoyennePonderee(notes: NoteInput[]): number {
  if (!notes || _.isEmpty(notes)) return 0
  
  // Filtrer les notes valides avec lodash
  const notesValides = _.filter(notes, (note) => 
    _.isNumber(note.valeur) && _.isNumber(note.credits)
  )
  
  if (_.isEmpty(notesValides)) return 0
  
  // Utiliser map pour transformer les notes
  const notesPonderees = _.map(notesValides, (note) => ({
    valeur: _.clamp(note.valeur, CONFIG_NOTATION.noteMin, CONFIG_NOTATION.noteMax),
    cred: note.credits || 1
  }))
  
  // Calculer la somme avec reduce
  const { somme, totalCredits } = _.reduce(notesPonderees, (acc, note) => ({
    somme: acc.somme + (note.valeur * note.cred),
    totalCredits: acc.totalCredits + note.cred
  }), { somme: 0, totalCredits: 0 })
  
  return totalCredits > 0 ? _.round(somme / totalCredits, 2) : 0
}

/**
 * Calcule la moyenne avec crédits personnalisés
 * Permet une matrice de calcul flexible avec lodash
 */
export function calculerMoyenneMatrice(
  notes: NoteInput[], 
  matriceCredits: Record<string, number> = {}
): number {
  if (!notes || _.isEmpty(notes)) return 0
  
  // Utiliser map pour transformer les notes avec la matrice
  const notesTransformees = _.map(notes, (note) => ({
    valeur: _.clamp(note.valeur, CONFIG_NOTATION.noteMin, CONFIG_NOTATION.noteMax),
    cred: _.get(matriceCredits, note.valeur.toString(), note.credits || 1)
  }))
  
  // Calculer la somme pondérée
  const { somme, totalCredits } = _.reduce(notesTransformees, (acc, note) => ({
    somme: acc.somme + (note.valeur * note.cred),
    totalCredits: acc.totalCredits + note.cred
  }), { somme: 0, totalCredits: 0 })
  
  return totalCredits > 0 ? _.round(somme / totalCredits, 2) : 0
}

/**
 * Détermine la mention en fonction de la moyenne
 */
export function getMention(moyenne: number): string {
  if (moyenne >= CONFIG_NOTATION.seuilMention.TB) return 'Très Bien'
  if (moyenne >= CONFIG_NOTATION.seuilMention.B) return 'Bien'
  if (moyenne >= CONFIG_NOTATION.seuilMention.AB) return 'Assez Bien'
  if (moyenne >= CONFIG_NOTATION.seuilMention.P) return 'Passable'
  return 'Insuffisant'
}

/**
 * Retourne le code couleur de la mention
 */
export function getMentionCouleur(moyenne: number): string {
  if (moyenne >= CONFIG_NOTATION.seuilMention.TB) return 'text-green-600'
  if (moyenne >= CONFIG_NOTATION.seuilMention.B) return 'text-blue-600'
  if (moyenne >= CONFIG_NOTATION.seuilMention.AB) return 'text-yellow-600'
  if (moyenne >= CONFIG_NOTATION.seuilMention.P) return 'text-orange-600'
  return 'text-red-600'
}

/**
 * Calcule les crédits obtenus en fonction de la moyenne
 * Utilise lodash pour une recherche plus propre
 */
export function calculerCredits(moyenne: number, creditsTotal: number): number {
  const seuils = [18, 16, 14, 12, 10, 0]
  const creditsParTranche: Record<number, number> = {
    18: 3,
    16: 3,
    14: 2,
    12: 2,
    10: 1,
    0: 0,
  }
  
  // Trouver le premier seuil atteint avec lodash
  const seuilAtteint = _.find(seuils, (seuil) => moyenne >= seuil)
  const credits = _.get(creditsParTranche, seuilAtteint ?? 0, 0)
  
  return creditsTotal * credits
}

/**
 * Calcule le rang d'un étudiant dans une liste
 * Utilise lodash pour le tri et les opérations de comptage
 */
export function calculerRang(
  moyenneEtudiant: number,
  toutesMoyennes: number[]
): number {
  if (!toutesMoyennes || _.isEmpty(toutesMoyennes)) return 1
  
  // Trier les moyennes en ordre décroissant avec lodash
  const moyennesTriees = _.orderBy(toutesMoyennes, [], ['desc'])
  
  // Trouver le rang avec lodash
  const rang = _.findIndex(moyennesTriees, (m) => m === moyenneEtudiant) + 1
  
  // Gérer les ex aequo
  const memeMoyenne = _.filter(toutesMoyennes, (m) => m === moyenneEtudiant).length
  if (memeMoyenne > 1) {
    const premierePosition = _.findIndex(moyennesTriees, (m) => m === moyenneEtudiant) + 1
    return premierePosition || 1
  }
  
  return rang || 1
}

/**
 * Détermine la décision du conseil de classe
 */
export function getDecision(moyenne: number, creditsObtenus: number, creditsTotal: number): Decision {
  const pourcentageCredits = (creditsObtenus / creditsTotal) * 100
  
  if (moyenne >= 10 && pourcentageCredits >= 60) {
    return {
      decision: 'ADMIS',
      couleur: 'green',
      description: 'Admis(e) dans la classe supérieure'
    }
  }
  
  if (moyenne >= 10 && pourcentageCredits < 60) {
    return {
      decision: 'REDOUBLANT',
      couleur: 'red',
      description: 'Redoublement obligatoire - crédits insuffisants'
    }
  }
  
  if (moyenne >= 8 && moyenne < 10) {
    return {
      decision: 'CONSEIL',
      couleur: 'orange',
      description: 'Passage soumis à l\'avis du conseil de classe'
    }
  }
  
  return {
    decision: 'EXCLU',
    couleur: 'red',
    description: 'Exclu(e) de l\'établissement'
  }
}

/**
 * Calcule les statistiques d'une matière
 * Utilise lodash pour des calculs statistiques précis
 */
export function calculerStatistiquesMatiere(notes: number[]): {
  moyenne: number
  mediane: number
  ecartType: number
  min: number
  max: number
  effectif: number
} {
  if (!notes || _.isEmpty(notes)) {
    return { moyenne: 0, mediane: 0, ecartType: 0, min: 0, max: 0, effectif: 0 }
  }
  
  const n = notes.length
  
  // Moyenne avec lodash
  const moyenne = _.mean(notes)
  
  // Min et Max avec lodash
  const min = _.min(notes) ?? 0
  const max = _.max(notes) ?? 0
  
  // Médiane avec lodash
  const notesTriees = _.orderBy(notes)
  const mediane = n % 2 === 0 
    ? _.round((notesTriees[n/2 - 1] + notesTriees[n/2]) / 2, 2)
    : notesTriees[Math.floor(n/2)] ?? 0
  
  // Écart-type avec lodash
  const ecarts = _.map(notes, (note) => Math.pow(note - moyenne, 2))
  const variance = _.mean(ecarts)
  const ecartType = _.round(Math.sqrt(variance), 2)
  
  return {
    moyenne: _.round(moyenne, 2),
    mediane: _.round(mediane, 2),
    ecartType,
    min,
    max,
    effectif: n
  }
}

/**
 * Calcule la progression de l'étudiant entre deux périodes
 * Utilise lodash pour des calculs précis
 */
export function calculerProgression(
  moyennePeriode1: number,
  moyennePeriode2: number
): {
  progression: number
  tendance: 'hausse' | 'baisse' | 'stable'
  pourcentage: number
} {
  const progression = _.round(moyennePeriode2 - moyennePeriode1, 2)
  
  const pourcentage = moyennePeriode1 > 0 
    ? _.round((progression / moyennePeriode1) * 100, 2)
    : 0
  
  // Déterminer la tendance avec lodash
  let tendance: 'hausse' | 'baisse' | 'stable' = 'stable'
  if (progression > 0.5) tendance = 'hausse'
  else if (progression < -0.5) tendance = 'baisse'
  
  return {
    progression,
    tendance,
    pourcentage
  }
}

/**
 * Calcule les statistiques agrégées pour un groupe d'étudiants
 * Utilise lodash pour des opérations de groupe avancées
 */
export function calculerStatistiquesGroupe(
  moyennes: number[]
): {
  moyenne: number
  mediane: number
  ecartType: number
  min: number
  max: number
  q1: number
  q3: number
  effectif: number
  distribution: Record<string, number>
} {
  if (!moyennes || _.isEmpty(moyennes)) {
    return { 
      moyenne: 0, mediane: 0, ecartType: 0, 
      min: 0, max: 0, q1: 0, q3: 0, 
      effectif: 0, distribution: {} 
    }
  }
  
  const effectif = moyennes.length
  const moyenne = _.mean(moyennes)
  const min = _.min(moyennes) ?? 0
  const max = _.max(moyennes) ?? 0
  
  // Tri pour les quantiles et calcul de la médiane manuellement
  const triees = _.orderBy(moyennes)
  const medianeIndex = Math.floor(triees.length / 2)
  const mediane = triees.length % 2 === 0 
    ? _.round((triees[medianeIndex - 1] + triees[medianeIndex]) / 2, 2)
    : _.round(triees[medianeIndex], 2)
  
  // Quartiles
  const q1Index = Math.floor(effectif * 0.25)
  const q3Index = Math.floor(effectif * 0.75)
  const q1 = triees[q1Index] ?? 0
  const q3 = triees[q3Index] ?? 0
  
  // Écart-type
  const ecarts = _.map(moyennes, (m) => Math.pow(m - moyenne, 2))
  const variance = _.mean(ecarts)
  const ecartType = _.round(Math.sqrt(variance), 2)
  
  // Distribution par tranche de notes
  const distribution = _.countBy(moyennes, (m) => {
    if (m >= 16) return 'excellent'
    if (m >= 14) return 'bien'
    if (m >= 12) return 'assez-bien'
    if (m >= 10) return 'passable'
    return 'insuffisant'
  })
  
  return {
    moyenne: _.round(moyenne, 2),
    mediane,
    ecartType,
    min,
    max,
    q1: _.round(q1, 2),
    q3: _.round(q3, 2),
    effectif,
    distribution
  }
}

/**
 * Formate la moyenne pour l'affichage
 */
export function formaterMoyenne(moyenne: number): string {
  return moyenne.toFixed(2).replace('.', ',')
}

/**
 * Convertit une note sur 20 vers un pourcentage
 */
export function noteVersPourcentage(note: number): number {
  return _.round(note * 5)
}

/**
 * Convertit un pourcentage vers une note sur 20
 */
export function pourcentageVersNote(pourcentage: number): number {
  return _.round(pourcentage / 5, 2)
}

/**
 * Regroupe les notes par matière
 * Utilise lodash pour un groupBy performant
 */
export function regrouperNotesParMatiere(
  notes: Array<{ matiereId: string; matiereNom: string; valeur: number; credits: number }>
): Record<string, { matiereNom: string; notes: NoteInput[] }> {
  const grouped = _.groupBy(notes, 'matiereId')
  
  // Transformer le résultat pour correspondre au type attendu
  const result: Record<string, { matiereNom: string; notes: NoteInput[] }> = {}
  
  _.forEach(grouped, (notesMatiere, matiereId) => {
    result[matiereId] = {
      matiereNom: notesMatiere[0]?.matiereNom || '',
      notes: _.map(notesMatiere, (n) => ({ valeur: n.valeur, credits: n.credits }))
    }
  })
  
  return result
}

/**
 * Calcule la moyenne générale d'un élève avec toutes ses matières
 */
export function calculerMoyenneGenerale(
  resultatsMatieres: Array<{ moyenne: number; credits: number }>
): number {
  if (_.isEmpty(resultatsMatieres)) return 0
  
  const { somme, totalCredits } = _.reduce(resultatsMatieres, (acc, rm) => ({
    somme: acc.somme + (rm.moyenne * rm.credits),
    totalCredits: acc.totalCredits + rm.credits
  }), { somme: 0, totalCredits: 0 })
  
  return totalCredits > 0 ? _.round(somme / totalCredits, 2) : 0
}

/**
 * Trie les étudiants par moyenne (décroissant)
 */
export function trierParMoyenne<T extends { moyenne: number }>(
  etudiants: T[]
): T[] {
  return _.orderBy(etudiants, ['moyenne'], ['desc'])
}

/**
 * Filtre les étudiants selon un seuil de moyenne
 */
export function filtrerParSeuil(
  etudiants: Array<{ moyenne: number }>,
  seuil: number
): Array<{ moyenne: number }> {
  return _.filter(etudiants, (e) => e.moyenne >= seuil)
}
