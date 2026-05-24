import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const link = await prisma.bookingLink.findUnique({
      where: { code },
    })

    if (!link) {
      return NextResponse.json({ error: 'Invalid booking link' }, { status: 404 })
    }

    if (link.used) {
      return NextResponse.json({ error: 'This booking link has already been used' }, { status: 410 })
    }

    if (new Date() > link.expiresAt) {
      return NextResponse.json({ error: 'This booking link has expired' }, { status: 410 })
    }

    let property = null
    if (link.propertyId) {
      property = await prisma.property.findUnique({
        where: { id: link.propertyId },
        select: { id: true, title: true, location: true, bedrooms: true, bathrooms: true, images: true, price: true },
      })
    }

    return NextResponse.json({ link, property })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
