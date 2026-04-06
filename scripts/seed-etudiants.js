// ============================================================
// seed-etudiants.js — Insertion de 200 étudiants + répartition
// inégale dans les 14 classes existantes.
// Chaque étudiant = 1 User (role=ETUDIANT) + 1 Etudiant (matricule, classeId)
// ============================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// ══════════════════════════════════════════════════════
// DONNÉES DES 200 ÉTUDIANTS (matricule, nom_prenom, email)
// ══════════════════════════════════════════════════════
const ETUDIANTS_DATA = [
  ['24G001', 'ABENA Marc', 'm.abena@edunotes.ac'],
  ['24G002', 'BEKONO Solange', 's.bekono@edunotes.ac'],
  ['24G003', 'CHEDJOU Fabrice', 'f.chedjou@edunotes.ac'],
  ['24G004', 'DJOKO Mireille', 'm.djoko@edunotes.ac'],
  ['24G005', 'ETOUNDI Paul', 'p.etoundi@edunotes.ac'],
  ['24G006', 'FOTSO Christian', 'c.fotso@edunotes.ac'],
  ['24G007', 'GUEYE Aminata', 'a.gueye@edunotes.ac'],
  ['24G008', 'HADIDJA Alim', 'a.hadidja@edunotes.ac'],
  ['24G009', 'ISSA Ibrahim', 'i.issa@edunotes.ac'],
  ['24G010', 'JOUANANG Estelle', 'e.jouanang@edunotes.ac'],
  ['24G011', 'KAMDEM Rodrigue', 'r.kamdem@edunotes.ac'],
  ['24G012', 'LONTSI Carine', 'c.lontsi@edunotes.ac'],
  ['24G013', 'MBARGA Thierry', 't.mbarga@edunotes.ac'],
  ['24G014', 'NGONO Brigitte', 'b.ngono@edunotes.ac'],
  ['24G015', 'ONDOUA Serge', 's.ondoua@edunotes.ac'],
  ['24G016', 'POUANI Vanessa', 'v.pouani@edunotes.ac'],
  ['24G017', 'QUENUM Gilles', 'g.quenum@edunotes.ac'],
  ['24G018', 'ROUFAOU Ahmed', 'a.roufaou@edunotes.ac'],
  ['24G019', 'SIMO Jean-Pierre', 'jp.simo@edunotes.ac'],
  ['24G020', 'TCHAMENI Laure', 'l.tchameni@edunotes.ac'],
  ['24G021', 'UM NYOBE Junior', 'j.um@edunotes.ac'],
  ['24G022', 'VOUNDI Alice', 'a.voundi@edunotes.ac'],
  ['24G023', 'WAKO David', 'd.wako@edunotes.ac'],
  ['24G024', 'XAVIER François', 'f.xavier@edunotes.ac'],
  ['24G025', 'YAPO Sandrine', 's.yapo@edunotes.ac'],
  ['24G026', 'ZRA Dieudonné', 'd.zra@edunotes.ac'],
  ['24G027', 'AMADOU Moussa', 'm.amadou@edunotes.ac'],
  ['24G028', 'BIAYA Clément', 'c.biaya@edunotes.ac'],
  ['24G029', 'COULIBALY Fatoumata', 'f.coulibaly@edunotes.ac'],
  ['24G030', 'DIALLO Mamadou', 'm.diallo@edunotes.ac'],
  ['24G031', 'EBOA Gustave', 'g.eboa@edunotes.ac'],
  ['24G032', 'FEUKOU Serge', 's.feukou@edunotes.ac'],
  ['24G033', 'GNAMAKA Boris', 'b.gnamaka@edunotes.ac'],
  ['24G034', 'HEUMOU Carole', 'c.heumou@edunotes.ac'],
  ['24G035', 'IDRISSOU Mohamadou', 'm.idrissou@edunotes.ac'],
  ['24G036', 'JEUTSA Patrick', 'p.jeutsa@edunotes.ac'],
  ['24G037', 'KENGNE Blaise', 'b.kengne@edunotes.ac'],
  ['24G038', 'LAMBO Victor', 'v.lambo@edunotes.ac'],
  ['24G039', 'MOUNGOU Micheline', 'm.moungou@edunotes.ac'],
  ['24G040', 'NANA Franck', 'f.nana@edunotes.ac'],
  // ════════ Génération automatique des étudiants 41-198 ════════
  ['24G041', 'ABOGO Patricia', 'p.abogo@edunotes.ac'],
  ['24G042', 'BINYAM Charles', 'c.binyam@edunotes.ac'],
  ['24G043', 'CHEN WEI Lin', 'l.chenwei@edunotes.ac'],
  ['24G044', 'DONTSOP Irène', 'i.dontsop@edunotes.ac'],
  ['24G045', 'EKANI Sylvestre', 's.ekani@edunotes.ac'],
  ['24G046', 'FOMBA Aïcha', 'a.fomba@edunotes.ac'],
  ['24G047', 'GWETH Lambert', 'l.gweth@edunotes.ac'],
  ['24G048', 'HAPPI Raïssa', 'r.happi@edunotes.ac'],
  ['24G049', 'INOUSSA Rachid', 'r.inoussa@edunotes.ac'],
  ['24G050', 'JIONGO Bertrand', 'b.jiongo@edunotes.ac'],
  ['24G051', 'KUEKA Rose', 'r.kueka@edunotes.ac'],
  ['24G052', 'LELE Honoré', 'h.lele@edunotes.ac'],
  ['24G053', 'MESSI Aristide', 'a.messi@edunotes.ac'],
  ['24G054', 'NDAM Olga', 'o.ndam@edunotes.ac'],
  ['24G055', 'OUMAROU Fatiha', 'f.oumarou@edunotes.ac'],
  ['24G056', 'POKAM Dieudonné', 'd.pokam@edunotes.ac'],
  ['24G057', 'RABE André', 'a.rabe@edunotes.ac'],
  ['24G058', 'SANGA Colette', 'c.sanga@edunotes.ac'],
  ['24G059', 'TAGNE Éric', 'e.tagne@edunotes.ac'],
  ['24G060', 'UKOHA Félicité', 'f.ukoha@edunotes.ac'],
  ['24G061', 'VEMBE Gérard', 'g.vembe@edunotes.ac'],
  ['24G062', 'WAMBA Sylvie', 's.wamba@edunotes.ac'],
  ['24G063', 'YENGO Martial', 'm.yengo@edunotes.ac'],
  ['24G064', 'ZOUA Clarisse', 'c.zoua@edunotes.ac'],
  ['24G065', 'ATANGANA Léopold', 'l.atangana@edunotes.ac'],
  ['24G066', 'BATE Émilienne', 'e.bate@edunotes.ac'],
  ['24G067', 'CHOUAGA Robert', 'r.chouaga@edunotes.ac'],
  ['24G068', 'DJANKOU Nadège', 'n.djankou@edunotes.ac'],
  ['24G069', 'ESSOMBA Lucien', 'l.essomba@edunotes.ac'],
  ['24G070', 'FOMENA Gaëlle', 'g.fomena@edunotes.ac'],
  ['24G071', 'GUIMEZAP Pierre', 'p.guimezap@edunotes.ac'],
  ['24G072', 'HAMADOU Salima', 's.hamadou@edunotes.ac'],
  ['24G073', 'ISSOUFOU Abdel', 'a.issoufou@edunotes.ac'],
  ['24G074', 'JIOFACK Nadine', 'n.jiofack@edunotes.ac'],
  ['24G075', 'KANA Marcel', 'm.kana@edunotes.ac'],
  ['24G076', 'LIBAM Florence', 'f.libam@edunotes.ac'],
  ['24G077', 'MVONDO Justin', 'j.mvondo@edunotes.ac'],
  ['24G078', 'NGANKO Ruth', 'r.nganko@edunotes.ac'],
  ['24G079', 'ONGOLO Parfait', 'p.ongolo@edunotes.ac'],
  ['24G080', 'PETNGA Annette', 'a.petnga@edunotes.ac'],
  ['24G081', 'RIKONG Sévérin', 's.rikong@edunotes.ac'],
  ['24G082', 'SOUGA Marguerite', 'm.souga@edunotes.ac'],
  ['24G083', 'TCHINDA Alphonse', 'a.tchinda@edunotes.ac'],
  ['24G084', 'UYAMI Arlette', 'a.uyami@edunotes.ac'],
  ['24G085', 'VOUFO Yannick', 'y.voufo@edunotes.ac'],
  ['24G086', 'WOUMBE Gisèle', 'g.woumbe@edunotes.ac'],
  ['24G087', 'YANA Christelle', 'c.yana@edunotes.ac'],
  ['24G088', 'ZANG Émile', 'e.zang@edunotes.ac'],
  ['24G089', 'ABENG Julien', 'j.abeng@edunotes.ac'],
  ['24G090', 'BELLO Mariama', 'm.bello@edunotes.ac'],
  ['24G091', 'CHAMBA Oscar', 'o.chamba@edunotes.ac'],
  ['24G092', 'DIKONGUE Blandine', 'b.dikongue@edunotes.ac'],
  ['24G093', 'ENAMA Prosper', 'p.enama@edunotes.ac'],
  ['24G094', 'FOUDA Cécile', 'c.fouda@edunotes.ac'],
  ['24G095', 'BELIBI Ghislain', 'g.belibi@edunotes.ac'],
  ['24G096', 'HALLE Nathalie', 'n.halle@edunotes.ac'],
  ['24G097', 'IYAMA Constant', 'c.iyama@edunotes.ac'],
  ['24G098', 'JATO Émeline', 'e.jato@edunotes.ac'],
  ['24G099', 'KOTTO Alain', 'a.kotto@edunotes.ac'],
  ['24G100', 'LOWE Pierrette', 'p.lowe@edunotes.ac'],
  ['24G101', 'MEFIRE Augustin', 'a.mefire@edunotes.ac'],
  ['24G102', 'NDONGO Carmelle', 'c.ndongo@edunotes.ac'],
  ['24G103', 'OYONO Timothée', 't.oyono@edunotes.ac'],
  ['24G104', 'PAPA Justine', 'j.papa@edunotes.ac'],
  ['24G105', 'ROUGA Valentin', 'v.rouga@edunotes.ac'],
  ['24G106', 'SONFACK Gloria', 'g.sonfack@edunotes.ac'],
  ['24G107', 'TEMGOUA Blaise', 'b.temgoua@edunotes.ac'],
  ['24G108', 'UKWEN Laetitia', 'l.ukwen@edunotes.ac'],
  ['24G109', 'VENDJI Raphaël', 'r.vendji@edunotes.ac'],
  ['24G110', 'WAFO Simone', 's.wafo@edunotes.ac'],
  ['24G111', 'YONDO Firmin', 'f.yondo@edunotes.ac'],
  ['24G112', 'ZOGO Ariane', 'a.zogo2@edunotes.ac'],
  ['24G113', 'AFANA Christ', 'c.afana@edunotes.ac'],
  ['24G114', 'BILONG Sophie', 's.bilong@edunotes.ac'],
  ['24G115', 'CHOFOR Emmanuel', 'e.chofor@edunotes.ac'],
  ['24G116', 'DION Régine', 'r.dion@edunotes.ac'],
  ['24G117', 'EWANE Faustin', 'f.ewane@edunotes.ac'],
  ['24G118', 'FOSSO Olive', 'o.fosso@edunotes.ac'],
  ['24G119', 'GHOMSSI Armand', 'a.ghomssi@edunotes.ac'],
  ['24G120', 'HAMAN Souley', 's.haman@edunotes.ac'],
  ['24G121', 'IBRAHIMA Awa', 'a.ibrahima@edunotes.ac'],
  ['24G122', 'TSAFACK Joël', 'j.tsafack@edunotes.ac'],
  ['24G123', 'KENFACK Hélène', 'h.kenfack@edunotes.ac'],
  ['24G124', 'LINWA Bruno', 'b.linwa@edunotes.ac'],
  ['24G125', 'MAKEMBE Flore', 'f.makembe@edunotes.ac'],
  ['24G126', 'NGAKO Sylvain', 's.ngako@edunotes.ac'],
  ['24G127', 'OLINGA Henriette', 'h.olinga@edunotes.ac'],
  ['24G128', 'PLONG Gabriel', 'g.plong@edunotes.ac'],
  ['24G129', 'RUBEN Célestine', 'c.ruben@edunotes.ac'],
  ['24G130', 'SOULE Ismaïl', 'i.soule@edunotes.ac'],
  ['24G131', 'TCHATCHOUA Lydia', 'l.tchatchoua@edunotes.ac'],
  ['24G132', 'ULRICH Patience', 'p.ulrich@edunotes.ac'],
  ['24G133', 'VOUNDI Jackson', 'j.voundi@edunotes.ac'],
  ['24G134', 'WANDJI Rosalie', 'r.wandji@edunotes.ac'],
  ['24G135', 'YELEMA Didier', 'd.yelema@edunotes.ac'],
  ['24G136', 'ZANG Perpetue', 'p.zang@edunotes.ac'],
  ['24G137', 'ASSIGA Norbert', 'n.assiga@edunotes.ac'],
  ['24G138', 'BAYEMI Ghislaine', 'g.bayemi@edunotes.ac'],
  ['24G139', 'CHIFEN Arsène', 'a.chifen@edunotes.ac'],
  ['24G140', 'DONGMO Estelle', 'e.dongmo@edunotes.ac'],
  ['24G141', 'EKOBENA Richard', 'r.ekobena@edunotes.ac'],
  ['24G142', 'FONKA Thérèse', 't.fonka@edunotes.ac'],
  ['24G143', 'GARGA Aminou', 'a.garga@edunotes.ac'],
  ['24G144', 'HIWE Constance', 'c.hiwe@edunotes.ac'],
  ['24G145', 'ISSA Sakina', 's.issa@edunotes.ac'],
  ['24G146', 'JOUGLA Fernand', 'f.jougla@edunotes.ac'],
  ['24G147', 'KOAGNE Inès', 'i.koagne@edunotes.ac'],
  ['24G148', 'LEKANE Théodore', 't.lekane@edunotes.ac'],
  ['24G149', 'MOTAZE Célestine', 'c.motaze@edunotes.ac'],
  ['24G150', 'NFL Anicet', 'a.nfl@edunotes.ac'],
  ['24G151', 'ONFACK Claudine', 'c.onfack@edunotes.ac'],
  ['24G152', 'PICHOT René', 'r.pichot@edunotes.ac'],
  ['24G153', 'RAISSA Aboubakar', 'a.raissa@edunotes.ac'],
  ['24G154', 'SIPOHLA Diane', 'd.sipohla@edunotes.ac'],
  ['24G155', 'TAKAM Fernande', 'f.takam@edunotes.ac'],
  ['24G156', 'UDAMA Basile', 'b.udama@edunotes.ac'],
  ['24G157', 'VOUGMO Jacqueline', 'j.vougmo@edunotes.ac'],
  ['24G158', 'WANSI Germain', 'g.wansi@edunotes.ac'],
  ['24G159', 'YAKAM Lucien', 'l.yakam@edunotes.ac'],
  ['24G160', 'ZANGUE Odile', 'o.zangue@edunotes.ac'],
  ['24G161', 'AMBOMO Maxime', 'm.ambomo@edunotes.ac'],
  ['24G162', 'BELLA Josiane', 'j.bella@edunotes.ac'],
  ['24G163', 'CHIMI Bienvenue', 'b.chimi@edunotes.ac'],
  ['24G164', 'DJOMENI Léonie', 'l.djomeni@edunotes.ac'],
  ['24G165', 'ETONGUE Hyacinthe', 'h.etongue@edunotes.ac'],
  ['24G166', 'FEUZEU Rachelle', 'r.feuzeu@edunotes.ac'],
  ['24G167', 'GUEBEDIANG Nicolas', 'n.guebediang@edunotes.ac'],
  ['24G168', 'HAGBE Salomé', 's.hagbe@edunotes.ac'],
  ['24G169', 'IVAHA Dominique', 'd.ivaha@edunotes.ac'],
  ['24G170', 'JOUSSE Brigitte', 'b.jousse@edunotes.ac'],
  ['24G171', 'KENMOGNE Aristide', 'a.kenmogne@edunotes.ac'],
  ['24G172', 'LIKENG Henriette', 'h.likeng@edunotes.ac'],
  ['24G173', 'MAHOP Célestin', 'c.mahop@edunotes.ac'],
  ['24G174', 'NGALLE Fidèle', 'f.ngalle@edunotes.ac'],
  ['24G175', 'OBAM Régis', 'r.obam@edunotes.ac'],
  ['24G176', 'PENDA Yvonne', 'y.penda@edunotes.ac'],
  ['24G177', 'BIYAGA Gilbert', 'g.biyaga@edunotes.ac'],
  ['24G178', 'SADOU Halima', 'h.sadou@edunotes.ac'],
  ['24G179', 'TAYO Grâce', 'g.tayo@edunotes.ac'],
  ['24G180', 'UMBA Réginald', 'r.umba@edunotes.ac'],
  ['24G181', 'VOULA Adrienne', 'a.voula@edunotes.ac'],
  ['24G182', 'WOPE Innocent', 'i.wope@edunotes.ac'],
  ['24G183', 'YATCHOU Fernande', 'f.yatchou@edunotes.ac'],
  ['24G184', 'ZAHUI Clotilde', 'c.zahui@edunotes.ac'],
  ['24G185', 'AKONO Stéphane', 's.akono@edunotes.ac'],
  ['24G186', 'BINDZI Martine', 'm.bindzi@edunotes.ac'],
  ['24G187', 'CHIATOH Basil', 'b.chiatoh@edunotes.ac'],
  ['24G188', 'DJOUDA Hortense', 'h.djouda@edunotes.ac'],
  ['24G189', 'ELONG Raphaël', 'r.elong@edunotes.ac'],
  ['24G190', 'FANKAM Virginie', 'v.fankam@edunotes.ac'],
  ['24G191', 'GANKOU Achille', 'a.gankou@edunotes.ac'],
  ['24G192', 'HORA Josué', 'j.hora@edunotes.ac'],
  ['24G193', 'ITOUA Séraphine', 's.itoua@edunotes.ac'],
  ['24G194', 'JINABO Thomas', 't.jinabo@edunotes.ac'],
  ['24G195', 'KEYI Monique', 'm.keyi@edunotes.ac'],
  ['24G196', 'LEMBE Sylvère', 's.lembe@edunotes.ac'],
  ['24G197', 'MANGA Joséphine', 'j.manga@edunotes.ac'],
  ['24G198', 'NGAMBI Théophile', 't.ngambi@edunotes.ac'],
  ['24G199', 'YEMDJI Raoul', 'r.yemdji@edunotes.ac'],
  ['24G200', 'ZOGO Samuel', 's.zogo@edunotes.ac'],
];

