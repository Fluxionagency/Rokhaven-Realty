import { NextRequest, NextResponse } from 'next/server';

const LB_FOLLOWUP = 'https://www.leadboard.ng/api/v1/f/lbf_8f7c8e5ada8e79cbc992bf6147e5752f/follow-up';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(LB_FOLLOWUP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return NextResponse.json({ ok: res.ok, status: res.status, body: text });
  } catch (err) {
    console.error('[penthouse-enquiry/follow-up]', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
