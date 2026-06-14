import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { firstName, lastName, email, phone } = body;
  if (!firstName || !lastName || !email || !phone) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }
  const lead = await prisma.downloadLead.create({ data: { firstName, lastName, email, phone } });
  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}

export async function GET() {
  const leads = await prisma.downloadLead.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(leads);
}