// ══════════════════════════════════════════════════
// RÉPARTITION INÉGALE dans les 14 classes
// Les filières populaires (Génie Logiciel, Ingénierie) 
// reçoivent plus d'étudiants que d'autres (Arts, Médecine)
// ══════════════════════════════════════════════════
const CLASS_DISTRIBUTION = [
  // [classeId, nombre d'étudiants à y placer]
  ['cls-gl(8-a', 22],   // Génie Logiciel A       — 22 étudiants
  ['cls-gl(1-b', 20],   // Génie Logiciel B       — 20 étudiants
  ['cls-i3-a',   18],   // Ingénierie A           — 18 étudiants
  ['cls-i1-b',   17],   // Ingénierie B           — 17 étudiants
  ['cls-géi5-a', 16],   // Génie Électrique A     — 16 étudiants
  ['cls-géi5-b', 15],   // Génie Électrique B     — 15 étudiants
  ['cls-gce2-a', 14],   // Génie Civil A          — 14 étudiants
  ['cls-gce4-b', 13],   // Génie Civil B          — 13 étudiants
  ['cls-gie6-a', 13],   // Génie Industriel A     — 13 étudiants
  ['cls-gie9-b', 12],   // Génie Industriel B     — 12 étudiants
  ['cls-m2-a',   11],   // Médecine A             — 11 étudiants
  ['cls-m3-b',   10],   // Médecine B             — 10 étudiants
  ['cls-a&d1-a',  10],   // Arts & Design A        — 10 étudiants
  ['cls-a&d1-b',  9],    // Arts & Design B        —  9 étudiants
];
// Total = 22+20+18+17+16+15+14+13+13+12+11+10+10+9 = 200 ✓

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  INSERTION DE 200 ÉTUDIANTS — EduNotes v3.0     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Vérifier que les classes existent
  const classes = await prisma.classe.findMany({ where: { actif: true } });
  const classIds = new Set(classes.map(c => c.id));
  console.log(`✅ ${classes.length} classes actives trouvées en BD.\n`);

  for (const [clsId] of CLASS_DISTRIBUTION) {
    if (!classIds.has(clsId)) {
      console.error(`❌ ERREUR: Classe ${clsId} introuvable ! Abandon.`);
      return;
    }
  }

  // Mot de passe par défaut pour tous les étudiants
  const defaultPassword = await bcrypt.hash('Edunotes2025!', 10);

  // Construire la liste des étudiants avec leur classe assignée
  let cursor = 0;
  const assignments = []; // { matricule, nom, prenom, email, classeId }

  for (const [classeId, count] of CLASS_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      const [matricule, nomComplet, email] = ETUDIANTS_DATA[cursor];
      
      // Séparer nom et prénom (le dernier mot = prénom, le reste = nom)
      const parts = nomComplet.split(' ');
      const nom = parts[0];
      const prenom = parts.slice(1).join(' ');
      
      assignments.push({ matricule, nom, prenom, email, classeId });
      cursor++;
    }
  }

  console.log(`📋 ${assignments.length} étudiants à insérer.\n`);

  // Insertion par lots de 20 pour éviter les problèmes de performance
  let inserted = 0;
  let skipped = 0;
  const BATCH_SIZE = 20;

  for (let b = 0; b < assignments.length; b += BATCH_SIZE) {
    const batch = assignments.slice(b, b + BATCH_SIZE);
    
    for (const etu of batch) {
      try {
        // Vérifier si l'email existe déjà
        const existing = await prisma.user.findUnique({ where: { email: etu.email } });
        if (existing) {
          console.log(`⏭️  SKIP ${etu.matricule} (${etu.email}) — déjà en BD`);
          skipped++;
          continue;
        }

        // Vérifier si le matricule existe déjà
        const existingMat = await prisma.etudiant.findUnique({ where: { matricule: etu.matricule } });
        if (existingMat) {
          console.log(`⏭️  SKIP ${etu.matricule} — matricule existant`);
          skipped++;
          continue;
        }

        // Créer User + Etudiant en transaction
        await prisma.user.create({
          data: {
            email: etu.email,
            password: defaultPassword,
            nom: etu.nom,
            prenom: etu.prenom,
            role: 'ETUDIANT',
            actif: true,
            etudiant: {
              create: {
                matricule: etu.matricule,
                classeId: etu.classeId,
                anneeentree: 2024,
                sexe: guessGender(etu.prenom),
                nationalite: 'Camerounaise',
              }
            }
          }
        });

        inserted++;
      } catch (err) {
        console.error(`❌ Erreur sur ${etu.matricule}: ${err.message}`);
      }
    }

    const pct = Math.round(((b + batch.length) / assignments.length) * 100);
    console.log(`   ◼ Lot ${Math.floor(b/BATCH_SIZE)+1} traité — ${pct}% (${inserted} insérés, ${skipped} ignorés)`);
  }

  // Mettre à jour les effectifs des classes
  console.log('\n🔄 Mise à jour des effectifs...');
  for (const cls of classes) {
    const count = await prisma.etudiant.count({ where: { classeId: cls.id } });
    await prisma.classe.update({
      where: { id: cls.id },
      data: { effectif: count }
    });
  }

  // Rapport final
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║          RAPPORT D\'INSERTION FINAL               ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  ✅ Insérés  : ${String(inserted).padStart(3)}                              ║`);
  console.log(`║  ⏭️  Ignorés  : ${String(skipped).padStart(3)}                              ║`);
  console.log('╠══════════════════════════════════════════════════╣');

  for (const [classeId, targetCount] of CLASS_DISTRIBUTION) {
    const realCount = await prisma.etudiant.count({ where: { classeId } });
    const clsData = classes.find(c => c.id === classeId);
    const name = clsData ? clsData.nom.substring(0, 35).padEnd(35) : classeId.padEnd(35);
    console.log(`║  ${name} : ${String(realCount).padStart(3)} étudiants ║`);
  }

  console.log('╚══════════════════════════════════════════════════╝');
}

