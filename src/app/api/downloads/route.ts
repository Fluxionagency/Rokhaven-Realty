import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendDownloadNotification } from '@/lib/email';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const downloads = await prisma.download.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(downloads);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const { title, description, fileUrl, fileName, fileSize, category } = body;
  if (!title || !fileUrl || !fileName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const download = await prisma.download.create({
    data: { title, description, fileUrl, fileName, fileSize: fileSize || null, category: category || null },
  });

  // Notify all CLIENT users in the background
  prisma.user.findMany({ where: { role: 'CLIENT' }, select: { email: true } })
    .then(clients => {
      const emails = clients.map(c => c.email).filter(Boolean);
      if (emails.length) return sendDownloadNotification(emails, { title, description, category });
    })
    .catch(() => { /* don't fail the request if email fails */ });

  return NextResponse.json(download, { status: 201 });
}
