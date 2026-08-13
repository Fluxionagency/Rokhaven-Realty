import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const normalised = email.toLowerCase().trim()
    const expectedRole = role || 'CLIENT'

    const user = await prisma.user.findUnique({ where: { email: normalised } })

    if (user && (user.role === expectedRole || user.role === 'ADMIN')) {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const codeHash = await bcrypt.hash(code, 10)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

      await prisma.otpToken.create({ data: { email: normalised, codeHash, expiresAt } })
      await sendOtpEmail(normalised, user.name, code).catch(console.error)
    }

    // Always return ok — never reveal whether email exists
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('OTP send error:', error)
    return NextResponse.json({ ok: true })
  }
}
