import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entry = body?.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value

    if (value?.messages?.[0]) {
      const msg = value.messages[0]
      const from = msg.from as string
      const text = (msg.text?.body || msg.type || '') as string
      const waMessageId = msg.id as string | undefined

      await prisma.whatsAppMessage.create({
        data: { from, text, waMessageId: waMessageId || null },
      }).catch(console.error)
    }

    if (value?.statuses?.[0]) {
      const status = value.statuses[0]
      console.log(`WhatsApp status: ${status.status} for message ${status.id}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
