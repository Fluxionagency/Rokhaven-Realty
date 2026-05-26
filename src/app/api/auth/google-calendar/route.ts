import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.redirect(process.env.NEXTAUTH_URL + '/admin')

  const email = (session.user as { email?: string }).email
  if (!email) return NextResponse.redirect(process.env.NEXTAUTH_URL + '/admin')

  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID not configured' }, { status: 503 })
  }

  const state = Buffer.from(email).toString('base64url')
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = (session.user as { email?: string }).email
  if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })

  await prisma.user.update({
    where: { email },
    data: { googleRefreshToken: null },
  })

  return NextResponse.json({ ok: true })
}
