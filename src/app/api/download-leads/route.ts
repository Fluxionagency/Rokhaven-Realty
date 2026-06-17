import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { autoCreateProfile } from '@/lib/autoProfile';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { firstName, lastName, email, phone } = body;
  if (!firstName || !lastName || !email || !phone) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const lead = await prisma.downloadLead.create({ data: { firstName, lastName, email, phone } });

  // Create a CLIENT account (if not already existing) and email the login credentials
  await autoCreateProfile(email, `${firstName} ${lastName}`, phone, 'CLIENT');

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}

export async function GET() {
  const leads = await prisma.downloadLead.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(leads);
}
