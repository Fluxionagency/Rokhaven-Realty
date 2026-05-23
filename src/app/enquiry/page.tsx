'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

/* ─── TYPES ─── */
type StepType = 'choice' | 'multi' | 'text' | 'phone' | 'textarea' | 'datetime' | 'ack';

interface StepOpt {
  v: string;
  l: string;
}

interface Step {
  id: string;
  type: StepType;
  required: boolean;
  optional?: boolean;
  q: string;
  sub?: string;
  opts?: StepOpt[] | string[];
  ph?: string;
  itype?: string;
  ac?: string;
  hint?: string;
  vld?: (v: string) => boolean;
  em?: string;
  ackTxt?: string;
  showIf?: (ans: Record<string, unknown>) => boolean;
}

/* ─── STEPS DEFINITION ─── */
const STEPS: Step[] = [
  {
    id: 'intent',
    type: 'choice',
    required: true,
    q: 'How can we help you today?',
    sub: 'Let us know what brings you here.',
    opts: [
      { v: 'specific', l: "I saw a property I'd like to know more about" },
      { v: 'new', l: "I'm looking for a new property" },
    ],
    showIf: (ans) => !ans._isListing,
  },
  {
    id: 'name',
    type: 'text',
    required: true,
    q: 'What is your full name?',
    ph: 'e.g. Adaeze Okonkwo',
    itype: 'text',
    ac: 'name',
  },
  {
    id: 'email',
    type: 'text',
    required: true,
    q: 'What is your email address?',
    ph: 'you@example.com',
    itype: 'email',
    ac: 'email',
    vld: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    em: 'Please enter a valid email address.',
  },
  {
    id: 'phone',
    type: 'phone',
    required: true,
    q: 'What is your phone number?',
    ph: '080 — — — — —',
  },
  {
    id: 'principal',
    type: 'choice',
    required: true,
    q: "Are you the principal, or an agent acting on someone's behalf?",
    sub: 'This helps us prepare the right team for your enquiry.',
    opts: [
      { v: 'self', l: 'I am the principal — I will personally occupy or own it' },
      { v: 'agent', l: 'I am an agent acting on behalf of someone else' },
    ],
  },
  {
    id: 'agent_rep',
    type: 'text',
    required: true,
    q: 'What is the name of the person you are representing?',
    sub: 'This is kept strictly confidential.',
    ph: 'Full name of the principal',
    itype: 'text',
    showIf: (ans) => ans.principal === 'agent',
  },
  {
    id: 'company',
    type: 'text',
    required: false,
    optional: true,
    q: 'Company name — if purchasing on behalf of a company',
    sub: 'Leave blank for a personal purchase.',
    ph: 'Company name',
    itype: 'text',
  },
  {
    id: 'prop_id',
    type: 'choice',
    required: true,
    q: 'How would you like to identify the property?',
    opts: [
      { v: 'link', l: 'I have the listing link' },
      { v: 'describe', l: 'I can describe it' },
      { v: 'screenshot', l: "I'll upload a screenshot" },
    ],
    showIf: (ans) => !ans._isListing && ans.intent === 'specific',
  },
  {
    id: 'prop_link',
    type: 'text',
    required: true,
    q: 'Paste the property link here',
    ph: 'https://rokhaven.com/property/…',
    itype: 'url',
    vld: (v) => v.length > 8,
    em: 'Please paste a valid property URL.',
    showIf: (ans) => !ans._isListing && ans.intent === 'specific' && ans.prop_id === 'link',
  },
  {
    id: 'txn',
    type: 'choice',
    required: true,
    q: 'What type of transaction are you looking for?',
    opts: [
      { v: 'buy', l: 'Purchase (Buy)' },
      { v: 'rent', l: 'Annual Lease (Rent)' },
      { v: 'shortlet', l: 'Short-let (under 12 months)' },
      { v: 'both', l: 'Both Lease and Purchase' },
    ],
    showIf: (ans) => !ans._isListing && ans.intent !== 'specific',
  },
  {
    id: 'prop_type',
    type: 'multi',
    required: true,
    q: 'What type of property are you looking for?',
    sub: 'Select all that apply.',
    opts: ['Apartment', 'Semi-Detached House', 'Fully Detached House', 'Penthouse', 'Villa', 'Townhouse', 'Other'],
    showIf: (ans) => !ans._isListing && ans.intent !== 'specific',
  },
  {
    id: 'bedrooms',
    type: 'choice',
    required: true,
    q: 'How many bedrooms do you need?',
    opts: [
      { v: '1', l: '1 Bedroom' },
      { v: '2', l: '2 Bedrooms' },
      { v: '3', l: '3 Bedrooms' },
      { v: '4', l: '4 Bedrooms' },
      { v: '5+', l: '5+ Bedrooms' },
    ],
    showIf: (ans) => !ans._isListing,
  },
  {
    id: 'locations',
    type: 'multi',
    required: true,
    q: 'Which locations are you interested in?',
    sub: 'Select all that apply.',
    opts: [
      'Banana Island',
      'Ikoyi',
      'Victoria Island',
      'Eko Atlantic',
      'Lekki Phase 1',
      'Lekki Phase 2',
      'Ajah',
      'Ikeja GRA',
      'Magodo',
      'Open to Suggestions',
    ],
    showIf: (ans) => !ans._isListing,
  },
  {
    id: 'pri_loc',
    type: 'text',
    required: false,
    optional: true,
    q: 'Which 1–2 locations should we prioritise for you?',
    sub: 'Share your top preferences if you have any.',
    ph: 'e.g. Ikoyi, Victoria Island',
    itype: 'text',
    showIf: (ans) => !ans._isListing,
  },
  {
    id: 'budget',
    type: 'text',
    required: true,
    q: 'What is your budget range?',
    sub: 'Include currency — e.g., ₦150,000,000 or $200,000. For rent, specify per annum.',
    ph: '₦ — — — — — — — —',
    itype: 'text',
    hint: 'Your budget is kept strictly confidential.',
  },
  {
    id: 'musts',
    type: 'multi',
    required: false,
    optional: true,
    q: 'Which of these are must-haves for you?',
    sub: 'Select all that apply.',
    opts: [
      'Spacious rooms',
      'Swimming pool',
      'Gym / Fitness centre',
      'Garden / Outdoor space',
      '24/7 Security',
      'Parking (multiple cars)',
      'BQ / Staff quarters',
      'Furnished',
      'Smart Home',
      'Generator',
    ],
  },
  {
    id: 'timeline',
    type: 'choice',
    required: true,
    q: 'What is your timeline?',
    opts: [
      { v: '2w', l: 'Immediate — within 2 weeks' },
      { v: '1m', l: 'Within 1 month' },
      { v: '3m', l: 'Within 3 months' },
      { v: '6m', l: 'Within 6 months' },
      { v: 'flex', l: 'Flexible / Just exploring' },
    ],
  },
  {
    id: 'referral',
    type: 'choice',
    required: false,
    optional: true,
    q: 'How did you hear about RokHaven Realty?',
    opts: [
      { v: 'social', l: 'Instagram / Social Media' },
      { v: 'referral', l: 'Referral' },
      { v: 'google', l: 'Google Search' },
      { v: 'website', l: 'Our Website' },
      { v: 'word', l: 'Word of Mouth' },
      { v: 'other', l: 'Other' },
    ],
  },
  {
    id: 'notes',
    type: 'textarea',
    required: false,
    optional: true,
    q: 'Any additional details or specific requirements?',
    sub: "Optional — share anything else you'd like our team to know.",
    ph: "e.g. I'm particularly interested in properties with lagoon views…",
  },
  {
    id: 'insp_date',
    type: 'datetime',
    required: false,
    optional: true,
    q: 'When would you prefer to inspect the property?',
    sub: 'Our team will confirm availability and reach out within 24 hours.',
  },
  {
    id: 'contact',
    type: 'choice',
    required: true,
    q: 'When is the best time for our team to reach you?',
    opts: [
      { v: 'any', l: 'Anytime' },
      { v: 'morning', l: 'Morning (8am – 12pm)' },
      { v: 'afternoon', l: 'Afternoon (12pm – 5pm)' },
      { v: 'evening', l: 'Evening (5pm – 8pm)' },
    ],
  },
  {
    id: 'brokerage',
    type: 'ack',
    required: true,
    q: 'One Last Thing',
    ackTxt:
      'RokHaven Realty is a professional real estate agency. Our services are professional and fee-based. By submitting this form, you acknowledge that upon a successful transaction — whether purchase, lease, or short-let — you will be required to pay the applicable brokerage / professional service fee as quoted by RokHaven Realty.',
    opts: [
      { v: 'agree', l: 'I understand and I agree' },
      { v: 'disagree', l: 'I do not agree' },
    ],
    em: 'You must acknowledge the brokerage terms to proceed.',
  },
  {
    id: 'marketing',
    type: 'choice',
    required: true,
    q: 'May we send you property updates and curated listings?',
    sub: 'Via email, WhatsApp, and SMS.',
    opts: [
      { v: 'yes', l: 'Yes, please keep me updated' },
      { v: 'no', l: 'No thank you' },
    ],
  },
];

