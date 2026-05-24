import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const email = (session.user as { email?: string }).email
  if (!email) return NextResponse.json({ error: 'No email in session' }, { status: 400 })
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, phone: true, whatsapp: true, role: true, googleRefreshToken: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { googleRefreshToken, ...rest } = user
  return NextResponse.json({ ...rest, googleCalendarConnected: !!googleRefreshToken })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const email = (session.user as { email?: string }).email
  if (!email) return NextResponse.json({ error: 'No email in session' }, { status: 400 })
  try {
    const body = await request.json()
    const user = await prisma.user.update({
      where: { email },
      data: { name: body.name, phone: body.phone ?? undefined, whatsapp: body.whatsapp ?? undefined },
      select: { id: true, name: true, email: true, phone: true, whatsapp: true, role: true },
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
