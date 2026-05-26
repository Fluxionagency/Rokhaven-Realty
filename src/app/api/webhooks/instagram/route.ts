import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAdminEnquiryAlert } from '@/lib/email'
import { notifyAdminsNewEnquiry } from '@/lib/whatsapp'

// Meta calls GET to verify the webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Meta calls POST when an Instagram DM arrives
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    for (const entry of body?.entry ?? []) {
      for (const msg of entry?.messaging ?? []) {
        const senderId = msg.sender?.id as string | undefined
        const text = msg.message?.text as string | undefined

        if (!senderId || msg.message?.is_echo) continue

        // Fetch sender profile from Instagram Graph API
        let senderName = `Instagram User (${senderId})`
        try {
          const profileRes = await fetch(
            `https://graph.instagram.com/${senderId}?fields=name&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
          )
          if (profileRes.ok) {
            const profile = await profileRes.json()
            if (profile.name) senderName = profile.name
          }
        } catch { /* ignore — use fallback name */ }

        // Create enquiry so the DM appears in the Leads section
        const enquiry = await prisma.enquiry.create({
          data: {
            name: senderName,
            email: `ig-${senderId}@instagram.dm`,
            phone: 'via Instagram DM',
            intent: 'Instagram DM',
            howHeard: 'Instagram',
            notes: text ? `"${text}"` : 'No text content',
            status: 'NEW',
          },
        })

        // Notify admins
        await sendAdminEnquiryAlert({
          name: senderName,
          email: enquiry.email,
          phone: enquiry.phone,
          subject: 'Instagram DM',
          message: text || '(media or no text)',
        }).catch(console.error)

        await notifyAdminsNewEnquiry({
          name: senderName,
          phone: 'Instagram DM',
          email: enquiry.email,
          subject: `📸 Instagram DM: ${text?.slice(0, 60) || '(media)'}`,
        }).catch(console.error)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Instagram webhook error:', err)
    return NextResponse.json({ ok: true }) // always 200 to Meta
  }
}
