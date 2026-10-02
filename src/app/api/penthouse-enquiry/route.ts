import { NextRequest, NextResponse } from 'next/server';

const LB_BASE = 'https://www.leadboard.ng/api/v1/f';

function lbUrl(formKey: string) {
  return `${LB_BASE}/${formKey}`;
}

// GET — returns lb_ts for the client to store on page load
export async function GET(req: NextRequest) {
  const formKey = req.nextUrl.searchParams.get('formKey') ?? '';
  if (!formKey) return NextResponse.json({ lb_ts: '' });
  try {
    const res = await fetch(lbUrl(formKey), { method: 'GET', cache: 'no-store' });
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
    const formKey: string = body.formKey ?? '';
    if (!formKey) {
      return NextResponse.json({ ok: false, error: 'Missing formKey' }, { status: 400 });
    }

    // Build JSON payload for Leadboard
    const payload: Record<string, string> = {
      full_name: body.full_name ?? '',
      email: body.email ?? '',
      whatsapp: body.whatsapp ?? '',
      country: body.country ?? '',
      timeline: body.timeline ?? '',
      property: body.property ?? '',
      lb_351fd309: '', // honeypot — must be empty
    };
    if (body.buying_goal)        payload.buying_goal = body.buying_goal;
    if (body.payment_preference) payload.payment_preference = body.payment_preference;
    if (body.call_type)          payload.call_type = body.call_type;
    if (body.lb_ts)              payload.lb_ts = body.lb_ts;

    // UTM passthrough
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      if (body[k]) payload[k] = body[k];
    }

    const lbRes = await fetch(lbUrl(formKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
