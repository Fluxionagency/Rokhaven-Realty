'use client';

import { useState, useCallback } from 'react';
import styles from './page.module.css';

// ─── TYPES ─────────────────────────────────────────────────────────────────

type Section = 'dashboard' | 'listings' | 'bookings' | 'leads' | 'reminders' | 'settings';
type BookingTab = 'calendar' | 'link' | 'inspections';
type SettingsTab = 'integration' | 'team' | 'notifications' | 'account';
type ListingFilter = 'All' | 'Active' | 'Rented' | 'Sold' | 'Pending';
type LeadStatus = 'New' | 'Contacted' | 'Booked' | 'Closed';

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const IMGS = {
  a: 'photo-1613490493576-7fde63acd811',
  b: 'photo-1600596542815-ffad4c1539a9',
  c: 'photo-1600585154340-be6161a56a0c',
  d: 'photo-1512917774080-9991f1c4c750',
  e: 'photo-1560448204-e02f11c3d0e2',
  f: 'photo-1564013799919-ab600027ffc6',
};

function img(id: string, w = 200) {
  return `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;
}

const PROPERTIES = [
  { id: 'grand-arkadia', name: 'The Grand Arkadia', loc: 'Banana Island', price: '₦1,200,000,000', beds: 6, baths: 6, sqm: 1800, img: IMGS.a, status: 'Active', badge: 'Featured' },
  { id: 'oceanfront-penthouse', name: 'Oceanfront Penthouse', loc: 'Victoria Island', price: '₦780,000,000', beds: 4, baths: 4, sqm: 950, img: IMGS.b, status: 'Active', badge: 'New' },
  { id: 'prestige-court', name: 'Prestige Court, Ikoyi', loc: 'Ikoyi', price: '₦450,000,000', beds: 5, baths: 5, sqm: 1200, img: IMGS.c, status: 'Active', badge: 'Featured' },
  { id: 'eko-atlantic', name: 'Eko Atlantic Residence', loc: 'Eko Atlantic', price: '₦920,000,000', beds: 5, baths: 5, sqm: 1350, img: IMGS.d, status: 'Active', badge: '' },
  { id: 'meridian-lekki', name: 'The Meridian, Lekki', loc: 'Lekki Phase 1', price: '₦320,000,000', beds: 4, baths: 4, sqm: 750, img: IMGS.e, status: 'Pending', badge: 'New' },
  { id: 'harbour-view', name: 'Harbour View Estate', loc: 'Lekki Phase 2', price: '₦580,000,000', beds: 6, baths: 5, sqm: 1600, img: IMGS.f, status: 'Active', badge: 'Featured' },
];

const INSPECTIONS = [
  { ref: 'RH-001', client: 'Adaeze Okonkwo', phone: '+234 803 441 7829', property: 'The Grand Arkadia', loc: 'Banana Island', date: 'Fri 22 May', time: '11:00 AM', status: 'Pending', notes: 'Client prefers morning slots', img: IMGS.a },
  { ref: 'RH-002', client: 'Emeka Obiora', phone: '+234 816 902 3340', property: 'Oceanfront Penthouse', loc: 'Victoria Island', date: 'Tue 19 May', time: '10:00 AM', status: 'Confirmed', notes: 'Confirmed via WhatsApp', img: IMGS.b },
  { ref: 'RH-003', client: 'Chidinma Eze', phone: '+234 705 114 6682', property: 'Prestige Court, Ikoyi', loc: 'Ikoyi', date: 'Mon 18 May', time: '2:00 PM', status: 'Completed', notes: 'Interested, awaiting decision', img: IMGS.c },
  { ref: 'RH-004', client: 'Babatunde Afolabi', phone: '+234 901 557 2290', property: 'The Meridian, Lekki', loc: 'Lekki Phase 1', date: 'Wed 20 May', time: '3:00 PM', status: 'Pending', notes: 'Referred by a friend', img: IMGS.f },
  { ref: 'RH-005', client: 'Ngozi Okafor-Williams', phone: '+234 812 330 9954', property: 'Eko Atlantic Residence', loc: 'Eko Atlantic', date: 'Thu 21 May', time: '2:00 PM', status: 'Confirmed', notes: 'Cash buyer, serious interest', img: IMGS.d },
  { ref: 'RH-006', client: 'Adeola Sanni', phone: '+234 703 882 5501', property: 'Harbour View Estate', loc: 'Lekki Phase 2', date: 'Fri 23 May', time: '9:00 AM', status: 'Pending', notes: '', img: IMGS.e },
];

type Lead = { name: string; property: string; date: string; status: LeadStatus };
const LEADS: Lead[] = [
  { name: 'Adaeze Okonkwo', property: 'The Grand Arkadia', date: '2 hours ago', status: 'New' },
  { name: 'Tunde Adeyemi', property: 'General Enquiry', date: '5 hours ago', status: 'New' },
  { name: 'Funke Balogun', property: 'Oceanfront Penthouse', date: 'Yesterday', status: 'New' },
  { name: 'Emeka Obiora', property: 'Oceanfront Penthouse', date: '✓ Called · 2 days ago', status: 'Contacted' },
  { name: 'Ngozi Okafor-Williams', property: 'Eko Atlantic Residence', date: '✓ WhatsApp · Yesterday', status: 'Contacted' },
  { name: 'Babatunde Afolabi', property: 'The Meridian, Lekki', date: '📅 Wed 20 May, 3pm', status: 'Booked' },
  { name: 'Chidinma Eze', property: 'Prestige Court', date: '📅 Mon 18 May (done)', status: 'Booked' },
  { name: 'Adeola Sanni', property: 'Harbour View Estate', date: '✓ Sale completed', status: 'Closed' },
  { name: 'Rotimi Fashola', property: 'Sky Manor, Ikeja GRA', date: '✓ Lease signed', status: 'Closed' },
];

const REMINDERS = [
  { client: 'Babatunde Afolabi', phone: '+234 901 557 2290', property: 'The Meridian, Lekki', loc: 'Lekki Phase 1', date: 'Wed 20 May, 3:00pm', h48: 'sent', h24: 'pending', h2: 'pending' },
  { client: 'Emeka Obiora', phone: '+234 816 902 3340', property: 'Oceanfront Penthouse', loc: 'Victoria Island', date: 'Fri 22 May, 10:00am', h48: 'sent', h24: 'sent', h2: 'pending' },
  { client: 'Ngozi Okafor-Williams', phone: '+234 812 330 9954', property: 'Eko Atlantic Residence', loc: 'Eko Atlantic', date: 'Mon 25 May, 2:00pm', h48: 'pending', h24: 'pending', h2: 'pending' },
];

const CALENDAR_BOOKINGS: Record<string, { n: string; t: string }[]> = {
  '2026-05-19': [{ n: 'Emeka Obiora', t: '10am' }],
  '2026-05-20': [{ n: 'Babatunde Afolabi', t: '3pm' }],
  '2026-05-21': [{ n: 'Ngozi O-W.', t: '2pm' }],
  '2026-05-22': [{ n: 'Adaeze Okonkwo', t: '11am' }],
  '2026-05-27': [{ n: 'Chidinma Eze', t: '11am' }],
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EMAIL_PROVIDERS = [
  { id: 'sendgrid', name: 'SendGrid', desc: "Twilio's reliable transactional email API" },
  { id: 'mailgun', name: 'Mailgun', desc: 'High-deliverability email for developers' },
  { id: 'mailchimp', name: 'Mailchimp Transactional', desc: 'Mandrill — powerful email automation' },
  { id: 'ses', name: 'Amazon SES', desc: 'AWS scalable email infrastructure' },
  { id: 'postmark', name: 'Postmark', desc: 'Fast, developer-first transactional email' },
  { id: 'brevo', name: 'Brevo (Sendinblue)', desc: 'Email + SMS marketing in one platform' },
  { id: 'resend', name: 'Resend', desc: 'Modern email API built for developers' },
  { id: 'smtp', name: 'Custom SMTP', desc: 'Gmail, Zoho, Outlook, or any SMTP server' },
];

const NOTIFS = [
  { label: 'New enquiry submitted via website', email: true, whatsapp: true, sms: false },
  { label: 'Inspection booking confirmed', email: true, whatsapp: true, sms: true },
  { label: 'Inspection rescheduled or cancelled', email: true, whatsapp: false, sms: false },
  { label: 'New listing goes live', email: true, whatsapp: false, sms: false },
  { label: 'Lead moved to a new pipeline stage', email: false, whatsapp: true, sms: false },
  { label: 'Automated reminder sent to client', email: true, whatsapp: false, sms: false },
  { label: 'Weekly leads summary report', email: true, whatsapp: false, sms: false },
];

// ─── SMALL REUSABLE COMPONENTS ──────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const cls = status === 'Confirmed' ? styles.bConfirmed : status === 'Completed' ? styles.bCompleted : styles.bPending;
  return <span className={`${styles.badge} ${cls}`}>{status}</span>;
}

function PropThumbRow({ imgId, name, loc }: { imgId: string; name: string; loc: string }) {
  return (
    <div className={styles.propRow}>
      <div className={styles.propThumb}>
        <img src={img(imgId, 120)} alt={name} />
      </div>
      <div>
        <div className={styles.propNameCell}>{name}</div>
        <div className={styles.propLocCell}>{loc}</div>
      </div>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        background: on ? 'var(--gold)' : 'rgba(255,255,255,0.12)',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: on ? '#060F1C' : 'rgba(244,237,224,0.4)',
          transition: 'left 0.2s',
          display: 'block',
        }}
      />
    </button>
  );
}

// ─── ICONS ──────────────────────────────────────────────────────────────────

const IconDashboard = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconListings = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" />
  </svg>
);
const IconBookings = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconLeads = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconReminders = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const IconSettings = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const IconPlus = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── LOGIN SCREEN ───────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailErr, setEmailErr] = useState(false);
  const [passErr, setPassErr] = useState(false);

  const handleLogin = () => {
    setError('');
    setEmailErr(false);
    setPassErr(false);
    if (email === 'admin@rokhaven.com' && password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid email or password. Please try again.');
      setEmailErr(true);
      setPassErr(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className={styles.loginOverlay}>
      <div className={styles.loginWrap}>
        <div className={styles.loginLogo}>
          <svg width="26" height="26" viewBox="0 0 60 60" fill="#C0A870">
            <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
          </svg>
          <div>
            <div className={styles.loginLogoWm}>ROKHAVEN</div>
            <div className={styles.loginLogoSm}>REALTY</div>
          </div>
        </div>
        <div className={styles.loginH}>Admin Access</div>
        <div className={styles.loginSub}>Authorised personnel only.</div>
        <label className={styles.loginLbl}>Email Address</label>
        <input
          className={`${styles.loginIn} ${emailErr ? styles.loginInError : ''}`}
          type="email"
          placeholder="admin@rokhaven.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <label className={styles.loginLbl}>Password</label>
        <input
          className={`${styles.loginIn} ${passErr ? styles.loginInError : ''}`}
          type="password"
          placeholder="••••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {error && <div className={styles.loginError}>{error}</div>}
        <button className={styles.loginBtn} onClick={handleLogin} style={{ marginTop: error ? 12 : 0 }}>
          Sign In →
        </button>
        <div className={styles.loginForgot}>Forgot your password?</div>
        <div className={styles.loginSecure}>
          <svg width="9" height="11" viewBox="0 0 10 12" fill="rgba(244,237,224,.25)">
            <path d="M5 0C3.34 0 2 1.34 2 3v1H1C.45 4 0 4.45 0 5v6c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1H8V3C8 1.34 6.66 0 5 0zm0 1.5c.83 0 1.5.67 1.5 1.5v1h-3V3c0-.83.67-1.5 1.5-1.5z" />
          </svg>
          Secured connection
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD SECTION ──────────────────────────────────────────────────────

function DashboardSection({ onNav }: { onNav: (section: Section) => void }) {
  return (
    <div>
      <div className={styles.stats}>
        <div className={styles.sc}>
          <span className={`${styles.scDelta} ${styles.up}`}>↑ 3 this week</span>
          <div className={styles.scNum}>12</div>
          <div className={styles.scLbl}>Active Listings</div>
        </div>
        <div className={styles.sc}>
          <span className={`${styles.scDelta} ${styles.pend}`}>3 today</span>
          <div className={styles.scNum}>3</div>
          <div className={styles.scLbl}>Inspections Today</div>
        </div>
        <div className={styles.sc}>
          <span className={`${styles.scDelta} ${styles.up}`}>↑ 42% MoM</span>
          <div className={styles.scNum}>8</div>
          <div className={styles.scLbl}>New Enquiries</div>
        </div>
        <div className={styles.sc}>
          <span className={`${styles.scDelta} ${styles.up}`}>↑ 18% MoM</span>
          <div className={styles.scNum}>₦2.4B</div>
          <div className={styles.scLbl}>Revenue</div>
        </div>
      </div>

      <div className={styles.secHdr}>
        <div className={styles.secTitle}>Recent Inspections</div>
        <button className={styles.secLink} onClick={() => onNav('bookings')}>View all →</button>
      </div>
      <div className={styles.tblWrap}>
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Client</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ width: 160 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><PropThumbRow imgId={IMGS.a} name="The Grand Arkadia" loc="Banana Island" /></td>
              <td className={styles.strong}>Adaeze Okonkwo</td>
              <td>Fri 22 May</td>
              <td><Badge status="Pending" /></td>
              <td><div className={styles.rowActions}><button className={styles.raBtn}>Confirm</button><button className={styles.raBtn}>View</button></div></td>
            </tr>
            <tr>
              <td><PropThumbRow imgId={IMGS.b} name="Oceanfront Penthouse" loc="Victoria Island" /></td>
              <td className={styles.strong}>Emeka Obiora</td>
              <td>Tue 19 May</td>
              <td><Badge status="Confirmed" /></td>
              <td><div className={styles.rowActions}><button className={styles.raBtn}>View</button><button className={styles.raBtn}>Reschedule</button></div></td>
            </tr>
            <tr>
              <td><PropThumbRow imgId={IMGS.c} name="Prestige Court, Ikoyi" loc="Ikoyi" /></td>
              <td className={styles.strong}>Chidinma Eze</td>
              <td>Mon 18 May</td>
              <td><Badge status="Completed" /></td>
              <td><div className={styles.rowActions}><button className={styles.raBtn}>View</button><button className={styles.raBtn}>Follow up</button></div></td>
            </tr>
            <tr>
              <td><PropThumbRow imgId={IMGS.f} name="The Meridian, Lekki" loc="Lekki Phase 1" /></td>
              <td className={styles.strong}>Babatunde Afolabi</td>
              <td>Wed 20 May</td>
              <td><Badge status="Pending" /></td>
              <td><div className={styles.rowActions}><button className={styles.raBtn}>Confirm</button><button className={styles.raBtn}>View</button></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.secHdr}>
        <div className={styles.secTitle}>Active Listings</div>
        <button className={styles.secLink} onClick={() => onNav('listings')}>Manage all →</button>
      </div>
      <div className={styles.lgrid}>
        {PROPERTIES.slice(0, 6).map(p => (
          <div key={p.id} className={styles.lcard}>
            <div className={styles.lcardImg}>
              <img src={img(p.img, 400)} alt={p.name} />
              {p.badge && <div className={styles.lbadge}>{p.badge}</div>}
            </div>
            <div className={styles.lcardBody}>
              <div className={styles.lcardName}>{p.name}</div>
              <div className={styles.lcardPrice}>{p.price}</div>
              <div className={styles.lcardMeta}>{p.loc} · {p.beds} Beds · For Sale</div>
              <div className={styles.lcardActions}>
                <button className={styles.lcbtn}>Edit</button>
                <button className={styles.lcbtn}>Mark Sold</button>
                <button className={styles.lcbtn}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LISTINGS SECTION ───────────────────────────────────────────────────────

function ListingsSection() {
  const [filter, setFilter] = useState<ListingFilter>('All');
  const filters: ListingFilter[] = ['All', 'Active', 'Rented', 'Sold', 'Pending'];
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = filter === 'All' ? PROPERTIES : PROPERTIES.filter(p => p.status === filter);

  return (
    <div>
      <div className={styles.secHdr} style={{ marginBottom: 20 }}>
        <div className={styles.secTitle}>All Listings</div>
        <button className={styles.btnAdd} style={{ fontSize: 11, padding: '8px 16px' }}>
          <IconPlus /> Add New
        </button>
      </div>
      <div className={styles.subTabs} style={{ marginBottom: 20 }}>
        {filters.map(f => (
          <button
            key={f}
            className={`${styles.stab} ${filter === f ? styles.stabOn : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className={styles.tblWrap} style={{ marginBottom: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Status</th>
              <th>Details</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className={styles.propThumb} style={{ width: 56, height: 40 }}>
                      <img src={img(p.img, 200)} alt={p.name} />
                    </div>
                    <div>
                      <div className={styles.propNameCell}>{p.name}</div>
                      <div className={styles.propLocCell}>{p.loc}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${p.status === 'Active' ? styles.bConfirmed : p.status === 'Pending' ? styles.bPending : styles.bCompleted}`}>
                    {p.status}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'rgba(244,237,224,0.45)' }}>
                  {p.beds} Beds · {p.baths} Baths · {p.sqm} sqm
                </td>
                <td>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      className={styles.raBtn}
                      style={{ opacity: 1 }}
                      onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                    >
                      Actions ▾
                    </button>
                    {openMenu === p.id && (
                      <div style={{
                        position: 'absolute', top: '100%', right: 0, zIndex: 200, marginTop: 4,
                        background: '#0D1E30', border: '1px solid rgba(192,168,112,0.15)',
                        borderRadius: 3, minWidth: 160, overflow: 'hidden',
                      }}>
                        {['Mark as Rented', 'Mark as Sold', 'Deactivate', 'Delete'].map(action => (
                          <button
                            key={action}
                            onClick={() => setOpenMenu(null)}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '10px 14px', background: 'none', border: 'none',
                              color: action === 'Delete' ? 'rgba(224,112,112,0.7)' : 'rgba(244,237,224,0.55)',
                              fontSize: 12, cursor: 'pointer', fontFamily: 'var(--fb)',
                            }}
                            onMouseOver={e => (e.currentTarget.style.background = 'rgba(192,168,112,0.06)')}
                            onMouseOut={e => (e.currentTarget.style.background = 'none')}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.lgrid}>
        {filtered.map(p => (
          <div key={p.id} className={styles.lcard}>
            <div className={styles.lcardImg}>
              <img src={img(p.img, 400)} alt={p.name} />
              {p.badge && <div className={styles.lbadge}>{p.badge}</div>}
            </div>
            <div className={styles.lcardBody}>
              <div className={styles.lcardName}>{p.name}</div>
              <div className={styles.lcardPrice}>{p.price}</div>
              <div className={styles.lcardMeta}>{p.loc} · {p.beds} Beds · For Sale</div>
              <div className={styles.lcardActions}>
                <button className={styles.lcbtn}>Edit</button>
                <button className={styles.lcbtn}>Sold</button>
                <button className={styles.lcbtn}>Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CALENDAR TAB ───────────────────────────────────────────────────────────

function CalendarTab() {
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(4); // May = index 4

  const navCal = (dir: number) => {
    let m = calMonth + dir;
    let y = calYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setCalMonth(m);
    setCalYear(y);
  };

  const today = new Date();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  const calCells: React.ReactElement[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    calCells.push(
      <div key={`prev-${i}`} className={`${styles.calDay} ${styles.calOther} ${styles.calWe}`}>
        <div className={styles.calDn}>{prevMonthDays - i}</div>
      </div>
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dow = new Date(calYear, calMonth, day).getDay();
    const isWe = dow === 0 || dow === 6;
    const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day;
    const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const bookings = CALENDAR_BOOKINGS[key] || [];
    const classes = [styles.calDay, isWe ? styles.calWe : '', isToday ? styles.calToday : ''].filter(Boolean).join(' ');
    calCells.push(
      <div key={day} className={classes}>
        <div className={styles.calDn}>{day}</div>
        {bookings.map((b, bi) => (
          <div key={bi} className={styles.calBooking}>
            <span style={{ fontWeight: 500 }}>{b.n}</span><br />{b.t}
          </div>
        ))}
        {!isWe && bookings.length === 0 && (
          <div style={{ fontSize: 9, color: 'rgba(82,112,112,0.65)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', flexShrink: 0 }} />
            3 slots free
          </div>
        )}
      </div>
    );
  }

  const remaining = (7 - ((firstDay + daysInMonth) % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calCells.push(
      <div key={`next-${i}`} className={`${styles.calDay} ${styles.calOther} ${styles.calWe}`}>
        <div className={styles.calDn}>{i}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, gap: 14 }}>
        <label style={{ fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,0.42)', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
          Filter Property
        </label>
        <select className={styles.fsel} style={{ width: 240, padding: '7px 12px', fontSize: 13 }}>
          <option value="">All Properties</option>
          {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className={styles.calControls}>
        <div className={styles.calMonth}>{MONTHS[calMonth]} {calYear}</div>
        <div className={styles.calNavBtns}>
          <button className={styles.calBtn} onClick={() => navCal(-1)}>‹</button>
          <button className={`${styles.calBtn} ${styles.calTodayBtn}`} onClick={() => { setCalMonth(4); setCalYear(2026); }}>Today</button>
          <button className={styles.calBtn} onClick={() => navCal(1)}>›</button>
        </div>
      </div>
      <div className={styles.calGridHdr}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className={styles.calDh}>{d}</div>
        ))}
      </div>
      <div className={styles.calGrid}>{calCells}</div>
      <div className={styles.calLegend}>
        <div className={styles.calLi}>
          <div className={styles.calDot} style={{ background: 'rgba(192,168,112,0.12)', border: '1px solid rgba(192,168,112,0.28)' }} />
          Booked inspection
        </div>
        <div className={styles.calLi}>
          <div className={styles.calDot} style={{ background: 'rgba(82,112,112,0.18)', border: '1px solid rgba(82,112,112,0.32)' }} />
          Available slots
        </div>
        <div className={styles.calLi}>
          <div className={styles.calDot} style={{ border: '1.5px solid var(--gold)' }} />
          Today
        </div>
      </div>
    </div>
  );
}

// ─── GENERATE LINK TAB ──────────────────────────────────────────────────────

function GenerateLinkTab() {
  const [propVal, setPropVal] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [note, setNote] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const slug = propVal || 'general';
    const namePart = clientName ? '-' + clientName.split(' ')[0].toLowerCase() : '';
    const url = `rokhaven.com/book/${slug}${namePart}`;
    setGeneratedUrl(url);
    setCopied(false);
  };

  const handleCopy = useCallback(() => {
    if (generatedUrl) {
      navigator.clipboard.writeText('https://' + generatedUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedUrl]);

  return (
    <div className={styles.genLayout}>
      <div className={styles.formCard}>
        <div className={styles.fcTitle}>Generate Inspection Link</div>
        <div className={styles.fcSub}>
          Create a personalised, branded booking link to send directly to a client via WhatsApp, Instagram, or any channel.
        </div>
        <div className={styles.fgBlock}>
          <label>Select Property <span style={{ color: 'rgba(192,168,112,0.3)', fontWeight: 300 }}>— or leave blank for general enquiry</span></label>
          <select className={styles.fsel} value={propVal} onChange={e => setPropVal(e.target.value)}>
            <option value="">General Enquiry (no specific property)</option>
            {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name} — {p.loc}</option>)}
          </select>
        </div>
        <div className={styles.fgBlock}>
          <label>Client Name <span style={{ color: 'rgba(192,168,112,0.3)', fontWeight: 300 }}>— Optional</span></label>
          <input className={styles.fi} placeholder="e.g. Adaeze Okonkwo" value={clientName} onChange={e => setClientName(e.target.value)} />
        </div>
        <div className={styles.fgBlock}>
          <label>Client Phone <span style={{ color: 'rgba(192,168,112,0.3)', fontWeight: 300 }}>— Optional</span></label>
          <input className={styles.fi} type="tel" placeholder="+234 — — — — —" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
        </div>
        <div className={styles.fgBlock}>
          <label>Expiry Date <span style={{ color: 'rgba(192,168,112,0.3)', fontWeight: 300 }}>— Optional</span></label>
          <input className={styles.fi} type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
        </div>
        <div className={styles.fgBlock}>
          <label>Note to Client <span style={{ color: 'rgba(192,168,112,0.3)', fontWeight: 300 }}>— Optional</span></label>
          <textarea className={styles.fta} rows={3} placeholder="e.g. Hi Adaeze, please use this link to schedule your viewing at your convenience." value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <button className={styles.btnGen} onClick={handleGenerate}>Generate Booking Link →</button>
      </div>

      <div className={`${styles.linkResult} ${!generatedUrl ? styles.linkResultDim : ''}`}>
        <div>
          <div className={styles.linkLabel}>Generated Booking Link</div>
          <div className={styles.linkBox}>
            <div className={styles.linkUrl}>
              {generatedUrl || 'rokhaven.com/book/——————'}
            </div>
            <button className={`${styles.btnCopy} ${copied ? styles.btnCopied : ''}`} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className={styles.linkExpiry}>
            <svg width="11" height="11" fill="none" stroke="rgba(192,168,112,0.3)" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Expires in 7 days
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className={styles.btnWa}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.8 9.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
            </svg>
            Share via WhatsApp
          </button>
          <button className={styles.btnOutlineLink} onClick={handleCopy}>Copy Link Only</button>
        </div>
        <div>
          <div className={styles.linkLabel}>QR Code</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 18, background: 'rgba(11,27,53,0.4)', border: '1px solid rgba(192,168,112,0.1)', borderRadius: 3 }}>
            <div style={{ background: '#fff', padding: 8, borderRadius: 2 }}>
              <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white" />
                <rect x="5" y="5" width="35" height="35" fill="#0B1B35" />
                <rect x="10" y="10" width="25" height="25" fill="white" />
                <rect x="14" y="14" width="17" height="17" fill="#C0A870" />
                <rect x="60" y="5" width="35" height="35" fill="#0B1B35" />
                <rect x="65" y="10" width="25" height="25" fill="white" />
                <rect x="69" y="14" width="17" height="17" fill="#C0A870" />
                <rect x="5" y="60" width="35" height="35" fill="#0B1B35" />
                <rect x="10" y="65" width="25" height="25" fill="white" />
                <rect x="14" y="69" width="17" height="17" fill="#C0A870" />
                {[0,1,2,3,4,5,6,7].map(r =>
                  [0,1,2,3,4,5,6,7].map(c =>
                    (r + c) % 2 === 0 ? (
                      <rect key={`${r}-${c}`} x={44 + c * 6} y={44 + r * 6} width={5} height={5} fill="#0B1B35" />
                    ) : null
                  )
                )}
              </svg>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(244,237,224,0.28)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Scan to open booking form
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ALL INSPECTIONS TAB ────────────────────────────────────────────────────

function InspectionsTab() {
  const [statusFilter, setStatusFilter] = useState('All');
  const statuses = ['All', 'Pending', 'Confirmed', 'Completed'];
  const filtered = statusFilter === 'All' ? INSPECTIONS : INSPECTIONS.filter(i => i.status === statusFilter);

  return (
    <div>
      <div className={styles.secHdr} style={{ marginBottom: 16 }}>
        <div className={styles.secTitle}>All Inspection Requests</div>
        <button className={styles.secLink}>Export CSV →</button>
      </div>
      <div className={styles.subTabs}>
        {statuses.map(s => (
          <button key={s} className={`${styles.stab} ${statusFilter === s ? styles.stabOn : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>
      <div className={styles.tblWrap}>
        <table>
          <thead>
            <tr>
              <th>Ref No.</th>
              <th>Client</th>
              <th>Property</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Notes</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(insp => (
              <tr key={insp.ref}>
                <td style={{ color: 'rgba(192,168,112,0.5)', fontSize: 11 }}>{insp.ref}</td>
                <td className={styles.strong}>
                  {insp.client}<br />
                  <span style={{ fontSize: 10, color: 'rgba(244,237,224,0.3)', fontWeight: 300 }}>{insp.phone}</span>
                </td>
                <td><PropThumbRow imgId={insp.img} name={insp.property} loc={insp.loc} /></td>
                <td>{insp.date}</td>
                <td>{insp.time}</td>
                <td><Badge status={insp.status} /></td>
                <td style={{ fontSize: 11, color: 'rgba(244,237,224,0.35)', maxWidth: 140 }}>{insp.notes || '—'}</td>
                <td>
                  <div className={styles.rowActions}>
                    {insp.status === 'Pending' && <button className={styles.raBtn}>Confirm</button>}
                    <button className={styles.raBtn}>View</button>
                    <button className={styles.raBtn}>Reschedule</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── BOOKINGS SECTION ───────────────────────────────────────────────────────

function BookingsSection() {
  const [tab, setTab] = useState<BookingTab>('calendar');

  return (
    <div>
      <div className={styles.subTabs}>
        <button className={`${styles.stab} ${tab === 'calendar' ? styles.stabOn : ''}`} onClick={() => setTab('calendar')}>📅 Calendar</button>
        <button className={`${styles.stab} ${tab === 'link' ? styles.stabOn : ''}`} onClick={() => setTab('link')}>🔗 Generate Booking Link</button>
        <button className={`${styles.stab} ${tab === 'inspections' ? styles.stabOn : ''}`} onClick={() => setTab('inspections')}>📋 All Inspections</button>
      </div>
      {tab === 'calendar' && <CalendarTab />}
      {tab === 'link' && <GenerateLinkTab />}
      {tab === 'inspections' && <InspectionsTab />}
    </div>
  );
}

// ─── LEADS SECTION ──────────────────────────────────────────────────────────

function LeadsSection() {
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const columns: { key: LeadStatus; label: string }[] = [
    { key: 'New', label: 'New Leads' },
    { key: 'Contacted', label: 'Contacted' },
    { key: 'Booked', label: 'Inspection Booked' },
    { key: 'Closed', label: 'Closed' },
  ];

  const moveLead = (leadName: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(l => l.name === leadName ? { ...l, status: newStatus } : l));
  };

  return (
    <div>
      <div className={styles.secHdr} style={{ marginBottom: 20 }}>
        <div className={styles.secTitle}>Leads Pipeline</div>
        <button className={styles.secLink}>Export →</button>
      </div>
      <div className={styles.leadsGrid}>
        {columns.map(col => {
          const colLeads = leads.filter(l => l.status === col.key);
          return (
            <div key={col.key} className={styles.pipeCol}>
              <div className={styles.pipeHead}>
                {col.label}
                <span className={styles.pipeCount}>{colLeads.length}</span>
              </div>
              {colLeads.map((lead, i) => (
                <div key={i} className={styles.leadCard}>
                  <div className={styles.leadName}>{lead.name}</div>
                  <div className={styles.leadProp}>{lead.property}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                    <div className={styles.leadTime} style={col.key === 'Closed' ? { color: '#5DC882' } : {}}>
                      {lead.date}
                    </div>
                    <select
                      className={styles.fsel}
                      style={{ width: 'auto', padding: '3px 26px 3px 8px', fontSize: 10, border: '1px solid rgba(192,168,112,0.18)' }}
                      value={lead.status}
                      onChange={e => moveLead(lead.name, e.target.value as LeadStatus)}
                    >
                      {columns.map(c => <option key={c.key} value={c.key}>Move → {c.label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REMINDERS SECTION ──────────────────────────────────────────────────────

function RemindersSection() {
  const [emailToggles, setEmailToggles] = useState<boolean[]>(REMINDERS.map(() => true));
  const [waToggles, setWaToggles] = useState<boolean[]>(REMINDERS.map(() => true));

  return (
    <div>
      <div className={styles.secHdr} style={{ marginBottom: 20 }}>
        <div className={styles.secTitle}>Inspection Reminders</div>
      </div>
      <div className={styles.tblWrap}>
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Property</th>
              <th>Inspection Date</th>
              <th>Reminder Sent</th>
              <th>Email</th>
              <th>WhatsApp</th>
              <th style={{ width: 200 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {REMINDERS.map((r, i) => (
              <tr key={i}>
                <td className={styles.strong}>
                  {r.client}<br />
                  <span style={{ fontSize: 10, color: 'rgba(244,237,224,0.3)', fontWeight: 300 }}>{r.phone}</span>
                </td>
                <td>
                  <div className={styles.propNameCell}>{r.property}</div>
                  <div className={styles.propLocCell}>{r.loc}</div>
                </td>
                <td>{r.date}</td>
                <td>
                  <div className={styles.remStatus}>
                    <span className={`${styles.remPill} ${r.h48 === 'sent' ? styles.remSent : styles.remPending}`}>
                      48hr {r.h48 === 'sent' ? '✓' : '⏳'}
                    </span>
                    <span className={`${styles.remPill} ${r.h24 === 'sent' ? styles.remSent : styles.remPending}`}>
                      24hr {r.h24 === 'sent' ? '✓' : '⏳'}
                    </span>
                    <span className={`${styles.remPill} ${r.h2 === 'sent' ? styles.remSent : styles.remPending}`}>
                      2hr {r.h2 === 'sent' ? '✓' : '⏳'}
                    </span>
                  </div>
                </td>
                <td>
                  <Toggle on={emailToggles[i]} onToggle={() => setEmailToggles(prev => prev.map((v, idx) => idx === i ? !v : v))} />
                </td>
                <td>
                  <Toggle on={waToggles[i]} onToggle={() => setWaToggles(prev => prev.map((v, idx) => idx === i ? !v : v))} />
                </td>
                <td>
                  <div className={styles.rowActions} style={{ opacity: 1 }}>
                    <button className={styles.raBtn}>Resend</button>
                    <button className={styles.raBtn}>Reschedule</button>
                    <button className={`${styles.raBtn} ${styles.raDel}`}>Cancel</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.reminderSchedule}>
        <div className={styles.intSectionLabel}>Automated Reminder Schedule</div>
        <div className={styles.reminderScheduleRow}>
          {[
            { label: '48 hours before', channels: 'WhatsApp + Email + SMS' },
            { label: '24 hours before', channels: 'WhatsApp + Email + SMS' },
            { label: '2 hours before', channels: 'WhatsApp + SMS' },
          ].map(r => (
            <div key={r.label} className={styles.reminderItem}>
              <div className={styles.reminderDot} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--ivory)', fontWeight: 400 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.3)' }}>{r.channels}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS: INTEGRATION TAB ──────────────────────────────────────────────

function IntegrationTab() {
  const [calConnected, setCalConnected] = useState<Record<string, boolean>>({ google: false, outlook: false, apple: false });
  const [msgConnected, setMsgConnected] = useState<Record<string, boolean>>({ whatsapp: true, telegram: false, instagram: false });
  const [crmConnected, setCrmConnected] = useState<Record<string, boolean>>({ salesforce: false, hubspot: false, zapier: false });
  const [activeEmail, setActiveEmail] = useState('sendgrid');

  function IntCard({ icon, iconBg, name, desc, connected, onConnect }: {
    icon: React.ReactNode; iconBg: string; name: string; desc: string; connected: boolean; onConnect: () => void;
  }) {
    return (
      <div className={styles.intCard}>
        <div className={styles.intIcon} style={{ background: iconBg }}>{icon}</div>
        <div className={styles.intInfo}>
          <div className={styles.intName}>{name}</div>
          <div className={styles.intDesc}>{desc}</div>
        </div>
        <button
          className={`${styles.intBtn} ${connected ? styles.intBtnConnected : ''}`}
          onClick={connected ? undefined : onConnect}
        >
          {connected ? '✓ Connected' : 'Connect →'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.spTitle}>Integrations</div>
      <div className={styles.spSub}>Connect RokHaven to external services to automate your booking workflow, calendar sync, and client communications.</div>

      <div className={styles.intSectionLabel}>📅 Calendar</div>
      <IntCard
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
        iconBg="#4285F4" name="Google Calendar"
        desc="Sync confirmed inspections automatically. New bookings appear as calendar events with full client and property details."
        connected={calConnected.google} onConnect={() => setCalConnected(p => ({ ...p, google: true }))}
      />
      <IntCard icon="📅" iconBg="#0078D4" name="Microsoft Outlook / Office 365"
        desc="Connect your Outlook calendar for automatic inspection scheduling and team-wide calendar visibility."
        connected={calConnected.outlook} onConnect={() => setCalConnected(p => ({ ...p, outlook: true }))}
      />
      <IntCard icon="📱" iconBg="#1a73e8" name="Apple Calendar (iCal)"
        desc="Sync inspections to Apple Calendar via iCal feed. Compatible with iOS and macOS Calendar apps."
        connected={calConnected.apple} onConnect={() => setCalConnected(p => ({ ...p, apple: true }))}
      />

      <div className={`${styles.intSectionLabel} ${styles.intSectionLabelSpaced}`}>💬 Messaging</div>
      <IntCard
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.8 9.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>}
        iconBg="#25D366" name="WhatsApp Business API"
        desc="Send automated inspection reminders, booking confirmations, and follow-up messages via WhatsApp."
        connected={msgConnected.whatsapp} onConnect={() => setMsgConnected(p => ({ ...p, whatsapp: true }))}
      />
      <IntCard icon="✈️" iconBg="#0088CC" name="Telegram Bot"
        desc="Send booking notifications and reminders via Telegram to clients who prefer it."
        connected={msgConnected.telegram} onConnect={() => setMsgConnected(p => ({ ...p, telegram: true }))}
      />
      <IntCard icon="📸" iconBg="#E4405F" name="Instagram Direct (via Meta API)"
        desc="Receive and reply to Instagram DM enquiries directly from the RokHaven dashboard."
        connected={msgConnected.instagram} onConnect={() => setMsgConnected(p => ({ ...p, instagram: true }))}
      />

      <div className={`${styles.intSectionLabel} ${styles.intSectionLabelSpaced}`}>✉️ Email Provider</div>
      <div className={styles.emailProviderWrapper}>
        <div className={styles.emailProviderNote}>Select your preferred email delivery provider. Only one email provider can be active at a time.</div>
        <div className={styles.emailProviders}>
          {EMAIL_PROVIDERS.map(p => (
            <div
              key={p.id}
              className={`${styles.emailOpt} ${activeEmail === p.id ? styles.emailOptActive : ''}`}
              onClick={() => setActiveEmail(p.id)}
            >
              <div className={styles.eoName}>{p.name}</div>
              <div className={styles.eoDesc}>{p.desc}</div>
              {activeEmail === p.id && <div className={styles.eoBadge}>✓ Active</div>}
            </div>
          ))}
        </div>
        {activeEmail && (
          <div style={{ marginTop: 14 }}>
            <label style={{ display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,0.42)', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 8 }}>
              API Key — {EMAIL_PROVIDERS.find(p => p.id === activeEmail)?.name}
            </label>
            <input className={styles.fi} type="password" placeholder="Enter your API key…" />
          </div>
        )}
      </div>

      <div className={`${styles.intSectionLabel} ${styles.intSectionLabelSpaced}`}>💳 CRM &amp; Other</div>
      <IntCard icon="☁️" iconBg="#00A1E0" name="Salesforce CRM"
        desc="Sync leads and client data to your Salesforce org automatically when new enquiries arrive."
        connected={crmConnected.salesforce} onConnect={() => setCrmConnected(p => ({ ...p, salesforce: true }))}
      />
      <IntCard icon="🔶" iconBg="#FF7A59" name="HubSpot CRM"
        desc="Push new leads and inspection bookings directly into your HubSpot pipeline."
        connected={crmConnected.hubspot} onConnect={() => setCrmConnected(p => ({ ...p, hubspot: true }))}
      />
      <IntCard icon="⚡" iconBg="#6C47FF" name="Zapier"
        desc="Connect RokHaven to 6,000+ apps. Automate anything — Notion, Slack, Sheets, and more."
        connected={crmConnected.zapier} onConnect={() => setCrmConnected(p => ({ ...p, zapier: true }))}
      />
    </div>
  );
}

// ─── SETTINGS: TEAM TAB ─────────────────────────────────────────────────────

function TeamTab() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Agent');
  const [inviteSent, setInviteSent] = useState(false);

  const members = [
    { initials: 'AO', name: 'Amaka Osei', email: 'amaka@rokhaven.com', role: 'Super Admin', status: 'Active', roleColor: 'var(--gold)' },
    { initials: 'TF', name: 'Tola Fashola', email: 'tola@rokhaven.com', role: 'Agent', status: 'Active', roleColor: '#E0B44A' },
    { initials: 'KA', name: 'Kunle Adeyemi', email: 'kunle@rokhaven.com', role: 'Agent', status: 'Active', roleColor: '#E0B44A' },
    { initials: 'BI', name: 'Blessing Ikenna', email: 'blessing@rokhaven.com', role: 'Viewer', status: 'Invited', roleColor: 'var(--teal)' },
  ];

  return (
    <div>
      <div className={styles.spTitle}>Team &amp; Access</div>
      <div className={styles.spSub}>Manage team members and their permission levels within the RokHaven admin.</div>
      <div className={styles.teamHdr}>
        <div className={styles.intSectionLabel} style={{ marginBottom: 0 }}>Team Members ({members.length})</div>
        <button className={styles.intBtn} style={{ fontSize: 10, padding: '6px 14px' }}>+ Invite Member</button>
      </div>
      <div className={styles.tblWrap}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ width: 140 }}></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className={styles.sbAvatar} style={{ width: 30, height: 30, fontSize: 10 }}>{m.initials}</div>
                    <span className={styles.strong}>{m.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'rgba(244,237,224,0.5)' }}>{m.email}</td>
                <td>
                  <span className={styles.badge} style={{ fontSize: 9, color: m.roleColor, background: 'rgba(192,168,112,0.08)', border: '1px solid rgba(192,168,112,0.2)' }}>
                    {m.role}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${m.status === 'Active' ? styles.bConfirmed : styles.bPending}`} style={{ fontSize: 9 }}>
                    {m.status}
                  </span>
                </td>
                <td>
                  <div className={styles.rowActions} style={{ opacity: 1 }}>
                    {i === 0 ? (
                      <button className={styles.raBtn}>Edit</button>
                    ) : m.status === 'Invited' ? (
                      <><button className={styles.raBtn}>Resend</button><button className={`${styles.raBtn} ${styles.raDel}`}>Revoke</button></>
                    ) : (
                      <><button className={styles.raBtn}>Edit</button><button className={`${styles.raBtn} ${styles.raDel}`}>Remove</button></>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid rgba(192,168,112,0.09)', borderRadius: 3, padding: '18px 20px', marginBottom: 20 }}>
        <div className={styles.intSectionLabel} style={{ marginBottom: 12 }}>Role Permissions</div>
        <div className={styles.roleGrid}>
          <div className={styles.roleCard}><div className={styles.roleName} style={{ color: 'var(--gold)' }}>Super Admin</div><div className={styles.roleDesc}>Full access — manage listings, view all leads, configure settings, manage team.</div></div>
          <div className={styles.roleCard}><div className={styles.roleName} style={{ color: '#E0B44A' }}>Agent</div><div className={styles.roleDesc}>View and manage listings and bookings. Cannot access settings or billing.</div></div>
          <div className={styles.roleCard}><div className={styles.roleName} style={{ color: 'var(--teal)' }}>Viewer</div><div className={styles.roleDesc}>Read-only access to listings and dashboard. No editing or exporting.</div></div>
        </div>
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid rgba(192,168,112,0.09)', borderRadius: 3, padding: '18px 20px' }}>
        <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>Invite New Member</div>
        <div className={styles.g2} style={{ marginBottom: 12 }}>
          <div className={styles.fgBlock} style={{ marginBottom: 0 }}>
            <label>Email Address</label>
            <input className={styles.fi} type="email" placeholder="colleague@rokhaven.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
          </div>
          <div className={styles.fgBlock} style={{ marginBottom: 0 }}>
            <label>Role</label>
            <select className={styles.fsel} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
              <option>Agent</option>
              <option>Viewer</option>
              <option>Super Admin</option>
            </select>
          </div>
        </div>
        <button
          className={styles.btnGen}
          style={{ width: 'auto', padding: '11px 28px' }}
          onClick={() => { setInviteSent(true); setInviteEmail(''); setTimeout(() => setInviteSent(false), 3000); }}
        >
          {inviteSent ? 'Invite Sent ✓' : 'Send Invitation'}
        </button>
      </div>
    </div>
  );
}

// ─── SETTINGS: NOTIFICATIONS TAB ────────────────────────────────────────────

function NotificationsTab() {
  const [notifs, setNotifs] = useState(NOTIFS.map(n => ({ ...n })));
  const [saved, setSaved] = useState(false);

  const toggle = (i: number, channel: 'email' | 'whatsapp' | 'sms') => {
    setNotifs(prev => prev.map((n, idx) => idx === i ? { ...n, [channel]: !n[channel] } : n));
  };

  return (
    <div>
      <div className={styles.spTitle}>Notifications</div>
      <div className={styles.spSub}>Choose when and how you receive notifications about new leads, bookings, and system events.</div>
      <div className={styles.intSectionLabel} style={{ marginBottom: 12 }}>Notification Events</div>
      <div style={{ background: 'var(--card)', border: '1px solid rgba(192,168,112,0.09)', borderRadius: 3, padding: '4px 20px', marginBottom: 20 }}>
        {notifs.map((n, i) => (
          <div key={i} className={`${styles.notifRow} ${i === notifs.length - 1 ? styles.notifRowLast : ''}`}>
            <div className={styles.notifLabel}>{n.label}</div>
            <div className={styles.notifChannels}>
              {(['email', 'whatsapp', 'sms'] as const).map(ch => (
                <div key={ch} className={styles.notifChk} onClick={() => toggle(i, ch)}>
                  <div className={`${styles.notifChkBox} ${n[ch] ? styles.notifChkBoxOn : styles.notifChkBoxOff}`}>
                    {n[ch] ? '✓' : ''}
                  </div>
                  <span className={styles.notifChkLbl}>{ch === 'whatsapp' ? 'WA' : ch}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.quietHours}>
        <div className={styles.intSectionLabel} style={{ marginBottom: 10 }}>Quiet Hours</div>
        <div style={{ fontSize: 13, color: 'rgba(244,237,224,0.5)', marginBottom: 10 }}>Suppress non-urgent notifications during these hours:</div>
        <div className={styles.quietHoursRow}>
          <select className={styles.fsel} style={{ width: 130, padding: '9px 12px', fontSize: 13 }}>
            <option>10:00 PM</option><option>9:00 PM</option><option>11:00 PM</option>
          </select>
          <span style={{ color: 'rgba(244,237,224,0.3)' }}>to</span>
          <select className={styles.fsel} style={{ width: 130, padding: '9px 12px', fontSize: 13 }}>
            <option>7:00 AM</option><option>6:00 AM</option><option>8:00 AM</option>
          </select>
          <span style={{ fontSize: 11, color: 'rgba(244,237,224,0.25)' }}>WAT (West Africa Time)</span>
        </div>
      </div>
      <button
        className={styles.btnGen}
        style={{ width: 'auto', padding: '11px 28px', marginTop: 20 }}
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
      >
        {saved ? 'Preferences Saved ✓' : 'Save Notification Preferences'}
      </button>
    </div>
  );
}

// ─── SETTINGS: ACCOUNT TAB ──────────────────────────────────────────────────

function AccountTab() {
  const [firstName, setFirstName] = useState('Amaka');
  const [lastName, setLastName] = useState('Osei');
  const [email, setEmail] = useState('amaka@rokhaven.com');
  const [phone, setPhone] = useState('+234 916 761 9009');
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [twoFa, setTwoFa] = useState(false);

  return (
    <div>
      <div className={styles.spTitle}>Account</div>
      <div className={styles.spSub}>Manage your personal profile, password, and account security settings.</div>

      <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>Profile</div>
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>AO</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: 'var(--ivory)', marginBottom: 3 }}>{firstName} {lastName}</div>
          <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.35)' }}>{email} · Super Admin</div>
        </div>
        <button className={styles.intBtn}>Change Photo</button>
      </div>

      <div className={styles.g2}>
        <div className={styles.fgBlock}>
          <label>First Name</label>
          <input className={styles.fi} value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div className={styles.fgBlock}>
          <label>Last Name</label>
          <input className={styles.fi} value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
      </div>
      <div className={styles.fgBlock}>
        <label>Email Address</label>
        <input className={styles.fi} type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className={styles.fgBlock}>
        <label>Phone</label>
        <input className={styles.fi} type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <button
        className={styles.btnGen}
        style={{ width: 'auto', padding: '11px 28px', marginBottom: 28 }}
        onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2500); }}
      >
        {profileSaved ? 'Saved ✓' : 'Save Profile Changes'}
      </button>

      <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>Change Password</div>
      <div className={styles.fgBlock}>
        <label>Current Password</label>
        <input className={styles.fi} type="password" placeholder="••••••••••" />
      </div>
      <div className={styles.g2}>
        <div className={styles.fgBlock}>
          <label>New Password</label>
          <input className={styles.fi} type="password" placeholder="••••••••••" />
        </div>
        <div className={styles.fgBlock}>
          <label>Confirm Password</label>
          <input className={styles.fi} type="password" placeholder="••••••••••" />
        </div>
      </div>
      <button
        className={styles.btnGen}
        style={{ width: 'auto', padding: '11px 28px', marginBottom: 28 }}
        onClick={() => { setPasswordSaved(true); setTimeout(() => setPasswordSaved(false), 2500); }}
      >
        {passwordSaved ? 'Password Updated ✓' : 'Update Password'}
      </button>

      <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>Security</div>
      <div className={styles.securityCard}>
        <div className={styles.securityRow}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--ivory)', marginBottom: 3 }}>Two-Factor Authentication</div>
            <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.32)' }}>Add an extra layer of security to your account.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle on={twoFa} onToggle={() => setTwoFa(p => !p)} />
            <span style={{ fontSize: 11, color: twoFa ? '#5DC882' : 'rgba(244,237,224,0.3)' }}>{twoFa ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
        <div className={`${styles.securityRow} ${styles.securityRowLast}`}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--ivory)', marginBottom: 3 }}>Active Sessions</div>
            <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.32)' }}>1 active session — Chrome, Lagos NG</div>
          </div>
          <button className={styles.intBtn} style={{ color: 'rgba(224,112,112,0.6)', borderColor: 'rgba(224,112,112,0.2)' }}>Sign out all</button>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS SECTION ───────────────────────────────────────────────────────

function SettingsSection() {
  const [tab, setTab] = useState<SettingsTab>('integration');
  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'integration', label: 'Integrations' },
    { key: 'team', label: 'Team & Access' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'account', label: 'Account' },
  ];

  return (
    <div>
      <div className={styles.secHdr} style={{ marginBottom: 24 }}>
        <div className={styles.secTitle}>Settings</div>
      </div>
      <div className={styles.settingsLayout}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`${styles.snavItem} ${tab === t.key ? styles.snavItemOn : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.spPanel}>
          {tab === 'integration' && <IntegrationTab />}
          {tab === 'team' && <TeamTab />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'account' && <AccountTab />}
        </div>
      </div>
    </div>
  );
}

// ─── NAV CONFIG ─────────────────────────────────────────────────────────────

const NAV_ITEMS: { key: Section; label: string; Icon: () => React.ReactElement }[] = [
  { key: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { key: 'listings', label: 'Listings', Icon: IconListings },
  { key: 'bookings', label: 'Bookings', Icon: IconBookings },
  { key: 'leads', label: 'Leads', Icon: IconLeads },
  { key: 'reminders', label: 'Reminders', Icon: IconReminders },
  { key: 'settings', label: 'Settings', Icon: IconSettings },
];

const SECTION_TITLES: Record<Section, string> = {
  dashboard: 'Welcome back, Amaka.',
  listings: 'Listings',
  bookings: 'Bookings',
  leads: 'Leads Pipeline',
  reminders: 'Reminders',
  settings: 'Settings',
};

// ─── DASHBOARD SHELL ────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<Section>('dashboard');

  return (
    <div className={styles.adminWrap}>
      {/* SIDEBAR */}
      <aside className={styles.sb}>
        <div className={styles.sbLogo}>
          <svg width="24" height="24" viewBox="0 0 60 60" fill="#C0A870">
            <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
          </svg>
          <div>
            <div className={styles.sbWm}>ROKHAVEN</div>
            <div className={styles.sbSm}>REALTY</div>
          </div>
        </div>
        <div className={styles.sbSection}>Navigation</div>
        <div className={styles.sbNav}>
          {NAV_ITEMS.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`${styles.sbLink} ${section === key ? styles.sbLinkActive : ''}`}
              onClick={() => setSection(key)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>
        <div className={styles.sbFoot}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div className={styles.sbAvatar}>AO</div>
            <div>
              <div className={styles.sbName}>Amaka Osei</div>
              <div className={styles.sbRole}>Super Admin</div>
            </div>
          </div>
          <button className={styles.sbOut} onClick={onLogout}>Sign out →</button>
        </div>
      </aside>

      {/* MAIN */}
      <div className={styles.main}>
        {/* TOPBAR */}
        <div className={styles.topbar}>
          <div>
            <div className={styles.topbarTitle}>{SECTION_TITLES[section]}</div>
            <div className={styles.topbarDate}>Friday, 23 May 2026 · Admin Command Centre</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,237,224,0.4)', position: 'relative', padding: 4 }}>
              <IconBell />
              <span style={{ position: 'absolute', top: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)' }} />
            </button>
            <div className={styles.sbAvatar} style={{ cursor: 'pointer' }}>AO</div>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {section === 'dashboard' && <DashboardSection onNav={setSection} />}
          {section === 'listings' && <ListingsSection />}
          {section === 'bookings' && <BookingsSection />}
          {section === 'leads' && <LeadsSection />}
          {section === 'reminders' && <RemindersSection />}
          {section === 'settings' && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT PAGE ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
}
