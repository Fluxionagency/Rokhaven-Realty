'use client';

import { useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import styles from './page.module.css';

const AMENITIES = [
  'Swimming Pool',
  'Generator',
  'BQ / Staff Quarters',
  'Smart Home',
  '24/7 Security',
  'Gym',
  'Gated Estate',
  'Home Theatre',
  'Parking (4+)',
  'Air Conditioning',
  'Elevator / Lift',
  'Water Treatment',
  'Intercom',
  'Solar Power',
  'CCTV',
];

export default function ListYourPropertyPage() {
  const [role, setRole] = useState<string>('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    listingType: '',
    propertyType: '',
    price: '',
    location: '',
    neighbourhood: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleAmenity(a: string) {
    setAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      alert('Please confirm your relationship to the property to proceed.');
      return;
    }
    if (!consent) {
      alert('Please accept the consent declaration to proceed.');
      return;
    }
    const payload = { ...form, role, amenities, consent };
    try {
      await fetch('/api/list-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch { /* show success anyway */ }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <Nav backHref="/" backLabel="← Back to Homepage" />

      {/* PAGE HEADER */}
      <div className={styles.pageHdr}>
        <div className={styles.pageHdrInner}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span style={{ opacity: 0.3 }}>›</span>
            <span>List Your Property</span>
          </div>
          <div className={styles.pageTag}>For Property Owners</div>
          <h1 className={styles.pageTitle}>
            List Your Property<br />with RokHaven
          </h1>
          <p className={styles.pageSubtitle}>
            Submit your property details below. Our team will review your enquiry and reach out within 24–48 hours to discuss next steps, no commitment required.
          </p>
        </div>
      </div>

      {/* MAIN */}
      <div className={styles.main}>

        {/* FORM COLUMN */}
        <div className={styles.formCol}>
          {submitted ? (
            <div className={styles.successMsg}>
              <div className={styles.sucIcon}>✓</div>
              <div className={styles.sucH}>Enquiry Received</div>
              <p className={styles.sucB}>
                Thank you. A member of the RokHaven team will review your property details and reach out within 24–48 hours to discuss next steps.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              {/* SECTION 1: Role / Relationship */}
              <div className={styles.fsec}>
                <div className={styles.fsecLbl}>Your Relationship to the Property</div>
                <div className={`${styles.fg} ${styles.fg1}`} style={{ marginBottom: 14 }}>
                  <div>
                    <label className={styles.fqLbl}>Which best describes you?</label>
                    <div className={styles.rolePillRow}>
                      <button
                        type="button"
                        className={`${styles.rolePill} ${role === 'owner' ? styles.rolePillOn : ''}`}
                        onClick={() => setRole('owner')}
                      >
                        I am the Property Owner
                      </button>
                      <button
                        type="button"
                        className={`${styles.rolePill} ${role === 'direct' ? styles.rolePillOn : ''}`}
                        onClick={() => setRole('direct')}
                      >
                        I have a Direct Mandate
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.noticeBanner}>
                  <span className={styles.noticeIcon}>ℹ</span>
                  <div className={styles.noticeText}>
                    <strong>We only work with direct relationships.</strong> RokHaven Realty does not accept semi-direct or sub-mandates of any kind. Listings are only published from verified property owners or holders of a direct mandate.
                  </div>
                </div>
              </div>

              {/* SECTION 2: Contact Info */}
              <div className={styles.fsec} style={{ marginTop: 32 }}>
                <div className={styles.fsecLbl}>Your Details</div>
                <div className={`${styles.fg} ${styles.fg2}`}>
                  <div>
                    <label className={styles.fqLbl}>Full Name</label>
                    <input
                      className={styles.fqIn}
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.fqLbl}>Email Address</label>
                    <input
                      className={styles.fqIn}
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className={`${styles.fg} ${styles.fg2}`} style={{ marginBottom: 28 }}>
                  <div>
                    <label className={styles.fqLbl}>Phone Number</label>
                    <div className={styles.phPrefix}>
                      <div className={styles.phCc}>🇳🇬 +234</div>
                      <input
                        className={styles.fqIn}
                        type="tel"
                        name="phone"
                        placeholder="080 — — — — —"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={styles.fqLbl}>WhatsApp <span>— Optional</span></label>
                    <div className={styles.phPrefix}>
                      <div className={styles.phCc}>🇳🇬 +234</div>
                      <input
                        className={styles.fqIn}
                        type="tel"
                        name="whatsapp"
                        placeholder="Same as phone?"
                        value={form.whatsapp}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Property Details */}
              <div className={styles.fsec}>
                <div className={styles.fsecLbl}>Property Details</div>
                <div className={`${styles.fg} ${styles.fg2}`}>
                  <div>
                    <label className={styles.fqLbl}>Listing Type</label>
                    <select
                      className={styles.fqSel}
                      name="listingType"
                      value={form.listingType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select type</option>
                      <option>For Sale</option>
                      <option>For Rent</option>
                      <option>Shortlet</option>
                      <option>Joint Venture (JV)</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.fqLbl}>Property Type</label>
                    <select
                      className={styles.fqSel}
                      name="propertyType"
                      value={form.propertyType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select type</option>
                      <option>Apartment</option>
                      <option>Semi-Detached House</option>
                      <option>Fully Detached House</option>
                      <option>Penthouse</option>
                      <option>Villa</option>
                      <option>Townhouse</option>
                      <option>Maisonette</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className={`${styles.fg} ${styles.fg2}`}>
                  <div>
                    <label className={styles.fqLbl}>Asking Price (₦) <span>— or Per Annum for Rent</span></label>
                    <input
                      className={styles.fqIn}
                      type="text"
                      name="price"
                      placeholder="e.g. 450,000,000"
                      value={form.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.fqLbl}>Location / Address</label>
                    <input
                      className={styles.fqIn}
                      type="text"
                      name="location"
                      placeholder="Estate name, street, or area"
                      value={form.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className={`${styles.fg} ${styles.fg2}`}>
                  <div>
                    <label className={styles.fqLbl}>Neighbourhood</label>
                    <input
                      className={styles.fqIn}
                      type="text"
                      name="neighbourhood"
                      placeholder="e.g. Ikoyi, Lekki Phase 1"
                      value={form.neighbourhood}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={styles.fqLbl}>Bedrooms</label>
                    <select
                      className={styles.fqSel}
                      name="bedrooms"
                      value={form.bedrooms}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option>Studio</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6+</option>
                    </select>
                  </div>
                </div>

                <div className={`${styles.fg} ${styles.fg2}`}>
                  <div>
                    <label className={styles.fqLbl}>Bathrooms</label>
                    <select
                      className={styles.fqSel}
                      name="bathrooms"
                      value={form.bathrooms}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6+</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.fqLbl}>Additional Notes <span>— Optional</span></label>
                    <textarea
                      className={styles.fqTa}
                      name="description"
                      placeholder="Describe the property — key features, condition, tenure, any other relevant details…"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Amenities */}
              <div className={styles.fsec} style={{ marginTop: 4 }}>
                <div className={styles.fsecLbl}>Amenities</div>
                <div className={styles.amenitiesGrid}>
                  {AMENITIES.map(a => {
                    const isOn = amenities.includes(a);
                    return (
                      <div
                        key={a}
                        className={`${styles.amenityItem} ${isOn ? styles.amenityItemOn : ''}`}
                        onClick={() => toggleAmenity(a)}
                      >
                        <div className={`${styles.amenityCheck} ${isOn ? styles.amenityCheckOn : ''}`}>
                          {isOn ? '✓' : ''}
                        </div>
                        <span className={styles.amenityLabel}>{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: Consent */}
              <div
                className={`${styles.chkRow} ${consent ? styles.chkRowOn : ''}`}
                onClick={() => setConsent(prev => !prev)}
              >
                <div className={`${styles.chkBox} ${consent ? styles.chkBoxOn : ''}`}>
                  {consent ? '✓' : ''}
                </div>
                <p className={styles.chkTxt}>
                  I consent to RokHaven Realty contacting me regarding my property listing enquiry. I understand that submission does not guarantee listing approval, and that RokHaven reserves the right to vet all listings prior to publication.
                </p>
              </div>

              <button className={styles.btnSubmit} type="submit">
                Submit Enquiry →
              </button>
              <p className={styles.subNote}>
                No commitment required. Our team will be in touch within 24–48 hours.
              </p>
            </form>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightCol}>

          {/* Why RokHaven */}
          <div className={styles.whyCard}>
            <div className={styles.wcLbl}>Why List With Us</div>
            <div className={styles.wcH}>Nigeria&apos;s Premier Luxury Platform</div>

            <div className={styles.wpillar}>
              <div className={styles.wpLine} />
              <div>
                <div className={styles.wpTitle}>Qualified Buyers Only</div>
                <div className={styles.wpDesc}>Every enquiry is vetted. Your property reaches only serious, high-net-worth buyers and tenants.</div>
              </div>
            </div>

            <div className={styles.wpillar}>
              <div className={styles.wpLine} />
              <div>
                <div className={styles.wpTitle}>Premium Presentation</div>
                <div className={styles.wpDesc}>Professional photography, video tours, and curated listing copy — we present your property at its absolute best.</div>
              </div>
            </div>

            <div className={styles.wpillar}>
              <div className={styles.wpLine} />
              <div>
                <div className={styles.wpTitle}>Managed End-to-End</div>
                <div className={styles.wpDesc}>From listing to inspection to closing, our team handles every detail so you don&apos;t have to.</div>
              </div>
            </div>

            <div className={styles.wpillar}>
              <div className={styles.wpLine} />
              <div>
                <div className={styles.wpTitle}>Absolute Discretion</div>
                <div className={styles.wpDesc}>We respect your privacy. Enquiries are handled confidentially, always.</div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className={styles.statsCard}>
            <div className={styles.wcLbl} style={{ marginBottom: 16 }}>The Numbers</div>
            <div className={styles.statsGrid}>
              <div>
                <div className={styles.statN}>₦1B+</div>
                <div className={styles.statL}>In transactions managed</div>
              </div>
              <div>
                <div className={styles.statN}>50+</div>
                <div className={styles.statL}>Properties listed</div>
              </div>
              <div>
                <div className={styles.statN}>100+</div>
                <div className={styles.statL}>Inspections conducted</div>
              </div>
              <div>
                <div className={styles.statN}>98%</div>
                <div className={styles.statL}>Client satisfaction rate</div>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className={styles.contactCard}>
            <div className={styles.ccLbl}>Prefer to Speak with Us?</div>
            <div className={styles.ccRow}>
              <div className={styles.ccIcon}>
                <svg width="13" height="13" fill="none" stroke="rgba(192,168,112,.5)" strokeWidth="1.4" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 .02h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                </svg>
              </div>
              <div className={styles.ccInfo}>
                <strong>+234 9167619009</strong>
                Mon – Fri, 9am – 6pm WAT
              </div>
            </div>
            <div className={styles.ccRow}>
              <div className={styles.ccIcon}>
                <svg width="13" height="13" fill="none" stroke="rgba(192,168,112,.5)" strokeWidth="1.4" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className={styles.ccInfo}>
                <strong>listings@rokhaven.com</strong>
                We respond within 24 hours
              </div>
            </div>
          </div>
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
