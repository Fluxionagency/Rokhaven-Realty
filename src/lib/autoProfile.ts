import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { sendClientWelcome, sendPrincipalWelcome } from './email'

function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function autoCreateProfile(
  email: string,
  name: string,
  phone: string,
  role: 'CLIENT' | 'PRINCIPAL'
): Promise<{ created: boolean; userId: string }> {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return { created: false, userId: existing.id }

  const password = generatePassword()
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      phone: phone || null,
      role,
      passwordHash,
    },
  })

  try {
    if (role === 'PRINCIPAL') {
      await sendPrincipalWelcome(email, name, password)
    } else {
      await sendClientWelcome(email, name, password)
    }
  } catch (err) {
    console.error('Welcome email failed:', err)
    // Profile was created — don't fail the request over email
  }

  return { created: true, userId: user.id }
}
