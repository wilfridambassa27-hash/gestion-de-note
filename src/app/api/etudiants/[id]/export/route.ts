import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { calcMoyenneGenerale, getMention } from '@/lib/gradeCalc'

// GET /api/bulletins/[id]/export?format=excel|pdf
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: etudiantId } = await params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'excel'
    const semestreId = searchParams.get('semestreId')

    // Fetch student data
    const etudiant = await prisma.etudiant.findUnique({
      where: { id: etudiantId },
      include: {
        user: { select: { nom: true, prenom: true, email: true } },
        classe: true,
        notes: {
          where: semestreId ? { semestreId } : {},
          include: {
            matiere: true,
            semestre: true,
            evaluation: true,
          },
          orderBy: { datenote: 'desc' },
        },
      },
    })

    if (!etudiant) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    const notes = etudiant.notes
    const noteEntries = notes.map(n => ({
      valeur: n.valeur,
      credits: n.matiere?.credits || 1,
      matiereId: n.matiereId,
      evalCoefficient: (n as any).evaluation?.coefficient || 1
    }))
    const moyenne = calcMoyenneGenerale(noteEntries)
    const mention = getMention(moyenne)

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'EduNotes Elite'
      const sheet = workbook.addWorksheet('Relevé de Notes')

      // Header
      sheet.mergeCells('A1:F1')
      sheet.getCell('A1').value = 'RELEVÉ DE NOTES — EDUNOTES ELITE'
      sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
      sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
      sheet.getCell('A1').alignment = { horizontal: 'center' }

      sheet.addRow([])
      sheet.addRow(['Étudiant', `${etudiant.user.prenom} ${etudiant.user.nom}`])
      sheet.addRow(['Classe', etudiant.classe?.nom || '-'])
      sheet.addRow(['Semestre', notes[0]?.semestre?.libelle || '-'])
      sheet.addRow(['Moyenne Générale', `${moyenne}/20`])
      sheet.addRow(['Mention', mention])
      sheet.addRow([])

      // Table header
      const tableHeader = sheet.addRow(['Matière', 'Code', 'Crédits', 'Type', 'Note /20', 'Appréciation'])
      tableHeader.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }
        cell.alignment = { horizontal: 'center' }
      })

      // Data rows
      for (const note of notes) {
        const row = sheet.addRow([
          note.matiere?.intitule || '-',
          note.matiere?.code || '-',
          note.matiere?.credits || 1,
          (note as any).evaluation?.type || 'CC',
          note.valeur,
          note.appreciation || '-',
        ])
        const noteCell = row.getCell(5)
        noteCell.font = { bold: true, color: { argb: note.valeur >= 10 ? 'FF16A34A' : 'FFDC2626' } }
      }

      // Summary row
      sheet.addRow([])
      const summaryRow = sheet.addRow(['', '', '', '', `Moy. : ${moyenne}/20`, mention])
      summaryRow.eachCell(cell => { cell.font = { bold: true } })

      // Column widths
      sheet.columns = [
        { key: 'A', width: 40 },
        { key: 'B', width: 12 },
        { key: 'C', width: 10 },
        { key: 'D', width: 12 },
        { key: 'E', width: 12 },
        { key: 'F', width: 30 },
      ]

      const buffer = await workbook.xlsx.writeBuffer()

      return new NextResponse(buffer as ArrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="releve-notes-${etudiant.user.nom}-${etudiant.user.prenom}.xlsx"`,
          'Cache-Control': 'no-cache',
        },
      })
    }

    return NextResponse.json({ error: 'Format non supporté' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du fichier' }, { status: 500 })
  }
}
