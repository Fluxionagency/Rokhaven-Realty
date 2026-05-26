/**
 * GET /api/expertlisting/imports
 * Returns all imported properties + last sync log for the admin UI.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
