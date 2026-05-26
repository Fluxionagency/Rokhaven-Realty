/**
 * POST /api/expertlisting/publish/[id]
 *
 * Takes an ImportedProperty and creates a real Property record from it,
 * then marks the import as PUBLISHED.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Only admins can publish
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const imported = await prisma.importedProperty.findUnique({
    where: { id: params.id },
  })

  if (!imported) {
    return NextResponse.json({ error: 'Imported property not found' }, { status: 404 })
  }
  if (imported.status === 'PUBLISHED') {
    return NextResponse.json({ error: 'Already published' }, { status: 400 })
  }

  // Map transaction type → RokHaven Category enum
  const categoryMap: Record<string, string> = {
    rent:       'RENT',
    sale:       'SALE',
    buy:        'SALE',
    lease:      'RENT',
    commercial: 'SALE',
    shortlet:   'SHORTLET',
  }
  const category = categoryMap[imported.transactionType.toLowerCase()] ?? 'SALE'

  // Create the Property
  const property = await prisma.property.create({
    data: {
      title:         imported.title,
      description:   imported.description,
      price:         `₦${Number(imported.price).toLocaleString('en-NG')}`,
      location:      imported.fullAddress || `${imported.lcda}, ${imported.state}`,
      neighbourhood: imported.neighborhood || undefined,
      type:          imported.propertyType,
      category:      category as any,
      bedrooms:      imported.bedroomCount,
      bathrooms:     imported.bathroomCount,
      sqm:           null,
      features:      imported.features,  // already JSON string
      images:        imported.images,    // already JSON string
      status:        'ACTIVE',
    },
  })

  // Mark import as published
  await prisma.importedProperty.update({
    where: { id: params.id },
    data: { status: 'PUBLISHED', publishedPropertyId: property.id },
  })

  return NextResponse.json({ success: true, propertyId: property.id })
}
