import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const base = process.env.NEXTAUTH_URL + '/admin'

  if (error || !code || !state) {
    return NextResponse.redirect(base + '?calendarError=cancelled')
  }

  try {
    const email = Buffer.from(state, 'base64url').toString()

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (!tokens.refresh_token) {
      return NextResponse.redirect(base + '?calendarError=no_token')
    }

    await prisma.user.update({
      where: { email },
      data: { googleRefreshToken: tokens.refresh_token },
    })

    return NextResponse.redirect(base + '?calendarConnected=1')
  } catch {
    return NextResponse.redirect(base + '?calendarError=failed')
  }
}
