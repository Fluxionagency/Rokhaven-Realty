import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [events, leads] = await Promise.all([
    prisma.downloadEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { download: { select: { title: true, category: true } } },
    }),
    prisma.downloadLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({ events, leads });
}
