import prisma from '@/lib/prisma'

async function seedMatricule() {
  // Find the first student (or all students needing the ETU-2026 matricule pattern)
  const existingEDU = await prisma.etudiant.findFirst({
    where: { matricule: 'EDU-2026' }
  })

  if (existingEDU) {
    console.log('Matricule EDU-2026 already exists for:', existingEDU.id)
    return
  }

  // Try to find any first student without that matricule, or one seeded as ETU-*
  const student = await prisma.etudiant.findFirst({
    orderBy: { id: 'asc' }
  })

  if (!student) {
    console.log('No students found in the database.')
    return
  }

  const updated = await prisma.etudiant.update({
    where: { id: student.id },
    data: { matricule: 'EDU-2026' }
  })

  console.log(`Updated student ${updated.id} to matricule: ${updated.matricule}`)
}

seedMatricule()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
