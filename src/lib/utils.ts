// ============================================================
// utils.ts — Utilitaires Globaux de l'Application EduNotes
// Regroupe les fonctions de formatage, calcul de moyennes,
// génération de matricules et manipulation des dates/fuseaux.
// ============================================================

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ── CONFIGURATION DU FUSEAU HORAIRE ──
// Toutes les dates de l'application sont normalisées sur ce fuseau
export const TIMEZONE = 'Africa/Abidjan'

// ── FUSION DE CLASSES CSS (Tailwind + clsx) ──
/**
 * Combine plusieurs classes CSS en évitant les conflits Tailwind.
 * Exemple : cn('p-4', condition && 'bg-red-500') → "p-4 bg-red-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── FORMATAGE DES DATES ──

/**
 * Formate une date au format court français : JJ/MM/AAAA
 * Appliqué sur le fuseau horaire Afrique/Abidjan.
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TIMEZONE
  })
}

/**
 * Formate une date avec l'heure : JJ/MM/AAAA HH:MM
 * Utilisé dans les logs, historiques de saisie, etc.
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE
  })
}

/**
 * Formate une date avec les secondes : JJ/MM/AAAA HH:MM:SS
 * Pour les logs d'audit à haute précision.
 */
export function formatDateTimeWithSeconds(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: TIMEZONE
  })
}

/**
 * Retourne un objet Date représentant l'heure actuelle
 * dans le fuseau horaire Afrique/Abidjan.
 * Utile pour les horodatages côté serveur.
 */
export function getCurrentDateInTimezone(): Date {
  const now = new Date()
  const options = { timeZone: TIMEZONE }
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    ...options,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  // Extraction des parties individuelles via formatToParts
  const parts = formatter.formatToParts(now)
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0'
  
  return new Date(
    parseInt(getPart('year')),
    parseInt(getPart('month')) - 1, // Les mois JavaScript sont indexés à partir de 0
    parseInt(getPart('day')),
    parseInt(getPart('hour')),
    parseInt(getPart('minute')),
    parseInt(getPart('second'))
  )
}

/**
 * Convertit une date en chaîne ISO tout en appliquant le décalage
 * du fuseau horaire Afrique/Abidjan (UTC+0).
 */
export function toISOStringInTimezone(date: Date | string = new Date()): string {
  const d = new Date(date)
  const tzDate = new Date(d.toLocaleString('en-US', { timeZone: TIMEZONE }))
  const offset = tzDate.getTime() - d.getTime()
  return new Date(d.getTime() + offset).toISOString()
}

// ── CALCUL ACADÉMIQUE ──

/**
 * Retourne l'appréciation qualitative correspondant à une note sur 20.
 * Utilisé dans la génération des bulletins et rapports.
 */
export function getAppreciationFromNote(note: number): string {
  if (note >= 16) return 'Excellent'
  if (note >= 14) return 'Très bien'
  if (note >= 12) return 'Bien'
  if (note >= 10) return 'Passable'
  if (note >= 8)  return 'Insuffisant'
  return 'Faible'
}

/**
 * Calcule la moyenne pondérée d'une liste de notes par leurs crédits ECTS.
 * Formule : Σ(note × crédit) / Σ(crédits)
 * Retourne 0 si la liste est vide ou si le total des crédits est nul.
 */
export function calculateAverage(notes: { valeur: number; credits: number }[]): number {
  if (notes.length === 0) return 0
  
  const totalWeight = notes.reduce((sum, note) => sum + (note.credits || 0), 0)
  if (totalWeight === 0) return 0
  
  const totalScore = notes.reduce((sum, note) => sum + (note.valeur * (note.credits || 0)), 0)
  return Math.round((totalScore / totalWeight) * 100) / 100 // Arrondi à 2 décimales
}

// ── GÉNÉRATION DE MATRICULE ──

/**
 * Génère un matricule unique de format : [PRÉFIXE][ANNÉE][4 chiffres aléatoires]
 * Exemple : ETU20240042
 * Utilisé lors de l'inscription d'un nouvel étudiant.
 */
export function generateMatricule(prefix: string = 'ETU'): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${year}${random}`
}