const LT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const today = new Date().toISOString().split('T')[0];

export default function EnquiryPage() {
  const router = useRouter();
  const [ans, setAns] = useState<Record<string, unknown>>({ _isListing: false });
  const [curIdx, setCurIdx] = useState(0);
  const [animDir, setAnimDir] = useState<'forward' | 'back' | null>(null);
  const [exiting, setExiting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  /* ─── VISIBLE STEPS ─── */
  const visible = useCallback(
    () => STEPS.filter((s) => !s.showIf || s.showIf(ans)),
    [ans]
  );

  const visSteps = visible();
  const totalSteps = visSteps.length;
  const currentStep = visSteps[curIdx];

  /* ─── PROGRESS ─── */
  const pct = Math.max(4, Math.round((curIdx / Math.max(totalSteps - 1, 1)) * 100));

  /* ─── GET VALUE FROM DOM ─── */
  function getStepVal(stepId: string): unknown {
    const step = STEPS.find((s) => s.id === stepId);
    if (!step) return '';
    const el = document.getElementById(`step-${stepId}`);
    if (!el) return '';

    if (step.type === 'choice' || step.type === 'ack') {
      const sel = el.querySelector('[data-selected="true"]') as HTMLElement | null;
      return sel ? sel.dataset.v || '' : '';
    }
    if (step.type === 'multi') {
      return Array.from(el.querySelectorAll('[data-selected="true"]')).map(
        (e) => (e as HTMLElement).dataset.v || ''
      );
    }
    if (step.type === 'text' || step.type === 'phone') {
      const inp = el.querySelector('input') as HTMLInputElement | null;
      return inp ? inp.value.trim() : '';
    }
    if (step.type === 'textarea') {
      const ta = el.querySelector('textarea') as HTMLTextAreaElement | null;
      return ta ? ta.value.trim() : '';
    }
    if (step.type === 'datetime') {
      const d = el.querySelector('.dt-in') as HTMLInputElement | null;
      const t = el.querySelector('.dt-sel') as HTMLSelectElement | null;
      return { date: d?.value || '', time: t?.value || '' };
    }
    return '';
  }

  /* ─── VALIDATE ─── */
  function validate(step: Step): boolean {
    if (step.optional || !step.required) return true;
    const v = getStepVal(step.id);
    if (step.type === 'multi') return (v as string[]).length > 0;
    if (step.type === 'datetime') return true;
    if (!v) return false;
    if (step.vld && typeof v === 'string' && !step.vld(v)) return false;
    if (step.type === 'ack' && v !== 'agree') return false;
    return true;
  }

  /* ─── NAVIGATE FORWARD ─── */
  function goNext() {
    const step = visSteps[curIdx];
    const val = getStepVal(step.id);
    const newAns = { ...ans, [step.id]: val };

    if (!validate(step)) {
      setErrors((e) => ({ ...e, [step.id]: true }));
      return;
    }
    setErrors((e) => ({ ...e, [step.id]: false }));
    setAns(newAns);

    if (curIdx >= totalSteps - 1) {
      handleSubmit(newAns);
      return;
    }

    setExiting(true);
    setAnimDir('forward');
    setTimeout(() => {
      setExiting(false);
      setAnimDir(null);
      setCurIdx((i) => i + 1);
    }, 240);
  }

  /* ─── NAVIGATE BACK ─── */
  function goBack() {
    if (curIdx === 0) return;
    setExiting(true);
    setAnimDir('back');
    setTimeout(() => {
      setExiting(false);
      setAnimDir(null);
      setCurIdx((i) => i - 1);
    }, 240);
  }

  /* ─── SUBMIT ─── */
  async function handleSubmit(finalAns: Record<string, unknown>) {
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalAns),
      });
    } catch {
      // continue to confirmation regardless
    }

    const name = ((finalAns.name as string) || 'there').split(' ')[0];
    const ref = 'RKH-' + Math.floor(10000 + Math.random() * 90000);
    router.push(`/thank-you?name=${encodeURIComponent(name)}&ref=${encodeURIComponent(ref)}`);
  }

  /* ─── KEYBOARD ─── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.key === 'Enter' &&
        !e.shiftKey &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        goNext();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  /* ─── FOCUS INPUT ─── */
  useEffect(() => {
    const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `#step-${currentStep?.id} input, #step-${currentStep?.id} textarea`
    );
    if (el) {
      setTimeout(() => el.focus(), 120);
      inputRef.current = el;
    }
  }, [curIdx, currentStep?.id]);

  if (submitted) return null;

  /* ─── RENDER STEP CONTENT ─── */
  function renderInput(step: Step) {
    if (step.type === 'choice' || step.type === 'ack') {
      const opts = step.opts as StepOpt[];
      return (
        <>
          {step.type === 'ack' && (
            <div className={styles.ackCard}>
              <p className={styles.ackTxt}>{step.ackTxt}</p>
            </div>
          )}
          <div className={styles.opts}>
            {opts.map((o, i) => (
              <OptCard
                key={o.v}
                letter={LT[i]}
                label={o.l}
                value={o.v}
                stepId={step.id}
                isAck={step.type === 'ack'}
                onSelect={() => {
                  setErrors((e) => ({ ...e, [step.id]: false }));
                  if (step.type === 'choice') {
                    setTimeout(() => goNext(), 360);
                  }
                }}
              />
            ))}
          </div>
        </>
      );
    }

    if (step.type === 'multi') {
      const opts = step.opts as string[];
      return (
        <div className={styles.mopts}>
          {opts.map((o) => (
            <MultiOpt key={o} label={o} stepId={step.id} />
          ))}
        </div>
      );
    }

    if (step.type === 'phone') {
      return (
        <div className={styles.phRow}>
          <div className={styles.phCc}>🇳🇬 +234</div>
          <input
            className={styles.tIn}
            type="tel"
            placeholder={step.ph || ''}
            autoComplete="tel"
            style={{ borderBottom: 'none' }}
          />
        </div>
      );
    }

    if (step.type === 'text') {
      return (
        <>
          <div className={styles.tWrap}>
            <input
              className={styles.tIn}
              type={step.itype || 'text'}
              placeholder={step.ph || ''}
              autoComplete={step.ac || 'off'}
            />
          </div>
          {step.hint && <div className={styles.tHint}>{step.hint}</div>}
        </>
      );
    }

    if (step.type === 'textarea') {
      return (
        <textarea
          className={styles.tArea}
          placeholder={step.ph || ''}
          rows={4}
        />
      );
    }

    if (step.type === 'datetime') {
      return (
        <div className={styles.dtRow}>
          <div className={styles.dtF}>
            <div className={styles.dtLb}>Preferred Date</div>
            <input className={`${styles.dtIn} dt-in`} type="date" min={today} />
          </div>
          <div className={styles.dtF}>
            <div className={styles.dtLb}>Preferred Time</div>
            <select className={`${styles.dtIn} dt-sel`} defaultValue="">
              <option value="">Any time</option>
              <option>Morning (9am–12pm)</option>
              <option>Midday (12pm–2pm)</option>
              <option>Afternoon (2pm–5pm)</option>
              <option>Evening (5pm–7pm)</option>
            </select>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div className={styles.page}>
      {/* TOP NAV */}
      <nav className={styles.topNav}>
        <Link href="/" className={styles.tnLogo}>
          <svg width="24" height="24" viewBox="0 0 60 60" fill="#C0A870">
            <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
          </svg>
          <div>
            <div className={styles.tnWm}>ROKHAVEN</div>
            <div className={styles.tnSm}>REALTY</div>
          </div>
        </Link>
        <div className={styles.tnRight}>
          <Link href="/" className={styles.tnExit}>
            ← Exit Form
          </Link>
        </div>
      </nav>

      {/* PROGRESS */}
      <div className={styles.progWrap}>
        <div className={styles.progMeta}>
          <span className={styles.progLbl}>Your Enquiry</span>
          <span className={styles.progStep}>
            Step {curIdx + 1} of {totalSteps}
          </span>
        </div>
        <div className={styles.progTrack}>
          <div className={styles.progFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* SHELL */}
      <div className={styles.shell}>
        <div className={styles.formMain}>
          {/* WATERMARK */}
          <div className={styles.wmark}>
            <svg width="560" height="560" viewBox="0 0 60 60" fill="#C0A870">
              <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
            </svg>
          </div>

          {/* STEP CONTAINER */}
          <div className={styles.stepCont}>
            {visSteps.map((step, i) => {
              const isActive = i === curIdx && !exiting;
              const isExiting = i === curIdx && exiting;
              let cls = styles.step;
              if (isActive) {
                cls += ' ' + (animDir === 'back' ? styles.stepActiveBack : styles.stepActive);
              } else if (isExiting) {
                cls += ' ' + (animDir === 'back' ? styles.stepExitingBack : styles.stepExiting);
              }

              return (
                <div key={step.id} id={`step-${step.id}`} className={cls}>
                  <div className={styles.qBadge}>
                    <span className={styles.qNum}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.qArr}>→</span>
                  </div>
                  <div className={styles.qText}>{step.q}</div>
                  {step.sub && <div className={styles.qSub}>{step.sub}</div>}
                  {step.optional && (
                    <div className={styles.qOpt}>Optional — press Continue to skip</div>
                  )}
                  <div>{renderInput(step)}</div>
                  {errors[step.id] && (
                    <div className={`${styles.errMsg} ${styles.errMsgShow}`}>
                      {step.em || 'This field is required.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM NAV */}
          <div className={styles.botNav}>
            <button
              className={styles.btnBk}
              onClick={goBack}
              disabled={curIdx === 0}
            >
              ← Back
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <button className={styles.btnOk} onClick={goNext}>
                {curIdx === totalSteps - 1 ? 'Submit Enquiry →' : 'Continue →'}
              </button>
              <div className={styles.enterHint}>Press Enter to continue ↩</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── OPT CARD COMPONENT ─── */
function OptCard({
  letter,
  label,
  value,
  stepId,
  isAck,
  onSelect,
}: {
  letter: string;
  label: string;
  value: string;
  stepId: string;
  isAck: boolean;
  onSelect: () => void;
}) {
  const [selected, setSelected] = useState(false);

  function handleClick() {
    // Deselect siblings
    const container = document.getElementById(`step-${stepId}`);
    if (!container) return;
    container.querySelectorAll('[data-selected="true"]').forEach((el) => {
      (el as HTMLElement).dataset.selected = 'false';
      el.setAttribute('aria-selected', 'false');
    });
    const el = document.getElementById(`opt-${stepId}-${value}`);
    if (el) {
      el.dataset.selected = 'true';
      el.setAttribute('aria-selected', 'true');
    }
    setSelected(true);
    // Force re-render for siblings
    if (!isAck) {
      onSelect();
    } else {
      onSelect();
    }
  }

  return (
    <div
      id={`opt-${stepId}-${value}`}
      className={`${styles.opt} ${selected ? styles.optSel : ''}`}
      data-v={value}
      data-selected={selected ? 'true' : 'false'}
      onClick={handleClick}
      role="option"
      aria-selected={selected}
    >
      <div className={`${styles.optLt} ${selected ? styles.optSel : ''}`}>{letter}</div>
      <div className={styles.optLb}>{label}</div>
      <div className={styles.optCk}>✓</div>
    </div>
  );
}

/* ─── MULTI OPT COMPONENT ─── */
function MultiOpt({ label, stepId }: { label: string; stepId: string }) {
  const [selected, setSelected] = useState(false);
  const id = `mopt-${stepId}-${label.replace(/\s+/g, '-')}`;

  return (
    <div
      id={id}
      className={`${styles.mopt} ${selected ? styles.moptSel : ''}`}
      data-v={label}
      data-selected={selected ? 'true' : 'false'}
      onClick={() => {
        setSelected((s) => {
          const newSel = !s;
          const el = document.getElementById(id);
          if (el) el.dataset.selected = newSel ? 'true' : 'false';
          return newSel;
        });
      }}
    >
      {label}
    </div>
  );
}
