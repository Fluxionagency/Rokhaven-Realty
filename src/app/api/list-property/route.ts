import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { autoCreateProfile } from '@/lib/autoProfile'
import { sendAdminPropertyAlert } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.email || !body.name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const { userId } = await autoCreateProfile(body.email, body.name, body.phone || '', 'PRINCIPAL')

    await prisma.propertySubmission.create({
      data: {
        principalId: userId,
        relationship: body.role || 'owner',
        title: `${body.propertyType || 'Property'} – ${body.location || ''}`.trim(),
        category: body.listingType || 'SALE',
        type: body.propertyType || '',
        price: body.price || '',
        location: body.location || '',
        neighbourhood: body.neighbourhood || null,
        bedrooms: parseInt(body.bedrooms) || 0,
        bathrooms: parseInt(body.bathrooms) || 0,
        description: body.description || '',
        features: JSON.stringify(body.amenities || []),
        status: 'PENDING',
      },
    })

    await sendAdminPropertyAlert({
      name: body.name, email: body.email, phone: body.phone || '',
      propertyType: body.propertyType || '', location: body.location || '',
      listingType: body.listingType || '',
    }).catch(console.error)

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
