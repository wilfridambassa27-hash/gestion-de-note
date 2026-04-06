export interface Note {
  id: string
  eleveId: string
  matiere: string
  note: number
  classe: string
}

export interface Eleve {
  id: string
  nom: string
  prenom: string
  classe: string
}

export interface classe {
  id: string
  nom: string
  description: string
}

export interface Enseignant {
  id: string
  nom: string
  prenom: string
  email: string
  matieres: string[]
}
