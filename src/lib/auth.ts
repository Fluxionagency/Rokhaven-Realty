import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/client-login',
  },
  providers: [
    CredentialsProvider({
      id: 'client-credentials',
      name: 'Client Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        const email = credentials.email.toLowerCase()
        const expectedRole = credentials.role || 'CLIENT'

        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) return null
          if (user.role !== expectedRole && user.role !== 'ADMIN') return null

          // OTP path
          if (credentials.otp) {
            const token = await prisma.otpToken.findFirst({
              where: { email, used: false, expiresAt: { gt: new Date() } },
              orderBy: { createdAt: 'desc' },
            })
            if (!token) return null
            const valid = await bcrypt.compare(credentials.otp, token.codeHash)
            if (!valid) return null
            await prisma.otpToken.update({ where: { id: token.id }, data: { used: true } })
            return { id: user.id, email: user.email, name: user.name, role: user.role }
          }

          // Password path
          if (!credentials.password) return null
          const valid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!valid) return null
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
