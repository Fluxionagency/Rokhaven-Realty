/**
 * GET /api/expertlisting/imports
 * Returns all imported properties + last sync log for the admin UI.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [imports, logs] = await Promise.all([
    prisma.importedProperty.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.importSyncLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 1,
    }),
  ])

  return NextResponse.json({ imports, lastLog: logs[0] ?? null })
}
