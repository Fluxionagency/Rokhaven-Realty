import { NextRequest, NextResponse } from 'next/server'

// Meta calls GET to verify the webhook endpoint
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

// Meta calls POST for incoming messages and status updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entry = body?.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value

    // Incoming message from a client
    if (value?.messages?.[0]) {
      const msg = value.messages[0]
      const from = msg.from
      const text = msg.text?.body || ''
      console.log(`WhatsApp message from ${from}: ${text}`)
      // Future: save to DB, notify admin, auto-reply
    }

    // Delivery status update
    if (value?.statuses?.[0]) {
      const status = value.statuses[0]
      console.log(`WhatsApp status: ${status.status} for message ${status.id}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ ok: true }) // always 200 to Meta
  }
}
