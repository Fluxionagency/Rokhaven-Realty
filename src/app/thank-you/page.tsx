'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

function ThankYouContent() {
  const params = useSearchParams();
  const name = params.get('name') || 'Valued Client';
  const ref = params.get('ref') || ('RKH-' + Math.floor(10000 + Math.random() * 90000));
  const firstName = name.split(' ')[0];
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    for (let i = 0; i < 28; i++) {
      const d = document.createElement('div');
      d.className = styles.particle;
      const size = Math.random() > 0.7 ? 2 : 1;
      d.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${10 + Math.random() * 20}s;
        animation-delay: ${Math.random() * 12}s;
      `;
      container.appendChild(d);
    }
  }, []);

  return (
    <div className={styles.pageWrapper}>
      {/* WATERMARK */}
      <div className={styles.wmArch}>
        <svg width="600" height="600" viewBox="0 0 60 60" fill="#C0A870">
          <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
        </svg>
      </div>

      {/* PARTICLES */}
      <div className={styles.particles} ref={particlesRef} />

      {/* MAIN CONTENT */}
      <div className={styles.page}>
        {/* Logo */}
        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 60 60" fill="#C0A870">
            <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
          </svg>
          <div>
            <div className={styles.logoWm}>ROKHAVEN</div>
            <div className={styles.logoSm}>REALTY</div>
          </div>
        </div>

        {/* Top rule */}
        <div className={styles.rule} />

        {/* Check icon */}
        <div className={styles.checkWrap}>
          <div className={styles.checkRing}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <polyline
                className={styles.checkSvg}
                points="6,15 12,21 24,9"
                stroke="#C0A870"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>
          Thank You, <span style={{ color: 'var(--gold)' }}>{firstName}</span>.
        </h1>
        <div className={styles.subItalic}>Where Legacy Lives</div>

        {/* Body */}
        <p className={styles.bodyTxt}>
          Your enquiry has been received. A member of the RokHaven team will be in touch within 24
          hours to confirm your inspection and guide you through every next step.
          <br />
          <br />
          <strong style={{ color: '#C0A870', fontWeight: 400 }}>Please check your email</strong>{' '}
          for your client portal login details — your account has been automatically created so you
          can track this inspection and manage future enquiries.
        </p>

        {/* Property / Reference card */}
        <div className={styles.propCard}>
          <div className={styles.propThumbSm}>
            <img
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300&q=80&auto=format&fit=crop"
              alt="Property"
            />
          </div>
          <div className={styles.propInfo}>
            <div className={styles.propInfoLbl}>Your Enquiry</div>
            <div className={styles.propInfoName}>RokHaven Realty</div>
            <div className={styles.propInfoLoc}>
              <svg width="9" height="11" viewBox="0 0 12 15" fill="rgba(192,168,112,.45)">
                <path d="M6 0C2.686 0 0 2.686 0 6c0 4.5 6 9 6 9s6-4.5 6-9c0-3.314-2.686-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
              </svg>
              Lagos, Nigeria
            </div>
          </div>
          <div className={styles.propRef}>
            <div className={styles.propRefLbl}>Reference</div>
            <div className={styles.propRefNum}>{ref}</div>
          </div>
        </div>

        {/* Divider 2 */}
        <div className={styles.rule2} />

        {/* CTAs */}
        <div className={styles.ctaRow}>
          <Link href="/client-portal" className={styles.btnPrimary}>
            Go to Client Portal
          </Link>
          <Link href="/" className={styles.btnOutline}>
            Return to Homepage
          </Link>
        </div>
      </div>

      {/* Footer tagline */}
      <div className={styles.footTag}>RokHaven Realty &nbsp;·&nbsp; Where Legacy Lives</div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#060F1C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 60 60" fill="#C0A870" opacity="0.4">
            <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
          </svg>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
