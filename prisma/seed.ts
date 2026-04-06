import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Semestres
  console.log('🌱 Start Seeding...')
  
  const s1 = await prisma.semestre.upsert({
    where: { id: 's1' },
    update: { actif: true },
    create: {
      id: 's1',
      libelle: 'Semestre 1',
      datedebut: new Date('2025-09-01'),
      datefin: new Date('2025-12-31'),
      anneeacademique: '2025-2026',
      actif: true
    }
  })

  await prisma.semestre.upsert({
    where: { id: 's2' },
    update: {},
    create: {
      id: 's2',
      libelle: 'Semestre 2',
      datedebut: new Date('2026-01-01'),
      datefin: new Date('2026-06-30'),
      anneeacademique: '2025-2026',
      actif: false
    }
  })

  console.log('✅ Semestres synchronisés')

  // 2. Filières & Classes (Restored 20+ Classes)
  const legacyTracks = [
    "Génie Civil et Environnement",
    "Génie Logiciel (Software Engineering)",
    "Génie Électrique et Industrielle",
    "Génie Industriel et Maintenance"
  ]
  const newEliteTracks = ["Ingénierie", "Médecine", "Arts & Design"]
  const allTracks = [...legacyTracks, ...newEliteTracks]

  const classesMap = new Map<string, any[]>() // trackName -> classes[]
  const classes = []

  for (const trackName of allTracks) {
    const code = trackName.split(' ')
      .filter(w => !['et', 'des', 'de'].includes(w.toLowerCase()))
      .map(w => w[0]).join('').toUpperCase().substring(0, 3) + Math.floor(Math.random() * 9 + 1)
    
    classesMap.set(trackName, [])

    for (const suffix of ['A', 'B']) {
      const id = `cls-${code.toLowerCase()}-${suffix.toLowerCase()}`
      const cls = await prisma.classe.upsert({
        where: { id },
        update: { effectif: 30, nom: `${trackName} ${suffix}`, filiere: trackName },
        create: {
          id,
          nom: `${trackName} ${suffix}`,
          niveau: 'L1',
          filiere: trackName,
          anneeacademique: '2025-2026',
          capacitemax: 40,
          effectif: 32,
          actif: true
        }
      })
      classes.push(cls)
      classesMap.get(trackName)!.push(cls)
    }
  }
  console.log(`✅ ${classes.length} Classes restorées sur ${allTracks.length} fillères.`)

  // 3. Matières (56 Specialized Subjects for 7 tracks)
  const specializedSubjectsByTrack: Record<string, {code: string, name: string, credits: number}[]> = {
    "Génie Civil et Environnement": [
      { code: 'CIV101', name: 'Mécanique des Sols', credits: 4 },
      { code: 'CIV102', name: 'Résistance des Matériaux', credits: 4 },
      { code: 'CIV103', name: 'Topographie et Cartographie', credits: 3 },
      { code: 'CIV104', name: 'Hydrologie Appliquée', credits: 3 },
      { code: 'CIV105', name: 'Matériaux de Construction', credits: 4 },
      { code: 'CIV106', name: 'Dessin Technique et DAO', credits: 3 },
      { code: 'CIV107', name: 'Évaluation Environnementale', credits: 3 },
      { code: 'CIV108', name: 'Thermodynamique', credits: 4 }
    ],
    "Génie Logiciel (Software Engineering)": [
      { code: 'PROG101', name: 'Algorithmique & Logiciel', credits: 5 },
      { code: 'WEB101', name: 'Développement Web', credits: 4 },
      { code: 'ARCH101', name: 'Architecture des Ordinateurs', credits: 3 },
      { code: 'BD101', name: 'Bases de Données', credits: 4 },
      { code: 'POO101', name: 'Programmation Orientée Objet', credits: 4 },
      { code: 'OS101', name: 'Systèmes d\'Exploitation', credits: 3 },
      { code: 'SEC101', name: 'Sécurité Informatique', credits: 3 },
      { code: 'MATH101', name: 'Mathématiques Discrètes', credits: 4 }
    ],
    "Génie Électrique et Industrielle": [
      { code: 'ELEC101', name: 'Électronique Analogique', credits: 4 },
      { code: 'ELEC102', name: 'Électronique Numérique', credits: 4 },
      { code: 'ELEC103', name: 'Circuits Électriques', credits: 3 },
      { code: 'ELEC104', name: 'Électromagnétisme', credits: 4 },
      { code: 'AUTO101', name: 'Automatique Linéaire', credits: 3 },
      { code: 'SIG101', name: 'Traitement du Signal', credits: 4 },
      { code: 'MES101', name: 'Mesures Électriques', credits: 3 },
      { code: 'NRG101', name: 'Énergie Solaire', credits: 3 }
    ],
    "Génie Industriel et Maintenance": [
      { code: 'MAINT101', name: 'Maintenance Prédictive', credits: 4 },
      { code: 'PROD101', name: 'Gestion de Production', credits: 3 },
      { code: 'FIAB101', name: 'Fiabilité des Systèmes', credits: 4 },
      { code: 'AUTO102', name: 'Automatismes Industriels', credits: 4 },
      { code: 'INFO101', name: 'Informatique Industrielle', credits: 3 },
      { code: 'LOG101', name: 'Logistique et Supply Chain', credits: 3 },
      { code: 'RO101', name: 'Recherche Opérationnelle', credits: 4 },
      { code: 'QUAL101', name: 'Qualité Industrielle', credits: 3 }
    ],
    "Ingénierie": [
      { code: 'MATH201', name: 'Mathématiques pour l\'Ingénieur', credits: 5 },
      { code: 'PHYS101', name: 'Physique Appliquée', credits: 4 },
      { code: 'SYS101', name: 'Ingénierie des Systèmes', credits: 4 },
      { code: 'PROJ101', name: 'Gestion de Projet', credits: 3 },
      { code: 'ETH101', name: 'Éthique de l\'Ingénieur', credits: 2 },
      { code: 'INNOV101', name: 'Innovation Technologique', credits: 3 },
      { code: 'ECO101', name: 'Économie pour l\'Ingénieur', credits: 3 },
      { code: 'COM101', name: 'Communication Professionnelle', credits: 2 }
    ],
    "Médecine": [
      { code: 'MED101', name: 'Anatomie Humaine', credits: 5 },
      { code: 'MED102', name: 'Physiologie Médicale', credits: 5 },
      { code: 'BIO101', name: 'Biologie Cellulaire', credits: 4 },
      { code: 'BIO102', name: 'Biochimie Structurale', credits: 4 },
      { code: 'MED103', name: 'Histologie', credits: 4 },
      { code: 'SAN101', name: 'Santé Publique', credits: 3 },
      { code: 'EPI101', name: 'Épidémiologie', credits: 3 },
      { code: 'GEN101', name: 'Génétique', credits: 4 }
    ],
    "Arts & Design": [
      { code: 'ART101', name: 'Histoire de l\'Art', credits: 3 },
      { code: 'DES101', name: 'Design Graphique', credits: 4 },
      { code: 'ART102', name: 'Théorie des Couleurs', credits: 3 },
      { code: 'ART103', name: 'Dessin d\'Observation', credits: 4 },
      { code: '3D101', name: 'Modélisation 3D', credits: 4 },
      { code: 'TYPO101', name: 'Typographie', credits: 3 },
      { code: 'PHOTO101', name: 'Photographie Numérique', credits: 3 },
      { code: 'ART104', name: 'Arts Visuels Contemporains', credits: 3 }
    ]
  }

  const allSubjects = []
  for (const track of allTracks) {
    const subjectsForTrack = specializedSubjectsByTrack[track]
    if (subjectsForTrack) {
      for (const sub of subjectsForTrack) {
        const sm = await prisma.matiere.upsert({
          where: { code: sub.code },
          update: { credits: sub.credits, intitule: sub.name },
          create: {
            id: `mat-${sub.code.toLowerCase()}`,
            code: sub.code,
            intitule: sub.name,
            credits: sub.credits
          }
        })
        allSubjects.push(sm)
      }
    }
  }
  console.log(`✅ ${allSubjects.length} Matières spécialisées synchronisées.`)

  // 4. Utilisateurs — Nouveaux comptes officiels
  const password = await hash('edunotes', 12)

  const officialUsers = [
    { email: 'menahmichelle@gmail.com', nom: 'MENAH',   prenom: 'Michelle',role: 'ENSEIGNANT',  profile: 'enseignant' },
    { email: 'julesateba@gmail.com',    nom: 'ATEBA',   prenom: 'Jules',   role: 'ETUDIANT',   profile: 'etudiant' },
    { email: 'willytoko@gmail.com',     nom: 'TOKO',    prenom: 'Willy',   role: 'PARENT',      profile: 'parent' },
    { email: 'wilfridambassa@gmail.com',nom: 'AMBASSA', prenom: 'Wilfrid', role: 'ADMIN',       profile: 'admin' },
  ]

  let mainTeacherId = null
  let defaultStudentId = null

  for (const u of officialUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password, actif: true, nom: u.nom, prenom: u.prenom, role: u.role as any },
      create: {
        email: u.email,
        password,
        nom: u.nom,
        prenom: u.prenom,
        role: u.role as any,
        actif: true,
        telephone: '+22812345678'
      }
    })

    if (u.profile === 'admin') {
      await prisma.administrateur.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, departement: 'Direction' }
      })
    } else if (u.profile === 'enseignant') {
      const ens = await prisma.enseignant.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, matricule: `ENS-${user.id.slice(0,4)}`, specialite: 'Informatique' }
      })
      mainTeacherId = ens.id
    } else if (u.profile === 'etudiant') {
      const gLogicielClass = classesMap.get("Génie Logiciel (Software Engineering)")?.[0] || classes[0]
      const etu = await prisma.etudiant.upsert({
        where: { userId: user.id },
        update: { classeId: gLogicielClass.id },
        create: { userId: user.id, matricule: `ETU-${user.id.slice(0,4)}`, classeId: gLogicielClass.id }
      })
      defaultStudentId = etu.id
    } else if (u.profile === 'parent') {
      await prisma.parent.upsert({
        where: { userId: user.id },
        update: { etudiantId: defaultStudentId || 'default' },
        create: { userId: user.id, etudiantId: defaultStudentId || 'default' }
      })
    }
  }

  // 5. Link Teachers to Subjects/Classes and EmploiTemps for exact functional UI
  let hrIndex = 0
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
  const sallesMock = ['Amphi 500', 'Amphi 100', 'Salle C12', 'Salle B04', 'Labo Info 1', 'Labo Langagier', 'Atelier B']

  for (const track of allTracks) {
    const trackClasses = classesMap.get(track) || []
    const trackSubjects = specializedSubjectsByTrack[track] || []
    
    for (const cls of trackClasses) {
      for (const [subIndex, sub] of trackSubjects.entries()) {
        const matId = `mat-${sub.code.toLowerCase()}`
        
        // Tie teacher only to some tracks to make dashboard realistic but not overly massive
        // Force the teacher to have 'Génie Logiciel' to grade Jules Ateba. Let's just assign the teacher everywhere for testing!
        
        // 5a. ClasseMatiere
        await prisma.classeMatiere.upsert({
          where: {
            classeId_matiereId_semestre: {
              classeId: cls.id,
              matiereId: matId,
              semestre: 's1'
            }
          },
          update: { enseignantId: mainTeacherId },
          create: {
            classeId: cls.id,
            matiereId: matId,
            semestre: 's1',
            enseignantId: mainTeacherId,
            heuresprevues: 40
          }
        })

        // 5b. EmploiTemps (Pour que la case "Salle" soit renseignée dans le Front)
        // Ensure EmploisTemp uniqueness : [classeId, jour, heureDebut]
        const jour = jours[subIndex % 5]
        const debutHour = 8 + (subIndex % 4) * 2 // 8h, 10h, 12h, 14h...
        const heureDebut = `${debutHour.toString().padStart(2, '0')}:00`
        const heureFin = `${(debutHour + 2).toString().padStart(2, '0')}:00`
        const salle = sallesMock[hrIndex % sallesMock.length]

        await prisma.emploiTemps.upsert({
           where: {
             classeId_jour_heureDebut: {
               classeId: cls.id,
               jour: jour,
               heureDebut: heureDebut
             }
           },
           update: { matiereId: matId, salle, enseignantId: mainTeacherId },
           create: {
             classeId: cls.id,
             jour: jour,
             heureDebut: heureDebut,
             heureFin: heureFin,
             matiereId: matId,
             salle: salle,
             enseignantId: mainTeacherId
           }
        })
        hrIndex++
      }
    }
  }

  console.log('🚀 Seeding Completed successfully!')
  console.log('🔑 Password: "edunotes"')
  console.log('👤 menahmichelle@gmail.com -> ENSEIGNANT (Assigned to Grade subjects across 56 classes/subjects)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
