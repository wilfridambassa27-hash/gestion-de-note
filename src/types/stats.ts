export interface StatsData {
  totalEtudiants: number
  totalEnseignants: number
  totalClasses: number
  totalMatieres: number
  notesParMatiere: Array<{ matiere: string; moyenne: number; highest: number; lowest: number; count: number }>
  repartitionParClasse: Array<{ name: string; effectif: number; moyenne: number }>
  evolutionInscriptions: Array<{ mois: string; inscriptions: number }>
  evolutionMoyennes: Array<{ trimestre: string; moyenne: number }>
  tauxReussite: number
  tauxMention: number
  moyenneGenerale: number
  recentNotes: Array<{ id: string; etudiant: string; matiere: string; valeur: number; date: string }>
}

export interface DashboardData {
  enseignant: {
    id: string
    matricule: string
    nom: string
    prenom: string
    specialite?: string
  }
  stats: {
    totalEleves: number
    notesSaisies: number
    moyenneGenerale: number
    notesEnAttente: number
    classesCount: number
    matieresCount: number
    tauxReussite?: string | number
  }
  classes: Array<{
    id: string
    nom: string
    niveau?: string
    effectif: number
    moyenne: number
  }>
  matieres: Array<{
    id: string
    nom: string
    code: string
    classe: string
    credits: number
  }>
  recentNotes: Array<{
    id: string
    etudiant: string
    matiere: string
    valeur: number
    type?: string
    date: string
    validee: boolean
  }>
  pendingNotes: Array<{
    id: string
    etudiant: string
    matiere: string
    valeur: number
    type?: string
    date: string
  }>
  notesByMonth: Array<{
    month: string
    count: number
  }>
  topClasses: Array<{
    id: string
    nom: string
    avg_note: number
    note_count: number
  }>
  emploiPreview: Array<{
    id: string
    jour: string
    heureDebut: string
    classe: string
    matiere: string
  }>
}

