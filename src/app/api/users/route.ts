import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const users = await prisma.user.findMany({
      include: {
        etudiant: {
          include: {
            classe: true,
            notes: { select: { valeur: true } },
            bulletins: { 
              orderBy: { dategeneration: 'desc' },
              take: 1
            }
          }
        },
        enseignant: {
          include: {
            classesprincipales: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, password, nom, prenom, role, telephone, adresse, classeId, matricule, specialite } = body

    if (!email || !password || !nom || !prenom || !role) {
      return NextResponse.json(
        { error: 'Données incomplètes' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email déjà utilisé' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        role,
        telephone: telephone || null,
        adresse: adresse || null,
        actif: true
      }
    })

    if (role === 'ETUDIANT') {
      await prisma.etudiant.create({
        data: {
          userId: user.id,
          matricule: `ETU-${Date.now()}`,
          classeId: role === 'ETUDIANT' ? classeId : null
        }
      })
    } else if (role === 'ENSEIGNANT') {
      const ens = await prisma.enseignant.create({
        data: {
          userId: user.id,
          matricule: matricule || `ENS-${Date.now()}`,
          specialite: specialite || null
        }
      })
      if (classeId) {
        await prisma.classe.update({
          where: { id: classeId },
          data: { professeurprincipalId: ens.id }
        })
      }
    } else if (role === 'ADMIN') {
      await prisma.administrateur.create({
        data: {
          userId: user.id
        }
      })
    } else if (role === 'PARENT') {
      // Create a default parent record. Real app would link to students here.
      await prisma.parent.create({
        data: {
          userId: user.id,
          etudiantId: 'TEMP_ID' // Requires UI update in Phase 4 to select student
        }
      })
    }

    await createLog({
      userId: session.user.id,
      action: 'CREATE',
      type: 'USER',
      description: `Nouvel utilisateur créé: ${prenom} ${nom} (${role})`,
      details: {
        targetUserId: user.id,
        email: user.email,
        role: user.role
      }
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      telephone: user.telephone,
      actif: user.actif,
      createdAt: user.createdAt
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, nom, prenom, telephone, actif, classeId } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        nom,
        prenom,
        telephone,
        actif
      }
    })

    if (user.role === 'ETUDIANT' && classeId) {
      await prisma.etudiant.update({
        where: { userId: id },
        data: { classeId }
      })
    } else if (user.role === 'ENSEIGNANT' && classeId) {
      const ens = await prisma.enseignant.findUnique({ where: { userId: id } })
      if (ens) {
        await prisma.classe.update({
          where: { id: classeId },
          data: { professeurprincipalId: ens.id }
        })
      }
    }

    await createLog({
      userId: session.user.id,
      action: 'UPDATE',
      type: 'USER',
      description: `Utilisateur modifié: ${prenom} ${nom}`,
      details: {
        targetUserId: id,
        changes: { nom, prenom, telephone, actif }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    await prisma.user.update({
      where: { id: userId },
      data: { actif: false }
    })

    await createLog({
      userId: session.user.id,
      action: 'DELETE',
      type: 'USER',
      description: `Utilisateur désactivé: ${user.prenom} ${user.nom}`,
      details: {
        targetUserId: userId,
        email: user.email,
        role: user.role
      }
    })

    return NextResponse.json({ message: 'Utilisateur désactivé avec succès' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la désactivation de l\'utilisateur' },
      { status: 500 }
    )
  }
}
