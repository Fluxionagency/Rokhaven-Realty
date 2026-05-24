import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')?.toUpperCase()
    const location = searchParams.get('location')
    const type = searchParams.get('type')
    const minBeds = searchParams.get('minBeds')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    const admin = searchParams.get('admin')
    const where: Record<string, unknown> = admin ? {} : { status: 'ACTIVE' }
    if (category && category !== 'ALL') where.category = category
    if (location && location !== 'any') where.neighbourhood = { contains: location }
    if (type && type !== 'any') where.type = { contains: type }
    if (minBeds) where.bedrooms = { gte: parseInt(minBeds) }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { location: { contains: search } },
        { neighbourhood: { contains: search } },
      ]
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ])

    return NextResponse.json({ properties, total, page, limit })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const property = await prisma.property.create({
      data: {
        title: body.title,
        description: body.description || '',
        price: body.price,
        location: body.location,
        neighbourhood: body.neighbourhood || null,
        type: body.type || 'Fully Detached',
        category: (body.category as 'SALE' | 'RENT' | 'SHORTLET' | 'JV') || 'SALE',
        bedrooms: parseInt(body.bedrooms) || 1,
        bathrooms: parseInt(body.bathrooms) || 1,
        sqm: body.sqm ? parseFloat(body.sqm) : null,
        features: body.features || '[]',
        images: body.images || '[]',
        video: body.video || null,
        badge: body.badge || null,
        status: (body.status as 'ACTIVE' | 'PENDING' | 'RENTED' | 'SOLD' | 'INACTIVE') || 'ACTIVE',
      },
    })
    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
