import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateCode(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const expiryDays = body.expiryDays || 7
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiryDays)

    let code = generateCode()
    // ensure uniqueness
    while (await prisma.bookingLink.findUnique({ where: { code } })) {
      code = generateCode()
    }

    const link = await prisma.bookingLink.create({
      data: {
        code,
        propertyId: body.propertyId || null,
        clientName: body.clientName || null,
        clientPhone: body.clientPhone || null,
        note: body.note || null,
        expiresAt,
      },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create booking link' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const links = await prisma.bookingLink.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(links)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
