import { NextRequest, NextResponse } from 'next/server';

const LB_ENDPOINT = 'https://www.leadboard.ng/api/v1/f/lbf_8f7c8e5ada8e79cbc992bf6147e5752f';

// GET — returns lb_ts for the client to store on page load
export async function GET() {
  try {
    const res = await fetch(LB_ENDPOINT, { method: 'GET', cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ lb_ts: '' });
    const data = await res.json();
    const tsField = data?.schema?.find((f: { name: string }) => f.name === 'lb_ts');
    return NextResponse.json({ lb_ts: tsField?.value ?? '' });
  } catch {
    return NextResponse.json({ lb_ts: '' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Build FormData for Leadboard
    const fd = new FormData();
    fd.append('full_name', body.full_name ?? '');
    fd.append('email', body.email ?? '');
    fd.append('whatsapp', body.whatsapp ?? '');
    fd.append('country', body.country ?? '');
    fd.append('timeline', body.timeline ?? '');
    fd.append('property', body.property ?? '');
    if (body.buying_goal)        fd.append('buying_goal', body.buying_goal);
    if (body.payment_preference) fd.append('payment_preference', body.payment_preference);
    if (body.call_type)          fd.append('call_type', body.call_type);
    // lb_ts comes from the client (fetched on page load for correct timing)
    if (body.lb_ts)              fd.append('lb_ts', body.lb_ts);
    fd.append('lb_351fd309', ''); // honeypot — must be empty

    // UTM passthrough
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      if (body[k]) fd.append(k, body[k]);
    }

    const lbRes = await fetch(LB_ENDPOINT, { method: 'POST', body: fd });
    const lbText = await lbRes.text();

    let lbData: unknown = {};
    try { lbData = JSON.parse(lbText); } catch { /* non-JSON response */ }

    if (!lbRes.ok) {
      console.error('[penthouse-enquiry] Leadboard error', lbRes.status, lbText);
      return NextResponse.json(
        { ok: false, error: `Leadboard returned ${lbRes.status}`, detail: lbText },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, data: lbData });
  } catch (err) {
    console.error('[penthouse-enquiry] unexpected error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
