'use client';

import { trackWhatsAppClick } from '@/lib/tracking';
import styles from './funnel.module.css';

export default function WhatsAppButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className={`${styles.btn} ${styles['btn-lg']}`} onClick={trackWhatsAppClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" fill="none" stroke="#0B1B35" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      {label}
    </a>
  );
}
