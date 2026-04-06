'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

type Language = 'fr' | 'en' | 'es' | 'de'
type Theme = 'light' | 'dark'

interface Translations {
  [key: string]: {
    [key in Language]: string
  }
}

const translations: Translations = {
  // General
  'dashboard': { fr: 'Tableau de bord', en: 'Dashboard', es: 'Tablero', de: 'Dashboard' },
  'settings': { fr: 'Paramètres', en: 'Settings', es: 'Ajustes', de: 'Einstellungen' },
  'logout': { fr: 'Déconnexion', en: 'Logout', es: 'Cerrar sesión', de: 'Abmelden' },
  'save': { fr: 'Enregistrer', en: 'Save', es: 'Guardar', de: 'Speichern' },
  'delete': { fr: 'Supprimer', en: 'Delete', es: 'Eliminar', de: 'Löschen' },
  'cancel': { fr: 'Annuler', en: 'Cancel', es: 'Cancelar', de: 'Abbrechen' },
  'validate': { fr: 'Valider', en: 'Validate', es: 'Validar', de: 'Validieren' },
  
  // Teacher Dashboard
  'welcome': { fr: 'Bienvenue', en: 'Welcome', es: 'Bienvenido', de: 'Willkommen' },
  'active_session': { fr: 'Session Active', en: 'Active Session', es: 'Sesión Activa', de: 'Aktive Sitzung' },
  'teacher_space': { fr: 'Espace Enseignant', en: 'Teacher Space', es: 'Espacio del Profesor', de: 'Lehrerbereich' },
  
  // Mes Classes
  'my_classes': { fr: 'Mes Classes', en: 'My Classes', es: 'Mis Clases', de: 'Meine Klassen' },
  'access': { fr: 'Accéder', en: 'Access', es: 'Acceder', de: 'Zugreifen' },
  'modify': { fr: 'Modifier', en: 'Modify', es: 'Modificar', de: 'Ändern' },
  'semester': { fr: 'Semestre', en: 'Semester', es: 'Semestre', de: 'Semester' },
  'note': { fr: 'Note', en: 'Grade', es: 'Nota', de: 'Note' },
  'credit': { fr: 'Crédit', en: 'Credit', es: 'Crédito', de: 'Kredit' },
  'weighted_note': { fr: 'Note Pondérée', en: 'Weighted Grade', es: 'Nota Ponderada', de: 'Gewichtete Note' },
  'manage_classes_desc': { fr: 'Gérer les effectifs et suivis', en: 'Manage rosters and tracking', es: 'Gestionar listas y seguimiento', de: 'Listen und Tracking verwalten' },

  // Dashboard Shortcuts
  'quick_entry': { fr: 'Saisie Rapide', en: 'Quick Entry', es: 'Entrada Rápida', de: 'Schnelleingabe' },
  'access_notes_register': { fr: 'Accédez au registre de notes', en: 'Access the gradebook', es: 'Acceder al registro de notas', de: 'Zugriff auf das Notenbuch' },

  // Navigation
  'nav_dashboard': { fr: 'Tableau de bord', en: 'Dashboard', es: 'Tablero', de: 'Dashboard' },
  'nav_users': { fr: 'Utilisateurs', en: 'Users', es: 'Usuarios', de: 'Benutzer' },
  'nav_classes': { fr: 'Mes Classes', en: 'My Classes', es: 'Mis Clases', de: 'Meine Klassen' },
  'nav_notes': { fr: 'Saisie Notes', en: 'Enter Grades', es: 'Ingresar Notas', de: 'Noten Eingeben' },
  'nav_stats': { fr: 'Statistiques', en: 'Statistics', es: 'Estadísticas', de: 'Statistiken' },
  'nav_settings': { fr: 'Paramètres', en: 'Settings', es: 'Ajustes', de: 'Einstellungen' },
  
  // Metrics
  'metric_effectif': { fr: 'Effectif', en: 'Roster', es: 'Plantilla', de: 'Personal' },
  'metric_actifs': { fr: 'Actifs', en: 'Active', es: 'Activos', de: 'Aktiv' },
  'metric_moyenne': { fr: 'Moyenne', en: 'Average', es: 'Promedio', de: 'Durchschnitt' },
  'metric_classes': { fr: 'Classes', en: 'Classes', es: 'Clases', de: 'Klassen' },
  'metric_volume': { fr: 'Volume', en: 'Volume', es: 'Volumen', de: 'Volumen' },
  'metric_reussite': { fr: 'Réussite', en: 'Success', es: 'Éxito', de: 'Erfolg' },
  
  'desc_effectif': { fr: "Nombre total d'élèves inscrits dans vos classes.", en: "Total number of students enrolled in your classes.", es: "Número total de estudiantes inscritos en sus clases.", de: "Gesamtzahl der in Ihren Klassen eingeschriebenen Schüler." },
  'desc_actifs': { fr: "Étudiants présents et actifs cette semaine.", en: "Students present and active this week.", es: "Estudiantes presentes y activos esta semana.", de: "Diese Woche anwesende und aktive Schüler." },
  'desc_moyenne': { fr: "Performance académique globale actuelle.", en: "Current overall academic performance.", es: "Rendimiento académico general actual.", de: "Aktuelle akademische Gesamtleistung." },
  'desc_classes': { fr: "Nombre total de classes sous votre gestion.", en: "Total number of classes under your management.", es: "Número total de clases bajo su gestión.", de: "Gesamtzahl der unter Ihrer Leitung stehenden Klassen." },
  'desc_volume': { fr: "Nombre d'heures de cours planifiées par semaine.", en: "Number of class hours planned per week.", es: "Número de horas de clase planificadas por semana.", de: "Anzahl der pro Woche geplanten Unterrichtsstunden." },
  'desc_reussite': { fr: "Taux de réussite global au dernier semestre.", en: "Overall success rate in the last semester.", es: "Tasa de éxito general en el último semestre.", de: "Gesamterfolgsquote im letzten Semester." },
  'details_analytics': { fr: 'Détails Analytiques', en: 'Analytical Details', es: 'Detalles Analíticos', de: 'Analytische Details' },
  'semester_1': { fr: 'Semestre 1', en: 'Semester 1', es: 'Semestre 1', de: 'Semester 1' },
  'semester_2': { fr: 'Semestre 2', en: 'Semester 2', es: 'Semestre 2', de: 'Semester 2' },
  'archive': { fr: 'Archiver', en: 'Archive', es: 'Archivar', de: 'Archivieren' },
  'archive_success': { fr: 'Classe archivée avec succès', en: 'Class archived successfully', es: 'Clase archivada con éxito', de: 'Klasse erfolgreich archiviert' },
  'validation_success': { fr: 'Notes validées et notifiées', en: 'Grades validated and notified', es: 'Notas validadas y notificadas', de: 'Noten validiert und benachrichtigt' },
  'confirm_delete': { fr: 'Êtes-vous sûr de vouloir supprimer cette classe ?', en: 'Are you sure you want to delete this class?', es: '¿Está seguro de que desea eliminar esta clase?', de: 'Sind Sie sicher, dass Sie diese Klasse löschen möchten?' },
  'save_success': { fr: 'Enregistré avec succès', en: 'Saved successfully', es: 'Guardado con éxito', de: 'Erfolgreich gespeichert' },
  'appearance': { fr: 'Apparence', en: 'Appearance', es: 'Apariencia', de: 'Aussehen' },
  'session_options': { fr: 'Options de Session', en: 'Session Options', es: 'Opciones de Sesión', de: 'Sitzungsoptionen' },
  'settings_desc': { 
    fr: 'Ajustez les paramètres linguistiques, visuels et de notification pour un confort optimal.',
    en: 'Adjust linguistic, visual and notification settings for optimal comfort.',
    es: 'Ajuste la configuración lingüística, visual et de notificación para una comodidad óptima.',
    de: 'Passen Sie Sprach-, Visuell- und Benachrichtigungseinstellungen für optimalen Komfort an.'
  },
  'desc_nav_dashboard': { fr: 'Vue d\'ensemble de vos activités et statistiques.', en: 'Overview of your activities and statistics.', es: 'Vista general de sus actividades y estadísticas.', de: 'Übersicht über Ihre Aktivitäten und Statistiken.' },
  'desc_nav_users': { fr: 'Gérez la liste et le statut de vos étudiants.', en: 'Manage the list and status of your students.', es: 'Gestione la lista y el estado de sus estudiantes.', de: 'Verwalten Sie die Liste und den Status Ihrer Studenten.' },
  'desc_nav_classes': { fr: 'Organisation de vos promotions et archivage.', en: 'Organization of your promotions and archiving.', es: 'Organización de sus promociones y archivado.', de: 'Organisation Ihrer Promotionen und Archivierung.' },
  'desc_nav_notes': { fr: 'Saisie rapide et validation des notes pondérées.', en: 'Quick entry and validation of weighted grades.', es: 'Entrada rápida y validación de notas ponderadas.', de: 'Schnelle Eingabe und Validierung gewichteter Noten.' },
  'desc_nav_settings': { fr: 'Personnalisez votre interface et préférences.', en: 'Personalize your interface and preferences.', es: 'Personalice su interfaz y preferencias.', de: 'Personalisieren Sie Ihre Benutzeroberfläche und Präferenzen.' },
  
  // New Dashboard Keys
  'nav_matieres': { fr: 'Matières', en: 'Subjects', es: 'Materias', de: 'Fächer' },
  'nav_stats_long': { fr: 'Analyses Rétrographiques', en: 'Retrographic Analysis', es: 'Análisis Retrografico', de: 'Retrografische Analyse' },
  'hello_prof': { fr: 'Bonjour, Professeur', en: 'Hello, Professor', es: 'Hola, Profesor', de: 'Hallo, Professor' },
  'excellence_standard': { fr: "L'excellence est le seul standard.", en: "Excellence is the only standard.", es: "La excelencia es el único estándar.", de: "Exzellenz ist der einzige Standard." },
  'total_students': { fr: 'Total Étudiants', en: 'Total Students', es: 'Total Estudiantes', de: 'Gesamt Schüler' },
  'registries': { fr: 'Registres', en: 'Registries', es: 'Registros', de: 'Register' },
  'live_system': { fr: 'Système LIVE', en: 'LIVE System', es: 'Sistema LIVE', de: 'LIVE-System' },
  'global_performance': { fr: 'Performances Globales', en: 'Global Performance', es: 'Rendimiento Global', de: 'Gesamtleistung' },
  'real_time': { fr: 'Temps Réel', en: 'Real Time', es: 'Tiempo Real', de: 'Echtzeit' },
  'history': { fr: 'Historique', en: 'History', es: 'Historial', de: 'Verlauf' },
  'success_rate': { fr: 'Taux de Réussite', en: 'Success Rate', es: 'Tasa de Éxito', de: 'Erfolgsquote' },
  'promo_average': { fr: 'Moyenne Promotion', en: 'Promotion Average', es: 'Promedio de Promoción', de: 'Promotionsdurchschnitt' },
  'completed_registries': { fr: 'Registres Complétés', en: 'Completed Registries', es: 'Registros Completados', de: 'Abgeschlossene Register' },
  'consolidated_data': { fr: 'Données Consolidées', en: 'Consolidated Data', es: 'Datos Consolidados', de: 'Konsolidierte Daten' },
  'quick_actions': { fr: 'Actions Rapides', en: 'Quick Actions', es: 'Acciones Rápidas', de: 'Schnellaktionen' },
  'reports': { fr: 'Rapports', en: 'Reports', es: 'Informes', de: 'Berichte' },
  'alerts': { fr: 'Alertes', en: 'Alertes', es: 'Alertas', de: 'Warnungen' },
  'config': { fr: 'Config', en: 'Config', es: 'Config', de: 'Konfig' },
  'traffic_activity': { fr: 'Trafic & Activité', en: 'Traffic & Activity', es: 'Tráfico y Actividad', de: 'Verkehr & Aktivität' },
  'last_7_days': { fr: '7 derniers jours — Analyse de charge', en: 'Last 7 days — Load Analysis', es: 'Últimos 7 días — Análisis de carga', de: 'Letzte 7 Tage — Lastanalyse' },
  
  // Student Dashboard Specific
  'my_vision_notes': { fr: 'Ta Vision, Tes Notes', en: 'Your Vision, Your Grades', es: 'Tu Visión, Tus Notas', de: 'Deine Vision, Deine Noten' },
  'academic_success': { fr: 'SUCCÈS ACADÉMIQUE', en: 'ACADEMIC SUCCESS', es: 'ÉXITO ACADÉMICO', de: 'AKADEMISCHER ERFOLG' },
  'position': { fr: 'Position', en: 'Position', es: 'Posición', de: 'Position' },
  'progression': { fr: 'Progression', en: 'Progression', es: 'Progresión', de: 'Progression' },
  'my_bulletin': { fr: 'Mon Bulletin', en: 'My Report Card', es: 'Mi Boletín', de: 'Mein Zeugnis' },
  'my_profile': { fr: 'Mon Profil', en: 'My Profile', es: 'Mi Perfil', de: 'Mein Profil' },
  'digital_id': { fr: 'ID Numérique', en: 'Digital ID', es: 'Identidad Digital', de: 'Digitale ID' },

  // Note Entry
  'note_entry_title': { fr: 'Registre de Notation', en: 'Grading Registry', es: 'Registro de Calificaciones', de: 'Notenregister' },
  'note_entry_subtitle': { fr: 'Validation & Sauvegarde Directe', en: 'Direct Validation & Saving', es: 'Validación y Guardado Directo', de: 'Direkte Validierung & Speicherung' },
  'notifier_dispo': { fr: 'NOTIFIER DISPONIBILITÉ', en: 'NOTIFY AVAILABILITY', es: 'NOTIFICAR DISPONIBILIDAD', de: 'VERFÜGBARKEIT BENACHRICHTIGEN' },
  'valid_inscription_note': { fr: 'ENREGISTRER LA NOTE', en: 'SAVE GRADE', es: 'GUARDAR NOTA', de: 'NOTE SPEICHERN' },
  'student_profile': { fr: 'Profil Étudiant', en: 'Student Profile', es: 'Perfil del Estudiante', de: 'Studentenprofil' },
  'academic_session_label': { fr: 'Session Académique', en: 'Academic Session', es: 'Sesión Académica', de: 'Akademische Sitzung' },
  'study_domain': { fr: 'Domaine d\'Étude', en: 'Field of Study', es: 'Campo de Estudio', de: 'Studienfach' },
  'note_label': { fr: 'Note (/20)', en: 'Grade (/20)', es: 'Nota (/20)', de: 'Note (/20)' },
  'confirmation': { fr: 'Confirmation', en: 'Confirmation', es: 'Confirmación', de: 'Bestätigung' },
  'credits_label': { fr: 'Crédits', en: 'Credits', es: 'Créditos', de: 'Credits' },
  'weighting_label': { fr: 'Pondération', en: 'Weighting', es: 'Ponderación', de: 'Gewichtung' },
  'current_average': { fr: 'Moyenne Actuelle', en: 'Current Average', es: 'Promedio Actual', de: 'Aktueller Durchschnitt' },
  'selection_required': { fr: 'SÉLECTION REQUISE', en: 'SELECTION REQUIRED', es: 'SELECCIÓN REQUERIDA', de: 'AUSWAHL ERFORDERLICH' },
  'quick_access_tools': { fr: 'ACCÈS RAPIDE', en: 'QUICK ACCESS', es: 'ACCESO RÁPIDO', de: 'SCHNELLZUGRIFF' },
  'excellence_20': { fr: 'EXCELLENCE (20)', en: 'EXCELLENCE (20)', es: 'EXCELENCIA (20)', de: 'EXZELLENZ (20)' },
  'validation_10': { fr: 'VALIDATION (10)', en: 'VALIDATION (10)', es: 'VALIDACIÓN (10)', de: 'VALIDIERUNG (10)' },
  // User Management
  'user_management_title': { fr: 'Gestion des Utilisateurs Étudiants', en: 'Student User Management', es: 'Gestión de Usuarios Estudiantes', de: 'Studenten-Benutzerverwaltung' },
  'user_management_subtitle': { fr: 'Contrôle de Sécurité v2.5', en: 'Security Control v2.5', es: 'Control de Seguridad v2.5', de: 'Sicherheitskontrolle v2.5' },
  'online': { fr: 'En Ligne', en: 'Online', es: 'En Línea', de: 'Online' },
  'search_user_placeholder': { fr: 'Rechercher un étudiant (Nom, Prénom, Email)...', en: 'Search for a student (Name, First Name, Email)...', es: 'Buscar un estudiante (Nombre, Apellido, Email)...', de: 'Student suchen (Name, Vorname, E-Mail)...' },
  'advanced_filters': { fr: 'Filtres Avancés', en: 'Advanced Filters', es: 'Filtros Avanzados', de: 'Erweiterte Filter' },
  'user_registry': { fr: 'Registre des Utilisateurs', en: 'User Registry', es: 'Registro de Usuarios', de: 'Benutzerregister' },
  'status_label': { fr: 'Statut', en: 'Status', es: 'Estado', de: 'Status' },
  'identity_label': { fr: 'Identité', en: 'Identity', es: 'Identidad', de: 'Identität' },
  'contact_label': { fr: 'Contact', en: 'Contact', es: 'Contacto', de: 'Kontakt' },
  'promotion_label': { fr: 'Promotion', en: 'Promotion', es: 'Promoción', de: 'Promotion' },
  'active_status': { fr: 'ACTIF', en: 'ACTIVE', es: 'ACTIVO', de: 'AKTIV' },
  'passive_status': { fr: 'PASSIF', en: 'PASSIVE', es: 'PASIVO', de: 'PASSIV' },
  'no_student_found': { fr: 'Aucun étudiant identifié dans ce périmètre', en: 'No student found in this scope', es: 'No se encontró ningún estudiante en este ámbito', de: 'Kein Student in diesem Bereich gefunden' },
  // Statistics
  'stats_title': { fr: 'Analyses & Statistiques', en: 'Analysis & Statistics', es: 'Análisis y Estadísticas', de: 'Analyse & Statistiken' },
  'academic_intelligence': { fr: 'Intelligence Académique v2.5', en: 'Academic Intelligence v2.5', es: 'Inteligencia Académica v2.5', de: 'Akademische Intelligenz v2.5' },
  'stat_classes': { fr: 'Classes Pilotées', en: 'Managed Classes', es: 'Clases Administradas', de: 'Geführte Klassen' },
  'stat_validation': { fr: 'Taux de Validation', en: 'Validation Rate', es: 'Tasa de Validación', de: 'Validierungsrate' },
  'stat_honors': { fr: "Distinctions d'Honneur", en: 'Honors & Distinctions', es: 'Honores y Distinciones', de: 'Ehrenauszeichnungen' },
  'stat_trajectory': { fr: 'Trajectoire', en: 'Trajectory', es: 'Trayectoria', de: 'Trajektorie' },
  'stat_performance': { fr: 'Performance Temporelle', en: 'Temporal Performance', es: 'Rendimiento Temporal', de: 'Zeitliche Leistung' },
  'stat_distribution': { fr: 'Répartition', en: 'Distribution', es: 'Distribución', de: 'Verteilung' },
  'stat_volume': { fr: 'Volume de Promotion', en: 'Promotion Volume', es: 'Volumen de Promoción', de: 'Promotionsvolumen' },
  'stat_report': { fr: 'Rapport de Performance Semestriel', en: 'Semester Performance Report', es: 'Informe de Rendimiento Semestral', de: 'Semesterleistungsbericht' },
  'stat_consult_report': { fr: 'CONSULTER LE RAPPORT', en: 'CONSULT REPORT', es: 'CONSULTAR INFORME', de: 'BERICHT EINSEHEN' },
  'stat_generated_realtime': { fr: 'Généré en temps réel • cluster v2.5', en: 'Generated in real-time • cluster v2.5', es: 'Generado en tiempo real • cluster v2.5', de: 'In Echtzeit generiert • cluster v2.5' },
  
  // Settings
  'language': { fr: 'Langue', en: 'Language', es: 'Idioma', de: 'Sprache' },
  'night_mode': { fr: 'Mode Nuit', en: 'Night Mode', es: 'Modo Noche', de: 'Nachtmodus' },
  'security': { fr: 'Sécurité', en: 'Security', es: 'Seguridad', de: 'Sicherheit' },
  'change_password': { fr: 'Changement de mot de passe', en: 'Change Password', es: 'Cambiar Contraseña', de: 'Passwort ändern' },
  'search_class_placeholder': { fr: 'Rechercher une classe...', en: 'Search for a class...', es: 'Buscar una clase...', de: 'Klasse suchen...' },
  'certification': { fr: 'Certification', en: 'Certification', es: 'Certificación', de: 'Zertifizierung' },
  'classmates': { fr: 'Camarades', en: 'Classmates', es: 'Compañeros', de: 'Mitschüler' },
  'analyses': { fr: 'Analyses', en: 'Analysis', es: 'Análisis', de: 'Analysen' },
  'generate_secure_access': { fr: 'Générez votre accès sécurisé.', en: 'Generate your secure access.', es: 'Genera tu acceso seguro.', de: 'Generieren Sie Ihren sicheren Zugang.' },
  'btn_generate_signature': { fr: 'Générer Signature Unique', en: 'Generate Unique Signature', es: 'Generar Firma Única', de: 'Einmalige Signatur generieren' },
  'btn_validate_scan': { fr: 'Valider par Scan', en: 'Validate by Scan', es: 'Validar por Escaneo', de: 'Durch Scan validieren' },
  'btn_cancel': { fr: 'Annuler', en: 'Cancel', es: 'Cancelar', de: 'Abbrechen' },
  'identity_status': { fr: 'Statut Identité', en: 'Identity Status', es: 'Estado de Identidad', de: 'Identitätsstatus' },
  'verified_blockchain': { fr: 'Vérifié via Blockchain', en: 'Verified via Blockchain', es: 'Verificado vía Blockchain', de: 'Über Blockchain verifiziert' },
  'security_protocol_desc': { 
    fr: 'Le scan valide instantanément votre identité numérique et débloque le téléchargement PDF haute-fidélité.', 
    en: 'The scan instantly validates your digital identity and unlocks the high-fidelity PDF download.', 
    es: 'El escaneo valida instantáneamente su identidad digital y desbloquea la descarga de PDF de alta fidelidad.', 
    de: 'Der Scan validiert sofort Ihre digitale Identität und schaltet den High-Fidelity-PDF-Download frei.' 
  },
  'class_directory': { fr: 'Annuaire de la Promotion', en: 'Class Directory', es: 'Directorio de la Clase', de: 'Klassenverzeichnis' },
  'official_registry': { fr: 'Registre officiel des étudiants inscrits', en: 'Official registry of enrolled students', es: 'Registro oficial de estudiantes inscritos', de: 'Offizielles Register der eingeschriebenen Studenten' },
  'performance_trajectory': { fr: 'Trajectoire de Performance', en: 'Performance Trajectory', es: 'Trayectoria de Rendimiento', de: 'Leistungsverlauf' },
  'comparison_promo_avg': { fr: 'Comparaison par rapport à la moyenne promotionnelle', en: 'Comparison with promotion average', es: 'Comparación con el promedio de la promoción', de: 'Vergleich mit dem Promotionsdurchschnitt' },
  'lmd_credits': { fr: 'Crédits LMD', en: 'LMD Credits', es: 'Créditos LMD', de: 'LMD-Credits' },
  'credits_validated': { fr: 'Crédits Académiques Validés', en: 'Validated Academic Credits', es: 'Créditos Académicos Validados', de: 'Validierte akademische Credits' },
  'mentions_distribution': { fr: 'Répartition Mentions', en: 'Mentions Distribution', es: 'Distribución de Menciones', de: 'Verteilung der Prädikate' },
  'excellent': { fr: 'Excellent', en: 'Excellent', es: 'Excelente', de: 'Exzellent' },
  'good': { fr: 'Assez Bien', en: 'Good', es: 'Bien', de: 'Gut' },
  'skills_profile': { fr: 'Profil de Compétences', en: 'Skills Profile', es: 'Perfil de Competencias', de: 'Kompetenzprofil' },
  'multidimensional_analysis': { fr: 'Analyse multidimensionnelle', en: 'Multidimensional analysis', es: 'Análisis multidimensional', de: 'Multidimensionale Analyse' },
  'academic_insight': { fr: 'Insight Académique', en: 'Academic Insight', es: 'Perspicacia Académica', de: 'Akademischer Einblick' },
  'activity_report': { fr: "Rapport d\'Activité", en: 'Activity Report', es: 'Informe de Actividad', de: 'Aktivitätsbericht' },
  'grading_history': { fr: 'Historique des Saisies', en: 'Grading History', es: 'Historial de Calificaciones', de: 'Benotungsverlauf' },
  'new_entry_btn': { fr: 'NOUVELLE SAISIE', en: 'NEW ENTRY', es: 'NUEVA ENTRADA', de: 'NEUER EINTRAG' },
  'search_entry_placeholder': { fr: 'Chercher une saisie (étudiant, matière...)...', en: 'Search for an entry (student, subject...)...', es: 'Buscar una entrada (estudiante, materia...)...', de: 'Eintrag suchen (Student, Fach...)...' },
  'total_entries': { fr: 'Total', en: 'Total', es: 'Total', de: 'Gesamt' },
  'date_col': { fr: 'Date', en: 'Date', es: 'Fecha', de: 'Datum' },
  'student_col': { fr: 'Étudiant', en: 'Student', es: 'Estudiante', de: 'Student' },
  'subject_col': { fr: 'Matière', en: 'Subject', es: 'Materia', de: 'Fach' },
  'grade_col': { fr: 'Note / 20', en: 'Grade / 20', es: 'Nota / 20', de: 'Note / 20' },
  'type_col': { fr: 'Type', en: 'Type', es: 'Tipo', de: 'Typ' },
  'status_col': { fr: 'Statut', en: 'Status', es: 'Estado', de: 'Status' },
  'actions_col': { fr: 'Actions', en: 'Actions', es: 'Acciones', de: 'Aktionen' },
  'validated_status': { fr: 'Validé', en: 'Validated', es: 'Validado', de: 'Validiert' },
  'pending_status': { fr: 'En attente', en: 'Pending', es: 'Pendiente', de: 'Ausstehend' },
  'no_record_found': { fr: 'Aucun enregistrement certifié', en: 'No certified record found', es: 'No se encontró ningún registro certificado', de: 'Kein zertifizierter Datensatz gefunden' },
  'new_record': { fr: 'Nouvel Enregistrement', en: 'New Record', es: 'Nuevo Registro', de: 'Neuer Datensatz' },
  'certify_save': { fr: 'CERTIFIER & SAUVEGARDER', en: 'CERTIFY & SAVE', es: 'CERTIFICAR Y GUARDAR', de: 'ZERTIFIZIEREN & SPEICHERN' },
}

interface UIContextType {
  language: Language
  setLanguage: (lang: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  t: (key: string) => string
  academicSession: string
  setAcademicSession: (session: string) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme()
  const [language, setLanguage] = useState<Language>('fr')
  const [academicSession, setAcademicSession] = useState<string>('2024-2025')

  useEffect(() => {
    const savedSession = localStorage.getItem('academicSession')
    if (savedSession) setAcademicSession(savedSession)
  }, [])

  useEffect(() => {
    localStorage.setItem('academicSession', academicSession)
  }, [academicSession])

  // Load from local storage if exists
  useEffect(() => {
    const savedLang = localStorage.getItem('app-language') as Language
    if (savedLang) setLanguage(savedLang)
  }, [])

  useEffect(() => {
    localStorage.setItem('app-language', language)
  }, [language])

  const t = (key: string) => {
    return translations[key]?.[language] || key
  }

  return (
    <UIContext.Provider value={{ 
      language, 
      setLanguage, 
      theme: (nextTheme as Theme) || 'light', 
      setTheme: (t: string) => setNextTheme(t), 
      t,
      academicSession,
      setAcademicSession
    }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}
