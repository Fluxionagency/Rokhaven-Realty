import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const inspections = await prisma.inspection.findMany({
      where,
      include: { property: { select: { title: true, location: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(inspections)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const refNo = `RKH-${Date.now().toString(36).toUpperCase()}`

    const inspection = await prisma.inspection.create({
      data: {
        propertyId: body.propertyId,
        clientName: body.name || body.clientName || '',
        clientEmail: body.email || body.clientEmail || '',
        clientPhone: body.phone || body.clientPhone || '',
        preferredDate: body.inspDate || body.preferredDate || '',
        preferredTime: body.inspTime || body.preferredTime || '',
        principal: body.principal === true || body.principal === 'yes' || body.principal === 'investment',
        budget: body.budget || null,
        mustHaves: Array.isArray(body.mustHaves) ? JSON.stringify(body.mustHaves) : (body.mustHaves || null),
        timeline: body.timeline || null,
        contactTime: body.contactTime || null,
        howHeard: body.referral || body.howHeard || null,
        notes: body.notes || null,
        source: 'WEBSITE',
        referenceNo: refNo,
      },
    })
    return NextResponse.json(inspection, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create inspection' }, { status: 500 })
  }
}
