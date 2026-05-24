import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST() {
  try {
    const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (existing) {
      return NextResponse.json({ error: 'Admin account already exists' }, { status: 409 })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.user.create({
      data: {
        email: 'info@rokhaven.com',
        name: 'RokHaven Admin',
        role: 'ADMIN',
        passwordHash: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    })

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'RokHaven Realty <noreply@rokhaven.com>',
      to: 'info@rokhaven.com',
      subject: 'Set Your RokHaven Admin Password',
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#060F1C;color:#f4ede0;padding:40px 32px;">
          <div style="margin-bottom:28px;">
            <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#C0A870;">ROKHAVEN</span>
            <span style="font-size:11px;letter-spacing:3px;color:rgba(192,168,112,.5);margin-left:8px;">REALTY</span>
          </div>
          <h1 style="font-size:24px;font-weight:400;margin:0 0 12px;">Set Your Admin Password</h1>
          <p style="color:rgba(244,237,224,.7);line-height:1.7;margin:0 0 28px;">
            Click the button below to set your admin password. This link expires in 24 hours.
          </p>
          <a href="https://rokhaven.com/auth/set-password?token=${token}"
             style="display:inline-block;background:#C0A870;color:#060F1C;padding:14px 28px;text-decoration:none;font-size:14px;letter-spacing:1px;font-family:Georgia,serif;">
            SET MY PASSWORD →
          </a>
          <p style="color:rgba(244,237,224,.4);font-size:12px;margin-top:28px;">
            If you did not request this, ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
