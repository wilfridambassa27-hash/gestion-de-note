import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    let userId = searchParams.get("userId")
    const isMe = searchParams.get("me") === 'true'

    if (isMe) {
      userId = session.user.id
    }

    const whereClause = {
      ...(userId ? { userId } : {}),
      ...(isMe ? { read: false } : {}), // Unread for /me
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: isMe ? 10 : 50,
      include: {
        user: true
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount: isMe ? notifications.length : 0
    })
  } catch (error) {
    console.error("Erreur notifications:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    const notification = await prisma.notification.create({
      data: {
        userId: body.userId || session.user.id,
        title: body.title || body.action || "INFO",
        message: body.message || body.description || "",
        type: body.type || "INFO",
        read: false
      }
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Erreur création notification:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { notificationId } = await request.json()

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Erreur update notification:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
export const revalidate = 0
