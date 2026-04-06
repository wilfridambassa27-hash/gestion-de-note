// ============================================================
// logger.ts — Service de Journalisation Centralisée (Audit Trail)
// Enregistre toutes les actions importantes dans la base de données
// pour la traçabilité, la conformité et les notifications.
// ============================================================

import prisma from '@/lib/prisma'

// ── TYPES D'ACTIONS JOURNALISABLES ──
// Chaque type d'action correspond à une opération métier distincte
export type LogAction = 
  | 'CREATE'       // Création d'une ressource (note, utilisateur, classe...)
  | 'UPDATE'       // Modification d'une ressource existante
  | 'DELETE'       // Suppression d'une ressource
  | 'LOGIN'        // Connexion d'un utilisateur
  | 'LOGOUT'       // Déconnexion d'un utilisateur
  | 'VIEW'         // Consultation d'une donnée sensible
  | 'EXPORT'       // Export de données (PDF, Excel...)
  | 'VALIDATION'   // Validation officielle d'une note ou bulletin
  | 'INSCRIPTION'  // Inscription d'un étudiant
  | 'ARCHIVE'      // Archivage d'une ressource

// ── TYPES DE RESSOURCES JOURNALISABLES ──
// Catégorise quel module de l'application a généré l'action
export type LogType = 
  | 'USER'         // Actions sur les comptes utilisateurs
  | 'NOTE'         // Saisie / modification de notes
  | 'CLASSE'       // Gestion des classes
  | 'MATIERE'      // Gestion des matières / UE
  | 'BULLETIN'     // Génération / consultation de bulletins
  | 'SEMESTRE'     // Gestion des semestres académiques
  | 'AUTH'         // Événements d'authentification
  | 'SYSTEM'       // Actions système (maintenance, backup...)
  | 'NOTIFICATION' // Envoi de notifications

// ── INTERFACE DES PARAMÈTRES DE LOG ──
interface LogParams {
  userId?: string                     // ID de l'utilisateur à l'origine de l'action
  action: LogAction                   // Type d'action effectuée
  type: LogType                       // Module concerné
  description: string                 // Message lisible décrivant l'action
  details?: Record<string, any>       // Données supplémentaires (ex: champs modifiés)
  ipAddress?: string                  // Adresse IP du client
  userAgent?: string                  // Navigateur / agent HTTP utilisé
}

// ── CRÉATION D'UN LOG ──
/**
 * Enregistre une action dans la table `Log` de la base de données.
 * Ne lève jamais d'erreur : une défaillance du logger ne doit pas
 * bloquer l'opération métier principale.
 */
export async function createLog({
  userId,
  action,
  type,
  description,
  details,
  ipAddress,
  userAgent
}: LogParams) {
  try {
    const log = await prisma.log.create({
      data: {
        userId: userId || null,
        action,
        typeaction: type,
        description,
        details: details ? JSON.stringify(details) : null, // Sérialisation des métadonnées
        adresseip: ipAddress || null,
        useragent: userAgent || null,
        statut: 'SUCCES'
      }
    })
    return log
  } catch (error) {
    console.error('Error creating log:', error)
    // Le logger ne doit jamais bloquer le flux principal
    return null
  }
}

// ── RÉCUPÉRATION DES LOGS RÉCENTS ──
/**
 * Retourne les N derniers logs triés par date décroissante.
 * Inclut les informations de l'utilisateur lié pour l'affichage admin.
 */
export async function getRecentLogs(limit: number = 20) {
  try {
    return await prisma.log.findMany({
      take: limit,
      orderBy: { dateaction: 'desc' },
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return []
  }
}

// ── RÉCUPÉRATION DES LOGS PAR TYPE ──
/**
 * Filtre les logs selon leur catégorie (ex: tous les logs de type 'NOTE').
 * Utile pour les tableaux de bord spécialisés.
 */
export async function getLogsByType(type: LogType, limit: number = 50) {
  try {
    return await prisma.log.findMany({
      where: { typeaction: type },
      take: limit,
      orderBy: { dateaction: 'desc' },
      include: {
        user: {
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching logs by type:', error)
    return []
  }
}

// ── NOTIFICATIONS NON LUES ──
/**
 * Récupère les logs des dernières 24h générés par d'autres utilisateurs.
 * Utilisé pour alimenter le panneau de notifications en temps réel.
 */
export async function getUnreadNotifications(userId?: string) {
  try {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1) // Fenêtre temporelle : 24 heures

    const notifications = await prisma.log.findMany({
      where: {
        dateaction: { gte: oneDayAgo },
        ...(userId ? { userId: { not: userId } } : {}) // Exclut les propres actions de l'utilisateur
      },
      orderBy: { dateaction: 'desc' },
      take: 10 // Limite à 10 notifications pour des performances optimales
    })

    return notifications
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}
