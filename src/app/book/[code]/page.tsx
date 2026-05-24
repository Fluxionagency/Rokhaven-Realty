'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface BookProperty {
  id: string;
  title: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  images: string;
  price: string;
}

interface BookLink {
  id: string;
  code: string;
  propertyId: string | null;
  clientName: string | null;
  clientPhone: string | null;
  note: string | null;
  expiresAt: string;
}

function firstImage(images: string): string {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr[0]
      ? arr[0] + '?w=800&q=80&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop';
  } catch {
    return 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop';
  }
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0B1B35', fontFamily: "'DM Sans', sans-serif", color: 'rgba(244,237,224,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  header: { width: '100%', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(192,168,112,0.08)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  wm: { fontFamily: "'DM Serif Display', serif", fontSize: 16, color: '#C0A870', letterSpacing: '0.18em' },
  sm: { fontSize: 9, color: 'rgba(192,168,112,0.5)', letterSpacing: '0.3em', marginTop: -2 },
  wrap: { width: '100%', maxWidth: 680, padding: '48px 24px 80px' },
  err: { textAlign: 'center' as const, padding: '80px 24px' },
  errH: { fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#C0A870', marginBottom: 12 },
  errP: { color: 'rgba(244,237,224,0.4)', fontSize: 14, lineHeight: 1.6 },
  propCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(192,168,112,0.12)', borderRadius: 4, overflow: 'hidden', marginBottom: 36 },
  propImg: { width: '100%', height: 200, objectFit: 'cover' as const },
  propBody: { padding: '18px 20px' },
  propTag: { fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,0.55)', letterSpacing: '0.3em', textTransform: 'uppercase' as const, marginBottom: 6 },
  propName: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#F4EDE0', marginBottom: 4 },
  propMeta: { fontSize: 12, color: 'rgba(244,237,224,0.35)' },
  h: { fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#F4EDE0', marginBottom: 8 },
  sub: { fontSize: 13, color: 'rgba(244,237,224,0.38)', marginBottom: 32, lineHeight: 1.6 },
  note: { background: 'rgba(192,168,112,0.06)', border: '1px solid rgba(192,168,112,0.15)', borderRadius: 3, padding: '14px 16px', marginBottom: 28, fontSize: 13, color: 'rgba(244,237,224,0.55)', lineHeight: 1.6 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  fg: { marginBottom: 16 },
  lbl: { display: 'block', fontSize: 10, fontWeight: 500, color: 'rgba(192,168,112,0.5)', letterSpacing: '0.25em', textTransform: 'uppercase' as const, marginBottom: 7 },
  fi: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,168,112,0.15)', borderRadius: 2, padding: '11px 14px', fontSize: 14, color: '#F4EDE0', outline: 'none', boxSizing: 'border-box' as const },
  fsel: { width: '100%', background: 'rgba(11,27,53,0.95)', border: '1px solid rgba(192,168,112,0.15)', borderRadius: 2, padding: '11px 14px', fontSize: 14, color: '#F4EDE0', outline: 'none', boxSizing: 'border-box' as const },
  fta: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,168,112,0.15)', borderRadius: 2, padding: '11px 14px', fontSize: 14, color: '#F4EDE0', outline: 'none', boxSizing: 'border-box' as const, minHeight: 90, resize: 'vertical' as const },
  btn: { width: '100%', background: '#C0A870', color: '#060F1C', border: 'none', borderRadius: 2, padding: '15px 24px', fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', cursor: 'pointer', marginTop: 8 },
  btnDis: { opacity: 0.5, cursor: 'not-allowed' },
  disc: { fontSize: 11, color: 'rgba(244,237,224,0.22)', marginTop: 12, lineHeight: 1.6, textAlign: 'center' as const },
  success: { textAlign: 'center' as const, padding: '48px 24px' },
  ring: { width: 64, height: 64, borderRadius: '50%', border: '1.5px solid rgba(192,168,112,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  ssH: { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#F4EDE0', marginBottom: 10 },
  ssP: { fontSize: 13, color: 'rgba(244,237,224,0.4)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 28px' },
  ssLink: { color: '#C0A870', fontSize: 13, textDecoration: 'none' },
};

export default function BookPage() {
  const params = useParams();
  const code = params?.code as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [link, setLink] = useState<BookLink | null>(null);
  const [property, setProperty] = useState<BookProperty | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/book/${code}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setLink(data.link);
        setProperty(data.property || null);
        if (data.link?.clientName) setName(data.link.clientName);
        if (data.link?.clientPhone) setPhone(data.link.clientPhone);
      })
      .catch(() => setError('Failed to load booking link'))
      .finally(() => setLoading(false));
  }, [code]);

  const handleSubmit = async () => {
    if (!name || !email || !phone || !date || !time) {
      alert('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      if (property?.id) {
        await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: property.id,
            clientName: name,
            clientEmail: email,
            clientPhone: phone,
            inspDate: date,
            inspTime: time,
            notes,
            bookingLinkCode: code,
          }),
        });
      } else {
        await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            notes: `[Booking Link: ${code}] Preferred: ${date} at ${time}. ${notes}`.trim(),
          }),
        });
      }
      setSubmitted(true);
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <Link href="/" style={s.logo}>
          <svg width="22" height="22" viewBox="0 0 60 60" fill="#C0A870">
            <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
          </svg>
          <div>
            <div style={s.wm}>ROKHAVEN</div>
            <div style={s.sm}>REALTY</div>
          </div>
        </Link>
      </div>

      <div style={s.wrap}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(244,237,224,0.3)', fontSize: 13 }}>
            Loading…
          </div>
        )}

        {!loading && error && (
          <div style={s.err}>
            <div style={s.errH}>Link Unavailable</div>
            <p style={s.errP}>{error}</p>
            <p style={{ ...s.errP, marginTop: 20 }}>
              <Link href="/" style={{ color: '#C0A870', fontSize: 13 }}>Return to RokHaven →</Link>
            </p>
          </div>
        )}

        {!loading && !error && link && !submitted && (
          <>
            {property && (
              <div style={s.propCard}>
                <img src={firstImage(property.images)} alt={property.title} style={s.propImg} />
                <div style={s.propBody}>
                  <div style={s.propTag}>Property</div>
                  <div style={s.propName}>{property.title}</div>
                  <div style={s.propMeta}>
                    {property.location} · {property.bedrooms} Beds · {property.bathrooms} Baths
                    {property.price && ` · ${property.price}`}
                  </div>
                </div>
              </div>
            )}

            <div style={s.h}>{property ? 'Schedule Your Inspection' : 'Book an Inspection'}</div>
            <p style={s.sub}>
              Complete the form below to confirm your inspection time. A member of the RokHaven team will follow up to confirm your booking.
            </p>

            {link.note && (
              <div style={s.note}>
                <strong style={{ color: 'rgba(192,168,112,0.7)' }}>Note from RokHaven:</strong>{' '}
                {link.note}
              </div>
            )}

            <div style={s.grid2}>
              <div style={s.fg}>
                <label style={s.lbl}>Full Name *</label>
                <input style={s.fi} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div style={s.fg}>
                <label style={s.lbl}>Phone Number *</label>
                <input style={s.fi} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 — — — — —" type="tel" />
              </div>
            </div>

            <div style={s.fg}>
              <label style={s.lbl}>Email Address *</label>
              <input style={s.fi} value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" />
            </div>

            <div style={s.grid2}>
              <div style={s.fg}>
                <label style={s.lbl}>Preferred Date *</label>
                <input style={s.fi} value={date} onChange={e => setDate(e.target.value)} type="date" min={today} />
              </div>
              <div style={s.fg}>
                <label style={s.lbl}>Preferred Time *</label>
                <select style={s.fsel} value={time} onChange={e => setTime(e.target.value)}>
                  <option value="">Select time</option>
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>12:00 PM</option>
                  <option>1:00 PM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                  <option>4:00 PM</option>
                  <option>5:00 PM</option>
                </select>
              </div>
            </div>

            <div style={s.fg}>
              <label style={s.lbl}>Additional Notes — Optional</label>
              <textarea
                style={s.fta}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special requirements, questions, or information for our team…"
              />
            </div>

            <button
              style={{ ...s.btn, ...(submitting ? s.btnDis : {}) }}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting…' : 'Confirm Inspection Request →'}
            </button>
            <p style={s.disc}>
              By submitting, you agree that a RokHaven representative may contact you to confirm your booking.
              Inspections are subject to availability.
            </p>
          </>
        )}

        {submitted && (
          <div style={s.success}>
            <div style={s.ring}>
              <svg width="28" height="28" fill="none">
                <polyline points="6,14 11,19 22,8" stroke="#C0A870" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={s.ssH}>Inspection Request Received</div>
            <p style={s.ssP}>
              Thank you, {name.split(' ')[0]}. Your inspection request has been received and a member of the RokHaven team will confirm your booking shortly.
            </p>
            <Link href="/" style={s.ssLink}>Return to RokHaven →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
