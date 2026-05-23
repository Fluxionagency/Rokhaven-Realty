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
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email.toLowerCase()
        const expectedRole = credentials.role || 'CLIENT'

        // Hardcoded test accounts (work without a database)
        const testAccounts: Record<string, { name: string; role: string; password: string }> = {
          'client@rokhaven.com':    { name: 'Test Client',    role: 'CLIENT',    password: 'client123' },
          'principal@rokhaven.com': { name: 'Test Principal', role: 'PRINCIPAL', password: 'principal123' },
        }
        const test = testAccounts[email]
        if (test && credentials.password === test.password) {
          if (test.role === expectedRole || expectedRole === 'CLIENT') {
            return { id: 'test-' + test.role.toLowerCase(), email, name: test.name, role: test.role }
          }
        }

        // Database lookup
        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) return null
          if (user.role !== expectedRole && user.role !== 'ADMIN') return null
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
