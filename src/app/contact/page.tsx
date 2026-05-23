'use client';

import { useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import styles from './page.module.css';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Contact form submission:', form);
    // POST to /api/enquiries when backend is ready
    // fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSubmitted(true);
  }

  return (
    <>
      <Nav backHref="/" backLabel="← Back to Homepage" />

      {/* PAGE HEADER */}
      <div className={styles.pageHdr}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span style={{ opacity: 0.3 }}>›</span>
          <span>Contact</span>
        </div>
        <div className={styles.sectionLabel}>Get in Touch</div>
        <h1 className={styles.pageTitle}>We&apos;d Love to Hear From You</h1>
        <p className={styles.pageSubtitle}>
          Whether you have a property enquiry, a general question, or simply want to learn more about RokHaven, our team is always available.
        </p>
      </div>

      {/* MAIN */}
      <div className={styles.main}>

        {/* FORM COLUMN */}
        <div>
          <div className={styles.sectionLbl}>Send Us a Message</div>

          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div className={`${styles.fieldGrid} ${styles.fieldGrid2}`}>
                <div>
                  <label className={styles.fieldLabel}>Full Name</label>
                  <input
                    className={styles.fieldInput}
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Email Address</label>
                  <input
                    className={styles.fieldInput}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={`${styles.fieldGrid} ${styles.fieldGrid2}`}>
                <div>
                  <label className={styles.fieldLabel}>Phone Number</label>
                  <input
                    className={styles.fieldInput}
                    type="tel"
                    name="phone"
                    placeholder="+234 — — — — —"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Subject</label>
                  <select
                    className={styles.fieldSelect}
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                  >
                    <option value="">Select a subject</option>
                    <option>Property Enquiry</option>
                    <option>Schedule a Viewing</option>
                    <option>List My Property</option>
                    <option>Partnership / Investment</option>
                    <option>General Enquiry</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className={`${styles.fieldGrid} ${styles.fieldGrid2}`} style={{ marginBottom: 20 }}>
                <div className={styles.fullSpan}>
                  <label className={styles.fieldLabel}>Message</label>
                  <textarea
                    className={styles.fieldTextarea}
                    name="message"
                    placeholder="Tell us what you're looking for, or how we can help…"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button className={styles.submitBtn} type="submit">
                Send Message →
              </button>
              <p className={styles.formNote}>
                We respond to all enquiries within 24 hours.<br />
                Your information is kept strictly confidential.
              </p>
            </form>
          ) : (
            <div className={styles.successMsg}>
              <div className={styles.successTitle}>Message Received</div>
              <p className={styles.successBody}>
                Thank you for reaching out. A member of the RokHaven team will be in touch within 24 hours.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightCol}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardTitle}>Contact Information</div>

            <div className={styles.infoRow}>
              <div className={styles.infoIcon}>
                <svg width="13" height="13" fill="none" stroke="rgba(192,168,112,.5)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 .02h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                </svg>
              </div>
              <div>
                <div className={styles.infoLabel}>Phone</div>
                <div className={styles.infoValue}>
                  <a href="tel:+2349167619009">+234 9167619009</a>
                </div>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoIcon}>
                <svg width="13" height="13" fill="none" stroke="rgba(192,168,112,.5)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div className={styles.infoLabel}>Email</div>
                <div className={styles.infoValue}>
                  <a href="mailto:hello@rokhaven.com">hello@rokhaven.com</a>
                </div>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoIcon}>
                <svg width="13" height="13" fill="none" stroke="rgba(192,168,112,.5)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <div className={styles.infoLabel}>WhatsApp</div>
                <div className={styles.infoValue}>
                  <a href="https://wa.me/2349167619009" target="_blank" rel="noopener noreferrer">
                    +234 9167619009
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoIcon}>
                <svg width="13" height="13" fill="none" stroke="rgba(192,168,112,.5)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <div>
                <div className={styles.infoLabel}>Instagram</div>
                <div className={styles.infoValue}>
                  <a href="https://instagram.com/rokhavenrealty" target="_blank" rel="noopener noreferrer">
                    @rokhavenrealty
                  </a>
                </div>
              </div>
            </div>
          </div>

          <Link href="/enquiry" className={styles.ctaBtn}>
            Schedule a Property Viewing →
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footRow}>
          <Link href="/" className={styles.footLogo}>
            <svg width="22" height="22" viewBox="0 0 60 60" fill="#C0A870">
              <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
            </svg>
            <div>
              <div className={styles.footWm}>ROKHAVEN</div>
              <div className={styles.footSm}>REALTY</div>
            </div>
          </Link>
          <div className={styles.footLinks}>
            <Link href="/listings">Sales</Link>
            <Link href="/listings?cat=rent">Rent</Link>
            <Link href="/listings?cat=shortlet">Shortlets</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className={styles.footCopy}>© 2025 RokHaven Realty Ltd.</div>
        </div>
      </footer>
    </>
  );
}
