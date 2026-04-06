export interface Classe {
  id: string
  nom: string
  niveau: string
  filiere: string
  anneeacademique: string
  capacitemax: number
  effectif: number
  actif: boolean
}

export interface ClasseFormData {
  nom: string
  niveau: string
  filiere: string
  anneeacademique: string
  capacitemax: number
}

export interface ClasseFrontend {
  id: string
  nom: string
  niveau: string
  filiere: string
  anneeacademique: string
  capacite: number
  effectif: number
  actif: boolean
}
