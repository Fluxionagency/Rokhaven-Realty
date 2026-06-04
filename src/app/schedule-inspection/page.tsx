'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import styles from './page.module.css';

interface PropertyInfo {
  name: string;
  price: string;
  location: string;
  image: string;
  tags: string[];
  category: string;
}

const FALLBACK_PROPERTY: PropertyInfo = {
  name: 'RokHaven Property',
  price: '',
  location: 'Lagos, Nigeria',
  image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop',
  tags: [],
  category: '',
};

function ScheduleInspectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [property, setProperty] = useState<PropertyInfo>(FALLBACK_PROPERTY);

  useEffect(() => {
    if (!propertyId) return;
    fetch(`/api/properties/${propertyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.error) return;
        let image = FALLBACK_PROPERTY.image;
        try {
          const imgs = JSON.parse(data.images);
          if (Array.isArray(imgs) && imgs[0]) image = imgs[0];
        } catch { /* use fallback */ }
        const tags: string[] = [];
        if (data.bedrooms) tags.push(`${data.bedrooms} Bedroom${data.bedrooms !== 1 ? 's' : ''}`);
        if (data.type) tags.push(data.type);
        if (data.category === 'SALE') tags.push('For Sale');
        else if (data.category === 'RENT') tags.push('For Rent');
        else if (data.category === 'SHORTLET') tags.push('Shortlet');
        if (data.neighbourhood || data.location) tags.push(data.neighbourhood || data.location.split(',')[0]);
        setProperty({ name: data.title, price: data.price, location: data.location, image, tags, category: data.category || '' });
      })
      .catch(() => { /* keep fallback */ });
  }, [propertyId]);

  // Form state
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inspDate, setInspDate] = useState('');
  const [inspTime, setInspTime] = useState('');
  const [ack, setAck] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [refNum, setRefNum] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Steps: logged in = [datetime, confirm], guest = [contact, datetime, confirm]
  const totalSteps = isLoggedIn ? 2 : 3;
  const pct = Math.round(((step + 1) / totalSteps) * 100);

  // For logged in users: step 0 = datetime, step 1 = confirm
  // For guests: step 0 = contact info, step 1 = datetime, step 2 = confirm
  const datetimeStep = isLoggedIn ? 0 : 1;
  const confirmStep = isLoggedIn ? 1 : 2;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!isLoggedIn && step === 0) {
      if (!name.trim()) errs.name = 'Please enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Please enter a valid email address.';
      if (!phone.trim()) errs.phone = 'Please enter your phone number.';
    }
    if (step === datetimeStep) {
      if (!inspDate) errs.date = 'Please select a preferred inspection date.';
    }
    if (step === confirmStep) {
      if (!ack) errs.ack = 'Please accept the acknowledgement to confirm your inspection.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleNext() {
    if (!validate()) return;
    if (step < confirmStep) {
      setStep(s => s + 1);
      return;
    }
    // Submit
    setSubmitting(true);
    const ref = `RH-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
    const submitterName = isLoggedIn ? (session?.user?.name || '') : name;
    const submitterEmail = isLoggedIn ? (session?.user?.email || '') : email;
    try {
      await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: submitterName, email: submitterEmail, phone,
          inspDate, inspTime,
          propertyId: propertyId || '',
          propertyName: property.name,
          ref,
        }),
      });
    } catch { /* show confirmation anyway */ }
    setRefNum(ref);
    setShowConfirm(true);
    setSubmitting(false);
    setTimeout(() => {
      router.push(`/thank-you?name=${encodeURIComponent(submitterName)}&ref=${encodeURIComponent(ref)}`);
    }, 2200);
  }

  return (
    <>
      <Nav />
      <div className={styles.shell}>

        {/* ── LEFT: PROPERTY CARD ── */}
        <aside className={styles.propCol}>
          <div className={styles.propThumb}>
            <img src={property.image} alt={property.name} />
          </div>
          <div className={styles.propInner}>
            <div className={styles.propEnquiryLbl}>You Are Enquiring About</div>
            <div className={styles.propName}>{property.name}</div>
            <div className={styles.propPrice}>{property.price}</div>
            <div className={styles.propLoc}>
              <svg width="10" height="13" viewBox="0 0 12 15" fill="rgba(192,168,112,.5)">
                <path d="M6 0C2.686 0 0 2.686 0 6c0 4.5 6 9 6 9s6-4.5 6-9c0-3.314-2.686-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
              </svg>
              {property.location}
            </div>
            <div className={styles.propTags}>
              {property.tags.map(tag => (
                <span key={tag} className={styles.ptag}>{tag}</span>
              ))}
            </div>
            {isLoggedIn && (
              <div className={styles.propNote}>
                Logged in as <strong>{session?.user?.name || session?.user?.email}</strong>. Your details are pre-filled.
              </div>
            )}
          </div>
        </aside>

        {/* ── RIGHT: FORM ── */}
        <main className={styles.formCol}>

          {/* Progress bar */}
          <div className={styles.progressWrap}>
            <div className={styles.progressMeta}>
              <span className={styles.progressLbl}>Form Progress</span>
              <span className={styles.progressPct}>
                {showConfirm ? 'Inspection Confirmed ✓' : `${pct}% complete`}
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${showConfirm ? 100 : pct}%` }} />
            </div>
          </div>

          {!showConfirm ? (
            <div className={styles.formCard}>

              {/* ═══ GUEST ONLY: Contact Info ═══ */}
              {!isLoggedIn && step === 0 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 1 of 3</div>
                  <h1 className={styles.formH}>Your Details</h1>
                  <p className={styles.formSub}>We just need a few details to confirm your inspection. A secure client portal will be created for you automatically so you can track your bookings.</p>
                  <div className={styles.fq}>
                    <label className={styles.fqLbl}>Full Name</label>
                    <input
                      className={`${styles.fqInput}${errors.name ? ' ' + styles.fqInputErr : ''}`}
                      type="text"
                      placeholder="e.g. Adaeze Okonkwo"
                      autoComplete="name"
                      value={name}
                      onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ''})); }}
                    />
                    {errors.name && <div className={`${styles.errMsg} ${styles.errMsgShow}`}>{errors.name}</div>}
                  </div>
                  <div className={styles.fq}>
                    <label className={styles.fqLbl}>Email Address</label>
                    <input
                      className={`${styles.fqInput}${errors.email ? ' ' + styles.fqInputErr : ''}`}
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }}
                    />
                    {errors.email && <div className={`${styles.errMsg} ${styles.errMsgShow}`}>{errors.email}</div>}
                  </div>
                  <div className={styles.fq}>
                    <label className={styles.fqLbl}>Phone Number</label>
                    <div className={styles.phoneWrap}>
                      <div className={styles.phonePrefix}>+234</div>
                      <input
                        className={`${styles.fqInput} ${styles.phoneInput}${errors.phone ? ' ' + styles.fqInputErr : ''}`}
                        type="tel"
                        placeholder="080 — — — — —"
                        autoComplete="tel"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); setErrors(p => ({...p, phone: ''})); }}
                      />
                    </div>
                    {errors.phone && <div className={`${styles.errMsg} ${styles.errMsgShow}`}>{errors.phone}</div>}
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ Date & Time ═══ */}
              {step === datetimeStep && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step {datetimeStep + 1} of {totalSteps}</div>
                  <h2 className={styles.formH}>Pick a Date & Time</h2>
                  <p className={styles.formSub}>Choose your preferred inspection slot. Our team will confirm within 24 hours.</p>
                  <div className={styles.fq}>
                    <div className={styles.dtRow}>
                      <div>
                        <label className={styles.fqLbl}>Date</label>
                        <input
                          className={styles.fqDate}
                          type="date"
                          min={today}
                          value={inspDate}
                          onChange={e => { setInspDate(e.target.value); setErrors(p => ({...p, date: ''})); }}
                        />
                      </div>
                      <div>
                        <label className={styles.fqLbl}>Preferred Time</label>
                        <select
                          className={styles.fqSelect}
                          value={inspTime}
                          onChange={e => setInspTime(e.target.value)}
                        >
                          <option value="">Any time</option>
                          {Array.from({ length: 19 }, (_, i) => {
                            const totalMins = 9 * 60 + i * 30;
                            const h = Math.floor(totalMins / 60);
                            const m = totalMins % 60;
                            const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                            return <option key={label} value={label}>{label}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                    {errors.date && <div className={`${styles.errMsg} ${styles.errMsgShow}`}>{errors.date}</div>}
                  </div>
                  <div className={styles.btnRow}>
                    {step > 0 && <button className={styles.btnBack} onClick={() => setStep(s => s - 1)}>← Back</button>}
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ Confirm ═══ */}
              {step === confirmStep && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Final Step</div>
                  <h2 className={styles.formH}>Confirm Your Inspection</h2>
                  <p className={styles.formSub}>
                    {isLoggedIn ? `${session?.user?.name || 'You'} — ` : `${name} — `}
                    {inspDate} {inspTime && `· ${inspTime}`}
                  </p>
                  <div className={styles.fq}>
                    <div className={styles.ackGroup}>
                      <label
                        className={`${styles.checkItem}${ack ? ' ' + styles.checkItemOn : ''}`}
                        onClick={() => { setAck(v => !v); setErrors(p => ({...p, ack: ''})); }}
                      >
                        <div className={styles.chkBox}>{ack && <span>✓</span>}</div>
                        <span className={styles.chkTxt}>I understand that RokHaven Realty is a professional real estate agency. By scheduling this inspection, I agree to pay the applicable brokerage / professional service fee upon a successful transaction.</span>
                      </label>
                      {errors.ack && <div className={`${styles.errMsg} ${styles.errMsgShow}`}>{errors.ack}</div>}
                    </div>
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={() => setStep(s => s - 1)}>← Back</button>
                    <button
                      className={styles.btnNext}
                      onClick={handleNext}
                      disabled={submitting}
                      style={{ background: 'var(--gold)' }}
                    >
                      {submitting ? 'Confirming…' : 'Confirm Inspection ✓'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className={styles.confirmScreen}>
              <div className={styles.confirmIcon}>
                <svg width="28" height="28" fill="none" stroke="var(--gold)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className={styles.confirmH}>Your Inspection<br/>is Confirmed</h2>
              <p className={styles.confirmBody}>
                Thank you, <strong>{isLoggedIn ? session?.user?.name?.split(' ')[0] : name.split(' ')[0]}</strong>. A member of our expert team will reach out within 24 hours to confirm the full details of your inspection at <strong>{property.name}</strong>.
              </p>
              <div className={styles.confirmRef}>Reference: {refNum}</div>
              <Link href="/listings" className={styles.confirmBtn}>Browse More Properties</Link>
            </div>
          )}

        </main>
      </div>
    </>
  );
}

export default function ScheduleInspectionPage() {
  return (
    <Suspense fallback={<div style={{ background: '#060F1C', minHeight: '100vh' }} />}>
      <ScheduleInspectionContent />
    </Suspense>
  );
}
