'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { falcon, productFor } from '@/lib/falcon';
import { trackLead } from '@/lib/tracking';
import styles from './funnel.module.css';

const FORM = `https://makarfi.leadboard.ng/api/v1/f/${falcon.leadboardForm}`;
const MIN_SUBMIT_DELAY_MS = 3000; // Leadboard refuses submissions <3s after the schema fetch

const PORTFOLIOS = [
  ['part-furnished', 'Part-furnished · ₦278M'],
  ['unfurnished', 'Unfurnished · ₦232M'],
  ['unsure', 'Not sure yet'],
] as const;
const PAYMENTS = [
  ['outright', 'Outright'],
  ['plan-6m', '6-month plan'],
  ['plan-8m', '8-month plan'],
  ['unsure', 'Not sure yet'],
] as const;
const TIMELINES = [
  ['now', 'Ready now'],
  ['3m', 'Within 3 months'],
  ['exploring', 'Just exploring'],
] as const;

type Errors = Partial<Record<string, string>>;

function normalisePhone(raw: string): string | null {
  let v = raw.replace(/[\s\-().]/g, '');
  if (v.startsWith('00')) v = '+' + v.slice(2);
  return /^\+\d{7,15}$/.test(v) ? v : null;
}

function validate(f: { full_name: string; whatsapp: string; email: string; country: string; consent: boolean }): Errors {
  const e: Errors = {};
  if (!f.full_name.trim()) e.full_name = 'Please enter your full name.';
  if (!normalisePhone(f.whatsapp)) e.whatsapp = 'Enter your WhatsApp number with country code, e.g. +234 801 234 5678.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Please enter a valid email address.';
  if (!f.country.trim()) e.country = 'Please enter your country of residence.';
  if (!f.consent) e.consent = 'Please tick the box to continue.';
  return e;
}

function fieldErrorsFrom(raw: unknown): Errors {
  const out: Errors = {};
  if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      out[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
  }
  return out;
}

export default function EnquiryForm() {
  const [values, setValues] = useState({ full_name: '', whatsapp: '+234', email: '', country: '' });
  const [portfolio, setPortfolio] = useState('');
  const [payment, setPayment] = useState('');
  const [timeline, setTimeline] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const idempotencyKey = useRef('');
  const schema = useRef<{ promise: Promise<string>; at: number } | null>(null);

  const loadSchema = () => {
    const at = Date.now();
    const promise = fetch(`${FORM}/schema/`)
      .then((r) => r.json())
      .then((d) => String(d.antispam.timestamp));
    promise.catch(() => { schema.current = null; });
    schema.current = { promise, at };
    return schema.current;
  };

  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID();
    loadSchema();
  }, []);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const errs = validate({ ...values, consent });
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) {
      document.getElementById(`fa-${Object.keys(errs)[0]}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const s = schema.current ?? loadSchema();
      const timestamp = await s.promise;
      const wait = MIN_SUBMIT_DELAY_MS - (Date.now() - s.at);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));

      const product = productFor(portfolio);
      const qs = new URLSearchParams(window.location.search);
      const utm = Object.fromEntries(
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].filter((k) => qs.get(k)).map((k) => [k, qs.get(k)]),
      );

      const res = await fetch(`${FORM}/submit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey.current },
        body: JSON.stringify({
          full_name: values.full_name.trim(),
          whatsapp: normalisePhone(values.whatsapp),
          email: values.email.trim(),
          country: values.country.trim(),
          portfolio,
          payment_preference: payment,
          timeline,
          property: product.name,
          ...utm,
          [falcon.honeypotKey]: '',
          lb_ts: timestamp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fe = fieldErrorsFrom(data.field_errors);
        setErrors(fe);
        if (!Object.keys(fe).length) setFormError('Something went wrong sending your details. Please try again, or message us on WhatsApp.');
        schema.current = null;
        loadSchema();
        setSubmitting(false);
        return;
      }
      trackLead(product.name, product.priceNGN);
      window.location.href = falcon.thankYou;
    } catch {
      setFormError('We could not reach the server. Please check your connection and try again.');
      schema.current = null;
      loadSchema();
      setSubmitting(false);
    }
  }

  const err = (k: string) => errors[k];
  const input = (k: keyof typeof values, label: string, type: string, auto: string, placeholder?: string) => (
    <label className={styles.field} htmlFor={`fa-${k}`}>
      {label}
      <input
        id={`fa-${k}`}
        type={type}
        name={k}
        autoComplete={auto}
        placeholder={placeholder}
        value={values[k]}
        onChange={set(k)}
        aria-invalid={!!err(k)}
        aria-describedby={err(k) ? `fa-${k}-err` : undefined}
        required
      />
      <span id={`fa-${k}-err`} className={styles.err} aria-live="polite">{err(k)}</span>
    </label>
  );

  const radios = (
    name: string,
    legend: string,
    options: readonly (readonly [string, string])[],
    value: string,
    onChange: (v: string) => void,
  ) => (
    <div role="radiogroup" aria-labelledby={`fa-${name}-q`} className={styles['stack-sm']} style={{ gap: 10 }}>
      <div id={`fa-${name}-q`} className={styles.q}>{legend}</div>
      <div className={styles.chips}>
        {options.map(([v, l]) => (
          <label key={v} className={styles.chip}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
            {l}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <fieldset className={styles.fieldset}>
        <legend>01 · ABOUT YOU</legend>
        <div className={styles.fields}>
          {input('full_name', 'Full name', 'text', 'name')}
          {input('whatsapp', 'WhatsApp number (with country code)', 'tel', 'tel', '+234 …')}
          {input('email', 'Email', 'email', 'email')}
          {input('country', 'Country of residence', 'text', 'country-name')}
        </div>
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend>02 · YOUR PLANS</legend>
        {radios('portfolio', 'Which portfolio interests you?', PORTFOLIOS, portfolio, setPortfolio)}
        {radios('payment_preference', 'How would you pay?', PAYMENTS, payment, setPayment)}
        {radios('timeline', 'Timeline', TIMELINES, timeline, setTimeline)}
        <div>
          <label className={styles.consent} htmlFor="fa-consent">
            <input id="fa-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={!!err('consent')} aria-describedby={err('consent') ? 'fa-consent-err' : undefined} required />
            <span>
              I agree to be contacted by RokHaven Realty about this property and accept the{' '}
              <Link href={falcon.privacyHref}>Privacy Policy</Link>.
            </span>
          </label>
          <span id="fa-consent-err" className={styles.err} aria-live="polite">{err('consent')}</span>
        </div>
        {/* honeypot: never visible, never focusable */}
        <div className={styles.honey} aria-hidden="true">
          <input type="text" name={falcon.honeypotKey} tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
      </fieldset>
      <div className={styles.submit}>
        <div aria-live="polite" style={{ width: '100%' }}>
          {formError && <p className={styles['form-error']} role="alert">{formError}</p>}
        </div>
        <button type="submit" className={`${styles.btn} ${styles['btn-navy']}`} disabled={submitting}>
          {submitting ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" fill="none" stroke="#C0A870" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          )}
          {submitting ? 'Sending…' : falcon.cta.primary}
        </button>
        <span className={styles.small}>Your details stay with RokHaven. We don’t share them, and there’s no spam.</span>
      </div>
    </form>
  );
}