// Deviner le genre à partir du prénom (heuristique simple)
function guessGender(prenom) {
  const feminins = ['Solange','Mireille','Aminata','Estelle','Carine','Brigitte','Vanessa',
    'Sandrine','Alice','Fatoumata','Carole','Micheline','Patricia','Irène','Aïcha','Raïssa',
    'Rose','Olga','Fatiha','Colette','Félicité','Sylvie','Clarisse','Émilienne','Nadège',
    'Gaëlle','Salima','Nadine','Florence','Ruth','Annette','Marguerite','Arlette','Gisèle',
    'Christelle','Mariama','Blandine','Cécile','Nathalie','Émeline','Pierrette','Justine',
    'Gloria','Laetitia','Simone','Ariane','Sophie','Régine','Olive','Awa','Hélène','Flore',
    'Henriette','Célestine','Lydia','Patience','Rosalie','Perpetue','Ghislaine','Estelle',
    'Thérèse','Constance','Sakina','Inès','Célestine','Claudine','Diane','Fernande',
    'Jacqueline','Odile','Josiane','Léonie','Rachelle','Salomé','Brigitte','Henriette',
    'Yvonne','Halima','Grâce','Adrienne','Fernande','Clotilde','Martine','Hortense',
    'Virginie','Séraphine','Monique','Joséphine'];
  return feminins.some(f => prenom.includes(f)) ? 'F' : 'M';
}

main()
  .catch(err => { console.error('ERREUR FATALE:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
