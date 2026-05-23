import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const enquiries = await prisma.enquiry.findMany({
      include: { property: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(enquiries)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const enquiry = await prisma.enquiry.create({
      data: {
        propertyId: body.propertyId || null,
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        intent: body.intent || null,
        transactionType: body.txn || body.transactionType || null,
        propertyType: Array.isArray(body.prop_type) ? JSON.stringify(body.prop_type) : (body.propertyType || null),
        bedrooms: body.bedrooms ? String(body.bedrooms) : null,
        locations: Array.isArray(body.locations) ? JSON.stringify(body.locations) : (body.locations || null),
        budget: body.budget || null,
        mustHaves: Array.isArray(body.musts) ? JSON.stringify(body.musts) : (body.mustHaves || null),
        timeline: body.timeline || null,
        contactTime: body.contact || body.contactTime || null,
        howHeard: body.referral || body.howHeard || null,
        notes: body.notes || null,
        brokerageAgreed: body.brokerage === 'agree' || body.brokerageAgreed === true,
        marketingConsent: body.marketing === 'yes' || body.marketingConsent === true,
      },
    })
    return NextResponse.json(enquiry, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
