'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './penthouse.module.css';
import type { PenthouseConfig } from '../_config/penthouses';

const ENQUIRY_PROXY = '/api/penthouse-enquiry';
const CAL_EVENT = 'rokhaven-realty/private-call';

type CalFn = ((...args: unknown[]) => void) & {
  ns?: Record<string, (...args: unknown[]) => void>;
};

declare global {
  interface Window {
    Cal?: CalFn;
  }
}

const COUNTRY_CODES = [
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden' },
  { code: '+47',  flag: '🇳🇴', name: 'Norway' },
  { code: '+1-CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
];

function dialToCountry(code: string): string {
  const map: Record<string, string> = {
    '+234': 'Nigeria', '+1': 'United States', '+44': 'United Kingdom',
    '+971': 'UAE', '+966': 'Saudi Arabia', '+974': 'Qatar', '+965': 'Kuwait',
    '+973': 'Bahrain', '+968': 'Oman', '+27': 'South Africa', '+254': 'Kenya',
    '+233': 'Ghana', '+251': 'Ethiopia', '+49': 'Germany', '+33': 'France',
    '+31': 'Netherlands', '+46': 'Sweden', '+47': 'Norway', '+1-CA': 'Canada',
    '+61': 'Australia', '+65': 'Singapore', '+852': 'Hong Kong', '+86': 'China',
    '+91': 'India',
  };
  return map[code] ?? code;
}

interface Props {
  cfg: PenthouseConfig;
}

type Step = 'form' | 'cal';

function EnquiryFunnelInner({ cfg }: Props) {
  const searchParams = useSearchParams();
  const loadedAt = useRef(Date.now());

  const [step, setStep] = useState<Step>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState('+234');
  const [phoneNum, setPhoneNum] = useState('');
  const [timeline, setTimeline] = useState('');
  const [buyingGoal, setBuyingGoal] = useState('');
  const [paymentPref, setPaymentPref] = useState('');
  const [callType, setCallType] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [followUpToken, setFollowUpToken] = useState('');
  const calLoaded = useRef(false);

  const fullPhone = `${dialCode.replace('-CA', '')}${phoneNum.trim()}`;
  const country = dialToCountry(dialCode);

  function validate() {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Please enter your name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!phoneNum.trim()) errs.phone = 'Please enter your phone number.';
    if (!timeline) errs.timeline = 'Please select a timeline.';
    if (!consent) errs.consent = 'Please confirm you have read the privacy notice.';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    setFormError('');

    try {
      // Enforce min 3s timing (Leadboard spam protection)
      const elapsed = (Date.now() - loadedAt.current) / 1000;
      if (elapsed < 3) {
        await new Promise((r) => setTimeout(r, (3 - elapsed) * 1000));
      }

      const utmFields: Record<string, string> = {};
      for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
        const v = searchParams.get(k);
        if (v) utmFields[k] = v;
      }

      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
        whatsapp: fullPhone,
        country,
        timeline,
        property: cfg.productName,
        buying_goal: buyingGoal || undefined,
        payment_preference: paymentPref || undefined,
        call_type: callType || undefined,
        ...utmFields,
      };

      const res = await fetch(ENQUIRY_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Enquiry proxy error', res.status, data);
        throw new Error(`HTTP ${res.status}`);
      }

      if (data?.data?.follow_up_token) setFollowUpToken(data.data.follow_up_token);

      setStep('cal');
    } catch (err) {
      console.error('Form submission error:', err);
      setFormError('Something went wrong. Please try again or call us on +234 916 761 9009.');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (step !== 'cal' || calLoaded.current) return;
    calLoaded.current = true;

    const script = document.createElement('script');
    script.src = 'https://app.cal.com/embed/embed.js';
    script.async = true;
    script.onload = () => {
      if (!window.Cal) return;
      const Cal = window.Cal;
      Cal('init', 'rokhaven', { origin: 'https://cal.com' });
      Cal.ns = Cal.ns || {};
      if (Cal.ns.rokhaven) {
        Cal.ns.rokhaven('inline', {
          elementOrSelector: '#cal-embed',
          calLink: CAL_EVENT,
        });
        Cal.ns.rokhaven('on', {
          action: 'bookingSuccessfulV2',
          callback: async () => {
            if (followUpToken) {
              try {
                await fetch(`${ENQUIRY_PROXY}/follow-up`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: followUpToken, cal_booking: 'completed' }),
                });
              } catch { /* non-fatal */ }
            }
            window.location.href = cfg.thankYou;
          },
        });
      }
    };
    document.head.appendChild(script);
  }, [step, followUpToken, cfg.thankYou]);

  return (
    <section id="enquiry" className={styles.enquiry}>
      <div className={styles.enquiryInner}>
        {step === 'form' ? (
          <>
            <div className={styles.enquiryHead}>
              <p className={styles.enquiryLbl}>SCHEDULE A CALL</p>
              <h2 className={styles.enquiryH2}>Ready to talk?</h2>
              <p className={styles.enquirySubPara}>
                Fill in your details and pick a time that works for you. No sales pressure — just a real conversation.
              </p>
            </div>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <p className={styles.stepLabel}>STEP 1 OF 2 — YOUR DETAILS</p>

              {/* Contact */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Contact information</legend>
                <div className={styles.fieldGrid}>
                  <label className={styles.fieldLabel}>
                    Full name
                    <input
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={errors.fullName ? styles.error : ''}
                    />
                    {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
                  </label>
                  <label className={styles.fieldLabel}>
                    Email address
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? styles.error : ''}
                    />
                    {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                  </label>
                  <div className={styles.fieldLabel}>
                    WhatsApp number
                    <div className={`${styles.phoneRow}${errors.phone ? ' ' + styles.phoneRowError : ''}`}>
                      <select
                        className={styles.dialSelect}
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        autoComplete="tel-country-code"
                        aria-label="Country code"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={`${c.name}-${c.code}`} value={c.code}>
                            {c.flag} {c.code.replace('-CA', '')} {c.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        autoComplete="tel-national"
                        placeholder="800 000 0000"
                        value={phoneNum}
                        onChange={(e) => setPhoneNum(e.target.value)}
                        className={styles.phoneInput}
                        aria-label="Phone number"
                      />
                    </div>
                    {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                  </div>
                </div>
              </fieldset>

              {/* Buying intent */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Your plans</legend>
                <div className={styles.fieldGrid}>
                  <div className={styles.radioGroup}>
                    <p style={{ margin: '0 0 10px', fontWeight: 500, fontSize: 14 }}>Buying timeline</p>
                    <div className={styles.radioOptions}>
                      {[
                        { label: 'Ready now', value: 'now' },
                        { label: 'Within 3 months', value: '3m' },
                        { label: '3–6 months', value: '3-6m' },
                        { label: 'Just exploring', value: 'exploring' },
                      ].map((opt) => (
                        <label key={opt.value} className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="timeline"
                            value={opt.value}
                            checked={timeline === opt.value}
                            onChange={() => setTimeline(opt.value)}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    {errors.timeline && <span className={styles.fieldError}>{errors.timeline}</span>}
                  </div>
                  <div className={styles.radioGroup}>
                    <p style={{ margin: '0 0 10px', fontWeight: 500, fontSize: 14 }}>I&apos;m buying to <span style={{ fontWeight: 300 }}>(optional)</span></p>
                    <div className={styles.radioOptions}>
                      {[
                        { label: 'Live in it', value: 'live' },
                        { label: 'Invest / hold', value: 'invest' },
                        { label: 'Both', value: 'both' },
                      ].map((opt) => (
                        <label key={opt.value} className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="buying_goal"
                            value={opt.value}
                            checked={buyingGoal === opt.value}
                            onChange={() => setBuyingGoal(opt.value)}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.radioGroup}>
                    <p style={{ margin: '0 0 10px', fontWeight: 500, fontSize: 14 }}>Payment preference <span style={{ fontWeight: 300 }}>(optional)</span></p>
                    <div className={styles.radioOptions}>
                      {[
                        { label: 'Outright', value: 'outright' },
                        { label: 'Payment plan', value: 'plan' },
                        { label: 'Not sure yet', value: 'unsure' },
                      ].map((opt) => (
                        <label key={opt.value} className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="payment_preference"
                            value={opt.value}
                            checked={paymentPref === opt.value}
                            onChange={() => setPaymentPref(opt.value)}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.radioGroup}>
                    <p style={{ margin: '0 0 10px', fontWeight: 500, fontSize: 14 }}>How should we meet? <span style={{ fontWeight: 300 }}>(optional)</span></p>
                    <div className={styles.radioOptions}>
                      {[
                        { label: 'Video call', value: 'video' },
                        { label: 'Phone call', value: 'phone' },
                        { label: 'WhatsApp call', value: 'whatsapp' },
                      ].map((opt) => (
                        <label key={opt.value} className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="call_type"
                            value={opt.value}
                            checked={callType === opt.value}
                            onChange={() => setCallType(opt.value)}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Honeypot — hidden from users, must stay empty */}
              <input type="text" name="lb_351fd309" aria-hidden="true" tabIndex={-1} style={{ display: 'none' }} readOnly value="" />

              <label className={styles.consentLabel}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I have read the{' '}
                <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>{' '}
                and consent to RokHaven Realty contacting me about this property.
                {errors.consent && <span className={styles.fieldError}>{errors.consent}</span>}
              </label>
              {formError && <p className={styles.formError}>{formError}</p>}
              <div className={styles.formActions}>
                <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                  {submitting ? 'Sending…' : 'Continue to Calendar →'}
                </button>
                <p className={styles.formNote}>Step 2: pick your call time on the next screen.</p>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className={styles.step2Header}>
              <button className={styles.step2Back} onClick={() => setStep('form')}>
                ← Back to your details
              </button>
              <p className={styles.stepLabel}>STEP 2 OF 2 — PICK YOUR CALL TIME</p>
              <p className={styles.enquirySubPara}>Choose a time that works for you. You&apos;ll get a calendar invite immediately.</p>
            </div>
            <div id="cal-embed" className={styles.calContainer} />
            <div className={styles.calFallback}>
              <p>If the calendar doesn&apos;t load, <a href={`https://cal.com/${CAL_EVENT}`} target="_blank" rel="noopener">click here to book directly</a>.</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function EnquiryFunnel({ cfg }: Props) {
  return (
    <Suspense fallback={null}>
      <EnquiryFunnelInner cfg={cfg} />
    </Suspense>
  );
}
