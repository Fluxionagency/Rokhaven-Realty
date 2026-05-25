const PHONE_ID = process.env.WHATSAPP_PHONE_ID
const TOKEN = process.env.WHATSAPP_API_TOKEN
const API_URL = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`

export function isWhatsAppConfigured(): boolean {
  return !!(PHONE_ID && TOKEN)
}

export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  if (!isWhatsAppConfigured()) return
  const phone = to.replace(/\D/g, '')
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: text },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(JSON.stringify(err))
  }
}

export async function notifyAdminsNewInspection(data: {
  name: string
  phone: string
  propertyName: string
  date: string
  time: string
  refNo: string
}): Promise<void> {
  if (!isWhatsAppConfigured()) return
  const { prisma } = await import('./prisma')
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', whatsapp: { not: null } },
    select: { whatsapp: true },
  })
  if (!admins.length) return
  const msg =
    `🏠 *New Inspection Booking*\n\n` +
    `*Ref:* ${data.refNo}\n` +
    `*Client:* ${data.name}\n` +
    `*Phone:* ${data.phone}\n` +
    `*Property:* ${data.propertyName}\n` +
    `*Date:* ${data.date}\n` +
    `*Time:* ${data.time || 'Any time'}\n\n` +
    `View: https://www.rokhaven.com/admin`
  await Promise.allSettled(admins.map(a => sendWhatsAppText(a.whatsapp!, msg)))
}

export async function notifyAdminsNewEnquiry(data: {
  name: string
  phone: string
  email: string
  subject: string
}): Promise<void> {
  if (!isWhatsAppConfigured()) return
  const { prisma } = await import('./prisma')
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', whatsapp: { not: null } },
    select: { whatsapp: true },
  })
  if (!admins.length) return
  const msg =
    `📩 *New Enquiry*\n\n` +
    `*Client:* ${data.name}\n` +
    `*Phone:* ${data.phone}\n` +
    `*Email:* ${data.email}\n` +
    `*Subject:* ${data.subject}\n\n` +
    `View: https://www.rokhaven.com/admin`
  await Promise.allSettled(admins.map(a => sendWhatsAppText(a.whatsapp!, msg)))
}
