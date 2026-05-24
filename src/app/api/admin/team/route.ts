import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const members = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, name: true, email: true, phone: true, role: true, title: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(members)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { name, email, title } = await request.json()
    if (!name || !email) return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    const tempPassword = crypto.randomBytes(12).toString('hex')
    const passwordHash = await bcrypt.hash(tempPassword, 12)
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash, role: 'ADMIN', title: title || 'Agent' },
      select: { id: true, name: true, email: true, role: true, title: true },
    })
    return NextResponse.json({ ...user, tempPassword }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await request.json()
  const sessionEmail = (session.user as { email?: string }).email
  const target = await prisma.user.findUnique({ where: { id }, select: { email: true } })
  if (target?.email === sessionEmail) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
  }
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
