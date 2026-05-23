'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import styles from './page.module.css';

interface PropertyInfo {
  name: string;
  price: string;
  location: string;
  image: string;
  tags: string[];
}

const FALLBACK_PROPERTY: PropertyInfo = {
  name: 'RokHaven Property',
  price: '',
  location: 'Lagos, Nigeria',
  image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop',
  tags: [],
};

const TOTAL_STEPS = 12;
const AUTO_DONE = 5;

function pct(step: number) {
  return Math.round(((AUTO_DONE + step) / (AUTO_DONE + TOTAL_STEPS)) * 100);
}

// ── Step tracker items
const USER_STEPS = [
  'Your Name',
  'Email Address',
  'Phone Number',
  'Principal / Agent?',
  'Budget Range',
  'Must-Haves',
  'Timeline',
  'Inspection Date',
  'Best Contact Time',
  'How You Heard',
  'Additional Notes',
  'Acknowledgements',
];

type StepState = 'done' | 'active' | 'upcoming';

function ScheduleInspectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

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
        setProperty({ name: data.title, price: data.price, location: data.location, image, tags });
      })
      .catch(() => { /* keep fallback */ });
  }, [propertyId]);

  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refNum, setRefNum] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [principal, setPrincipal] = useState('yes');
  const [budget, setBudget] = useState('above1b');
  const [mustHaves, setMustHaves] = useState<string[]>([]);
  const [timeline, setTimeline] = useState('1-3m');
  const [inspDate, setInspDate] = useState('');
  const [inspTime, setInspTime] = useState('');
  const [contactTime, setContactTime] = useState('afternoon');
  const [referral, setReferral] = useState('');
  const [notes, setNotes] = useState('');
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<number, string>>({});

  const clearError = (step: number) => setErrors(prev => { const n = {...prev}; delete n[step]; return n; });

  const validate = useCallback((step: number): boolean => {
    if (step === 0) {
      if (!name.trim()) { setErrors(p => ({...p, 0: 'Please enter your full name to continue.'})); return false; }
    }
    if (step === 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErrors(p => ({...p, 1: 'Please enter a valid email address.'})); return false; }
    }
    if (step === 2) {
      if (!phone.trim()) { setErrors(p => ({...p, 2: 'Please enter your phone number.'})); return false; }
    }
    if (step === 7) {
      if (!inspDate) { setErrors(p => ({...p, 7: 'Please select a preferred inspection date.'})); return false; }
    }
    if (step === 11) {
      if (!ack1) { setErrors(p => ({...p, 11: 'Please accept the brokerage acknowledgement to proceed.'})); return false; }
    }
    return true;
  }, [name, email, phone, inspDate, ack1]);

  const handleNext = useCallback(async () => {
    if (!validate(currentStep)) return;
    clearError(currentStep);

    if (currentStep === 11) {
      // Submit
      setSubmitting(true);
      const ref = `RH-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
      try {
        await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name, email, phone, principal, budget, mustHaves,
            timeline, inspDate, inspTime, contactTime, referral, notes,
            propertyId: propertyId || 'arch-residences',
            propertyName: property.name,
            ref,
          }),
        });
      } catch {
        // Continue even if API fails — show confirmation
      }
      setRefNum(ref);
      setShowConfirm(true);
      setSubmitting(false);
      // Redirect to thank-you after brief delay
      setTimeout(() => {
        router.push(`/thank-you?name=${encodeURIComponent(name)}&ref=${encodeURIComponent(ref)}`);
      }, 2200);
      return;
    }

    setCurrentStep(s => s + 1);
  }, [currentStep, validate, name, email, phone, principal, budget, mustHaves, timeline, inspDate, inspTime, contactTime, referral, notes, propertyId, property.name, router]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) return;
    setCurrentStep(s => s - 1);
  }, [currentStep]);

  const toggleMustHave = (v: string) => {
    setMustHaves(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const stepState = (i: number): StepState => {
    if (i < currentStep) return 'done';
    if (i === currentStep) return 'active';
    return 'upcoming';
  };

  // ── Today for date min
  const today = new Date().toISOString().split('T')[0];

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
            <div className={styles.propNote}>These details have been automatically filled in for you.</div>
            <div className={styles.propDivider}></div>

            {/* Step tracker */}
            <div className={styles.stepTrackLbl}>Your Progress</div>
            <div className={styles.stepTrack}>
              {/* Auto-filled steps */}
              {['Property Type', 'Location', 'Bedrooms', 'Transaction Type', 'Property Link'].map(label => (
                <div key={label} className={`${styles.stepItem} ${styles.done}`}>
                  <div className={styles.stepDot}>✓</div>
                  <span className={styles.stepTxt}>{label}</span>
                  <span className={styles.stepAuto}>Auto</span>
                </div>
              ))}
              {/* User steps */}
              {USER_STEPS.map((label, i) => {
                const state = stepState(i);
                return (
                  <div key={i} className={`${styles.stepItem} ${styles[state]}`}>
                    <div className={styles.stepDot}>{state === 'done' ? '✓' : i + 1}</div>
                    <span className={styles.stepTxt}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ── RIGHT: FORM ── */}
        <main className={styles.formCol}>

          {/* Progress bar */}
          <div className={styles.progressWrap}>
            <div className={styles.progressMeta}>
              <span className={styles.progressLbl}>Form Progress</span>
              <span className={styles.progressPct}>
                {showConfirm ? 'Inspection Confirmed ✓' : currentStep === 0 ? 'Starting — 5 fields auto-completed' : `${pct(currentStep)}% complete`}
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${showConfirm ? 100 : pct(currentStep)}%` }}
              />
            </div>
          </div>

          {!showConfirm ? (
            <div className={styles.formCard}>

              {/* ═══ STEP 0: Name ═══ */}
              {currentStep === 0 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Almost Done — 5 Fields Pre-Filled</div>
                  <h1 className={styles.formH}>Let&apos;s Get You<br/>Started</h1>
                  <p className={styles.formSub}>Tell us a little about yourself and we&apos;ll arrange everything.</p>
                  <div className={styles.formSmart}>
                    <strong>Smart Fill Active —</strong> Since you&apos;re enquiring about a specific property, we&apos;ve already captured the property type, location, bedrooms, transaction type, and URL. You only need to answer a few short questions.
                  </div>
                  <div className={styles.fq}>
                    <label className={styles.fqLbl} htmlFor="f0">What is your full name?</label>
                    <input
                      className={`${styles.fqInput}${errors[0] ? ' ' + styles.fqInputErr : ''}`}
                      id="f0"
                      type="text"
                      placeholder="e.g. Adaeze Okonkwo"
                      autoComplete="name"
                      value={name}
                      onChange={e => { setName(e.target.value); clearError(0); }}
                    />
                    {errors[0] && <div className={`${styles.errMsg} ${styles.errMsgShow}`}>{errors[0]}</div>}
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 1: Email ═══ */}
              {currentStep === 1 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 1 of 12</div>
                  <h2 className={styles.formH}>Your Email Address</h2>
                  <p className={styles.formSub}>We&apos;ll send your inspection confirmation here.</p>
                  <div className={styles.fq}>
                    <label className={styles.fqLbl} htmlFor="f1">Email</label>
                    <input
                      className={`${styles.fqInput}${errors[1] ? ' ' + styles.fqInputErr : ''}`}
                      id="f1"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); clearError(1); }}
                    />
                    {errors[1] && <div className={`${styles.errMsg} ${styles.errMsgShow}`}>{errors[1]}</div>}
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 2: Phone ═══ */}
              {currentStep === 2 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 2 of 12</div>
                  <h2 className={styles.formH}>Phone Number</h2>
                  <p className={styles.formSub}>Our team will reach out to confirm your inspection details.</p>
                  <div className={styles.fq}>
                    <label className={styles.fqLbl} htmlFor="f2">Mobile Number</label>
                    <div className={styles.phoneWrap}>
                      <div className={styles.phonePrefix}>+234</div>
                      <input
                        className={`${styles.fqInput} ${styles.phoneInput}${errors[2] ? ' ' + styles.fqInputErr : ''}`}
                        id="f2"
                        type="tel"
                        placeholder="080 — — — — —"
                        autoComplete="tel"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); clearError(2); }}
                      />
                    </div>
                    {errors[2] && <div className={`${styles.errMsg} ${styles.errMsgShow}`}>{errors[2]}</div>}
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 3: Principal? ═══ */}
              {currentStep === 3 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 3 of 12</div>
                  <h2 className={styles.formH}>Are you the principal buyer?</h2>
                  <p className={styles.formSub}>This helps us prepare the right team for your inspection.</p>
                  <div className={styles.fq}>
                    <div className={styles.pillOpts}>
                      {[
                        { v: 'yes', l: 'Yes, for myself or my family' },
                        { v: 'investment', l: 'Investment purchase' },
                        { v: 'agent', l: "I am a buyer's agent" },
                      ].map(opt => (
                        <div
                          key={opt.v}
                          className={`${styles.popt}${principal === opt.v ? ' ' + styles.poptOn : ''}`}
                          onClick={() => setPrincipal(opt.v)}
                        >
                          {opt.l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 4: Budget ═══ */}
              {currentStep === 4 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 4 of 12</div>
                  <h2 className={styles.formH}>What is your budget range?</h2>
                  <p className={styles.formSub}>This is strictly confidential and helps us tailor the right options.</p>
                  <div className={styles.fq}>
                    <label className={styles.fqLbl}>Budget Range (₦)</label>
                    <div className={styles.pillOpts}>
                      {[
                        { v: 'sub100m', l: 'Under ₦100M' },
                        { v: '100-300m', l: '₦100M – ₦300M' },
                        { v: '300-700m', l: '₦300M – ₦700M' },
                        { v: '700m-1b', l: '₦700M – ₦1B' },
                        { v: 'above1b', l: 'Above ₦1B' },
                      ].map(opt => (
                        <div
                          key={opt.v}
                          className={`${styles.popt}${budget === opt.v ? ' ' + styles.poptOn : ''}`}
                          onClick={() => setBudget(opt.v)}
                        >
                          {opt.l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 5: Must-haves ═══ */}
              {currentStep === 5 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 5 of 12</div>
                  <h2 className={styles.formH}>Any must-haves?</h2>
                  <p className={styles.formSub}>Select everything that matters to you. We use this to ensure the property is the right fit.</p>
                  <div className={styles.fq}>
                    <div className={styles.pillOpts} style={{ gap: '10px' }}>
                      {[
                        { v: 'pool', l: 'Swimming Pool' },
                        { v: 'gen', l: 'Generator' },
                        { v: 'bq', l: 'BQ / Staff Quarters' },
                        { v: 'gym', l: 'Gym' },
                        { v: 'sec', l: '24/7 Security' },
                        { v: 'smart', l: 'Smart Home' },
                        { v: 'park', l: 'Parking (4+ cars)' },
                        { v: 'view', l: 'Water / Lagoon View' },
                        { v: 'theatre', l: 'Home Theatre' },
                        { v: 'garden', l: 'Landscaped Garden' },
                      ].map(opt => (
                        <div
                          key={opt.v}
                          className={`${styles.popt}${mustHaves.includes(opt.v) ? ' ' + styles.poptOn : ''}`}
                          onClick={() => toggleMustHave(opt.v)}
                        >
                          {opt.l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 6: Timeline ═══ */}
              {currentStep === 6 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 6 of 12</div>
                  <h2 className={styles.formH}>What is your purchase timeline?</h2>
                  <p className={styles.formSub}>This helps us prioritise your inspection and paperwork accordingly.</p>
                  <div className={styles.fq}>
                    <div className={styles.pillOpts}>
                      {[
                        { v: 'asap', l: 'As soon as possible' },
                        { v: '1-3m', l: 'Within 1–3 months' },
                        { v: '3-6m', l: '3–6 months' },
                        { v: '6-12m', l: '6–12 months' },
                        { v: 'just-looking', l: 'Just exploring for now' },
                      ].map(opt => (
                        <div
                          key={opt.v}
                          className={`${styles.popt}${timeline === opt.v ? ' ' + styles.poptOn : ''}`}
                          onClick={() => setTimeline(opt.v)}
                        >
                          {opt.l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 7: Inspection date ═══ */}
              {currentStep === 7 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 7 of 12</div>
                  <h2 className={styles.formH}>Preferred Inspection Date</h2>
                  <p className={styles.formSub}>Our team will confirm availability and reach out within 24 hours.</p>
                  <div className={styles.fq}>
                    <div className={styles.dtRow}>
                      <div>
                        <label className={styles.fqLbl}>Date</label>
                        <input
                          className={styles.fqDate}
                          type="date"
                          min={today}
                          value={inspDate}
                          onChange={e => { setInspDate(e.target.value); clearError(7); }}
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
                          <option>Morning (9am – 12pm)</option>
                          <option>Midday (12pm – 2pm)</option>
                          <option>Afternoon (2pm – 5pm)</option>
                          <option>Evening (5pm – 7pm)</option>
                        </select>
                      </div>
                    </div>
                    {errors[7] && <div className={`${styles.errMsg} ${styles.errMsgShow}`}>{errors[7]}</div>}
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 8: Best contact time ═══ */}
              {currentStep === 8 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 8 of 12</div>
                  <h2 className={styles.formH}>Best time to reach you?</h2>
                  <p className={styles.formSub}>Our team will call to confirm your inspection details.</p>
                  <div className={styles.fq}>
                    <div className={styles.pillOpts}>
                      {[
                        { v: 'morning', l: 'Morning (8am – 12pm)' },
                        { v: 'afternoon', l: 'Afternoon (12pm – 5pm)' },
                        { v: 'evening', l: 'Evening (5pm – 8pm)' },
                        { v: 'anytime', l: 'Any time' },
                      ].map(opt => (
                        <div
                          key={opt.v}
                          className={`${styles.popt}${contactTime === opt.v ? ' ' + styles.poptOn : ''}`}
                          onClick={() => setContactTime(opt.v)}
                        >
                          {opt.l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 9: How you heard ═══ */}
              {currentStep === 9 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 9 of 12</div>
                  <h2 className={styles.formH}>How did you hear about RokHaven?</h2>
                  <p className={styles.formSub}>This is optional but helps us understand how to best serve our clients.</p>
                  <div className={styles.fq}>
                    <div className={styles.pillOpts}>
                      {[
                        { v: 'instagram', l: 'Instagram' },
                        { v: 'google', l: 'Google Search' },
                        { v: 'referral', l: 'Friend / Referral' },
                        { v: 'agent', l: 'Through an Agent' },
                        { v: 'linkedin', l: 'LinkedIn' },
                        { v: 'twitter', l: 'X / Twitter' },
                        { v: 'other', l: 'Other' },
                      ].map(opt => (
                        <div
                          key={opt.v}
                          className={`${styles.popt}${referral === opt.v ? ' ' + styles.poptOn : ''}`}
                          onClick={() => setReferral(opt.v)}
                        >
                          {opt.l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 10: Notes ═══ */}
              {currentStep === 10 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 10 of 12</div>
                  <h2 className={styles.formH}>Anything else we should know?</h2>
                  <p className={styles.formSub}>Any specific questions, concerns, or details you&apos;d like our team to be aware of.</p>
                  <div className={styles.fq}>
                    <label className={styles.fqLbl}>Additional Notes (optional)</label>
                    <textarea
                      className={styles.fqTextarea}
                      placeholder="e.g. I'm particularly interested in the first-floor master suite. I'd also like to discuss flexible payment terms…"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
                    <button className={styles.btnNext} onClick={handleNext}>Continue →</button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 11: Acknowledgements ═══ */}
              {currentStep === 11 && (
                <div className={styles.stepPaneVisible}>
                  <div className={styles.formEyebrow}>Step 11 of 12 — Final Step</div>
                  <h2 className={styles.formH}>Before We Confirm</h2>
                  <p className={styles.formSub}>Please read and acknowledge the following before we schedule your inspection.</p>
                  <div className={styles.fq}>
                    <div className={styles.ackGroup}>
                      <label
                        className={`${styles.checkItem}${ack1 ? ' ' + styles.checkItemOn : ''}`}
                        onClick={() => setAck1(v => !v)}
                      >
                        <div className={styles.chkBox}>{ack1 && <span>✓</span>}</div>
                        <span className={styles.chkTxt}>I understand that RokHaven Realty is a professional real estate agency. By scheduling this inspection, I agree to pay the applicable brokerage / professional service fee upon a successful transaction.</span>
                      </label>
                      <label
                        className={`${styles.checkItem}${ack2 ? ' ' + styles.checkItemOn : ''}`}
                        onClick={() => setAck2(v => !v)}
                      >
                        <div className={styles.chkBox}>{ack2 && <span>✓</span>}</div>
                        <span className={styles.chkTxt}>I consent to RokHaven Realty contacting me via phone and email regarding this and similar property enquiries.</span>
                      </label>
                      {errors[11] && <div className={`${styles.errMsg} ${styles.errMsgShow}`}>{errors[11]}</div>}
                    </div>
                  </div>
                  <div className={styles.btnRow}>
                    <button className={styles.btnBack} onClick={handleBack}>← Back</button>
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
            /* ═══ CONFIRMATION SCREEN ═══ */
            <div className={styles.confirmScreen}>
              <div className={styles.confirmIcon}>
                <svg width="28" height="28" fill="none" stroke="var(--gold)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className={styles.confirmH}>Your Inspection<br/>is Confirmed</h2>
              <p className={styles.confirmBody}>
                Thank you, <strong>{name.split(' ')[0]}</strong>. A member of our expert team will reach out within 24 hours to confirm the full details of your inspection at <strong>{property.name}</strong>.
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
