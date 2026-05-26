import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppText, isWhatsAppConfigured } from '@/lib/whatsapp'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!isWhatsAppConfigured()) {
    return NextResponse.json({ error: 'WhatsApp is not configured.' }, { status: 400 })
  }
  const email = (session.user as { email?: string }).email
  if (!email) return NextResponse.json({ error: 'No email in session' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { email },
    select: { whatsapp: true, name: true },
  })
  if (!user?.whatsapp) {
    return NextResponse.json(
      { error: 'No WhatsApp number on your account. Add it in Account → My Integrations first.' },
      { status: 400 }
    )
  }
  try {
    await sendWhatsAppText(
      user.whatsapp,
      `✅ RokHaven test message — WhatsApp Business API is connected and working correctly.`
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send. Check your API credentials in Vercel.' }, { status: 500 })
  }
}
