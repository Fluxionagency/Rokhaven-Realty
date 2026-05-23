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
    const enquiry = await prisma.enquiry.create({ data: body })
    return NextResponse.json(enquiry, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
