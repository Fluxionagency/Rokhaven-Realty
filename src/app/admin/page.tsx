'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

/* ─── TYPES ─── */
type NavSection = 'dashboard' | 'listings' | 'bookings' | 'leads' | 'reminders' | 'settings';
type BookingTab = 'calendar' | 'genlink' | 'allinspections';
type SettingsTab = 'integrations' | 'team' | 'notifications' | 'account';

/* ─── MOCK DATA ─── */
const BOOKINGS_DATA: Record<string, { n: string; t: string }[]> = {
  '2026-05-19': [{ n: 'Emeka Obiora', t: '10am' }],
  '2026-05-20': [{ n: 'Babatunde Afolabi', t: '3pm' }],
  '2026-05-21': [{ n: "Ngozi O-W.", t: '2pm' }],
  '2026-05-22': [{ n: 'Adaeze Okonkwo', t: '11am' }],
  '2026-05-27': [{ n: 'Chidinma Eze', t: '11am' }],
};

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const LISTINGS = [
  { id: 1, name: 'The Grand Arkadia', price: '₦1,200,000,000', meta: 'Banana Island · 6 Beds · For Sale', badge: 'Featured', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=70&auto=format&fit=crop' },
  { id: 2, name: 'Oceanfront Penthouse', price: '₦780,000,000', meta: 'Victoria Island · 4 Beds · For Sale', badge: 'New', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70&auto=format&fit=crop' },
  { id: 3, name: 'Prestige Court, Ikoyi', price: '₦450,000,000', meta: 'Ikoyi · 5 Beds · For Sale', badge: 'Featured', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70&auto=format&fit=crop' },
  { id: 4, name: 'Eko Atlantic Residence', price: '₦920,000,000', meta: 'Eko Atlantic · 5 Beds · For Sale', badge: '', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=70&auto=format&fit=crop' },
  { id: 5, name: 'The Meridian, Lekki', price: '₦320,000,000', meta: 'Lekki Phase 1 · 4 Beds · For Sale', badge: 'New', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=70&auto=format&fit=crop' },
  { id: 6, name: 'Harbour View Estate', price: '₦580,000,000', meta: 'Lekki Phase 2 · 6 Beds · For Sale', badge: 'Featured', img: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&q=70&auto=format&fit=crop' },
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

const FEATURES = ['Swimming Pool', 'Generator', 'BQ / Staff Quarters', 'Smart Home', '24/7 Security', 'Gym', 'Gated Estate', 'Home Theatre', 'Parking (4+)'];
const FEAT_DEFAULT = [true, true, false, true, true, false, true, false, false];

/* ─── CALENDAR COMPONENT ─── */
function Calendar() {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  function navCal(dir: number) {
    let m = calMonth + dir;
    let y = calYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setCalMonth(m);
    setCalYear(y);
  }

  const today = new Date();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  const days: { day: number; isOther: boolean; isWeekend: boolean; isToday: boolean; dateKey: string }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isOther: true, isWeekend: false, isToday: false, dateKey: '' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(calYear, calMonth, d).getDay();
    const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d;
    const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, isOther: false, isWeekend: dow === 0 || dow === 6, isToday, dateKey });
  }

  return (
    <div>
      <div className={styles.calControls}>
        <div className={styles.calMonth}>{MONTHS[calMonth]} {calYear}</div>
        <div className={styles.calNavBtns}>
          <button className={styles.calBtn} onClick={() => navCal(-1)}>‹</button>
          <button
            className={`${styles.calBtn} ${styles.calTodayBtn}`}
            onClick={() => { setCalMonth(now.getMonth()); setCalYear(now.getFullYear()); }}
          >
            Today
          </button>
          <button className={styles.calBtn} onClick={() => navCal(1)}>›</button>
        </div>
      </div>
      <div className={styles.calGridHdr}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className={styles.calDh}>{d}</div>
        ))}
      </div>
      <div className={styles.calGrid}>
        {days.map((day, i) => {
          const bk = day.dateKey ? (BOOKINGS_DATA[day.dateKey] || []) : [];
          let cls = styles.calDay;
          if (day.isOther) cls += ` ${styles.calOther} ${styles.calWe}`;
          else if (day.isWeekend) cls += ` ${styles.calWe}`;
          if (day.isToday) cls += ` ${styles.calToday}`;
          return (
            <div key={i} className={cls}>
              <div className={styles.calDn}>{day.day}</div>
              {bk.map((b, bi) => (
                <div key={bi} className={styles.calBooking}>
                  <span style={{ fontWeight: 500 }}>{b.n}</span><br />{b.t}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className={styles.calLegend}>
        <div className={styles.calLi}>
          <div className={styles.calDot} style={{ background: 'rgba(192,168,112,.12)', border: '1px solid rgba(192,168,112,.28)' }} />
          Booked inspection
        </div>
        <div className={styles.calLi}>
          <div className={styles.calDot} style={{ background: 'rgba(82,112,112,.18)', border: '1px solid rgba(82,112,112,.32)' }} />
          Available slots
        </div>
        <div className={styles.calLi}>
          <div className={styles.calDot} style={{ border: '1.5px solid #C0A870' }} />
          Today
        </div>
      </div>
    </div>
  );
}

/* ─── GENERATE LINK COMPONENT ─── */
function GenerateLink() {
  const [generated, setGenerated] = useState(false);
  const [linkUrl, setLinkUrl] = useState('rokhaven.com/book/——————');
  const [copied, setCopied] = useState(false);
  const [propVal, setPropVal] = useState('');
  const [clientName, setClientName] = useState('');

  function generate() {
    const slug = propVal || 'general';
    const id = Math.random().toString(36).substring(2, 9);
    const nameParam = clientName ? `&client=${encodeURIComponent(clientName)}` : '';
    setLinkUrl(`rokhaven.com/enquiry?entry=listing&prop=${slug}${nameParam}&token=${id}`);
    setGenerated(true);
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://${linkUrl}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.genLayout}>
      <div className={styles.formCard}>
        <div className={styles.fcTitle}>Generate Booking Link</div>
        <div className={styles.fcSub}>
          Create a personalised, branded booking link to send directly to a client via WhatsApp, Instagram, or any channel.
        </div>
        <div className={styles.fgBlock}>
          <label>Select Property <span style={{ color: 'rgba(192,168,112,.3)', fontWeight: 300 }}>— or leave blank for general enquiry</span></label>
          <select className={styles.fsel} value={propVal} onChange={(e) => setPropVal(e.target.value)}>
            <option value="">General Enquiry (no specific property)</option>
            <option value="grand-arkadia">The Grand Arkadia — Banana Island</option>
            <option value="oceanfront-penthouse">Oceanfront Penthouse — Victoria Island</option>
            <option value="prestige-court">Prestige Court, Ikoyi</option>
            <option value="eko-atlantic">Eko Atlantic Residence</option>
            <option value="meridian-lekki">The Meridian, Lekki</option>
          </select>
        </div>
        <div className={styles.fgBlock}>
          <label>Client Name <span style={{ color: 'rgba(192,168,112,.3)', fontWeight: 300 }}>— Optional (pre-fills their form)</span></label>
          <input className={styles.fi} placeholder="e.g. Adaeze Okonkwo" value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>
        <div className={styles.fgBlock}>
          <label>Client Phone <span style={{ color: 'rgba(192,168,112,.3)', fontWeight: 300 }}>— Optional</span></label>
          <input className={styles.fi} type="tel" placeholder="+234 — — — — —" />
        </div>
        <div className={styles.fgBlock}>
          <label>Note to Client <span style={{ color: 'rgba(192,168,112,.3)', fontWeight: 300 }}>— Optional</span></label>
          <textarea className={styles.fta} rows={3} placeholder="e.g. Hi Adaeze, please use this link to schedule your viewing at your convenience." />
        </div>
        <button className={styles.btnGen} onClick={generate}>Generate Booking Link →</button>
      </div>

      <div className={`${styles.linkResult} ${!generated ? styles.linkResultDim : ''}`}>
        <div>
          <div className={styles.linkLabel}>Generated Booking Link</div>
          <div className={styles.linkBox}>
            <div className={styles.linkUrl}>{linkUrl}</div>
            <button className={`${styles.btnCopy} ${copied ? styles.btnCopied : ''}`} onClick={copyLink}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className={styles.linkExpiry}>
            <svg width="11" height="11" fill="none" stroke="rgba(192,168,112,.3)" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Expires in 7 days
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className={styles.btnWa} onClick={copyLink}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.8 9.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
            </svg>
            Share via WhatsApp
          </button>
          <button className={styles.btnOutlineLink} onClick={copyLink}>Copy Link Only</button>
        </div>
        <div>
          <div className={styles.linkLabel}>QR Code</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 18, background: 'rgba(11,27,53,.4)', border: '1px solid rgba(192,168,112,.1)', borderRadius: 3 }}>
            <div style={{ background: '#fff', padding: 8, borderRadius: 2 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <rect width="80" height="80" fill="white" />
                <rect x="5" y="5" width="30" height="30" fill="none" stroke="#000" strokeWidth="3" />
                <rect x="12" y="12" width="16" height="16" fill="#000" />
                <rect x="45" y="5" width="30" height="30" fill="none" stroke="#000" strokeWidth="3" />
                <rect x="52" y="12" width="16" height="16" fill="#000" />
                <rect x="5" y="45" width="30" height="30" fill="none" stroke="#000" strokeWidth="3" />
                <rect x="12" y="52" width="16" height="16" fill="#000" />
                <rect x="45" y="45" width="8" height="8" fill="#000" />
                <rect x="57" y="45" width="8" height="8" fill="#000" />
                <rect x="45" y="57" width="8" height="8" fill="#000" />
                <rect x="57" y="57" width="8" height="8" fill="#000" />
                <rect x="35" y="35" width="10" height="10" fill="#000" />
              </svg>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(244,237,224,.28)', letterSpacing: '.15em', textTransform: 'uppercase' }}>Scan to open booking form</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ADD LISTING MODAL ─── */
function AddListingModal({ onClose }: { onClose: () => void }) {
  const [featStates, setFeatStates] = useState(FEAT_DEFAULT.slice());

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panelWrap}>
        <div className={styles.panelHdr}>
          <div className={styles.panelTitle}>Add New Listing</div>
          <button className={styles.panelX} onClick={onClose}>×</button>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.fgBlock}>
            <label>Property Title</label>
            <input className={styles.fi} type="text" placeholder="e.g. The Grand Arkadia, Banana Island" />
          </div>
          <div className={`${styles.g2} ${styles.fgBlock}`}>
            <div>
              <label>Category</label>
              <select className={styles.fsel}><option>For Sale</option><option>For Rent</option><option>Shortlet</option></select>
            </div>
            <div>
              <label>Property Type</label>
              <select className={styles.fsel}><option>Fully Detached</option><option>Apartment</option><option>Penthouse</option><option>Villa</option><option>Semi-Detached</option><option>Townhouse</option></select>
            </div>
          </div>
          <div className={styles.fgBlock}>
            <label>Listing Price (₦)</label>
            <input className={styles.fi} placeholder="e.g. 1,200,000,000" />
          </div>
          <div className={styles.fgBlock}>
            <label>Location / Address</label>
            <input className={styles.fi} placeholder="Street address or estate" />
          </div>
          <div className={`${styles.g3} ${styles.fgBlock}`}>
            <div>
              <label>Bedrooms</label>
              <select className={styles.fsel}><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6+</option></select>
            </div>
            <div>
              <label>Bathrooms</label>
              <select className={styles.fsel}><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6+</option></select>
            </div>
            <div>
              <label>Size (sqm)</label>
              <input className={styles.fi} placeholder="e.g. 1200" />
            </div>
          </div>
          <div className={styles.fgBlock}>
            <label>Description</label>
            <textarea className={styles.fta} placeholder="Write a compelling property description…" rows={4} />
          </div>
          <div className={styles.fgBlock}>
            <label>Features &amp; Amenities</label>
            <div className={styles.pfeatPills}>
              {FEATURES.map((f, i) => (
                <button
                  key={f}
                  className={`${styles.pfp} ${featStates[i] ? styles.pfpOn : ''}`}
                  onClick={() => setFeatStates((s) => s.map((v, j) => j === i ? !v : v))}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.fgBlock}>
            <label>Upload Photos</label>
            <div className={styles.uploadZone}>
              <div style={{ fontSize: 22, marginBottom: 7, opacity: 0.4 }}>🖼</div>
              <div className={styles.uploadTxt}><strong style={{ color: '#C0A870', fontWeight: 400 }}>Click to upload</strong> or drag &amp; drop · JPEG, PNG, WebP · Max 15 MB · Up to 30 photos</div>
            </div>
          </div>
          <div className={styles.fgBlock}>
            <label>Video Tour URL <span style={{ color: 'rgba(192,168,112,.3)', fontWeight: 300 }}>— Optional</span></label>
            <input className={styles.fi} placeholder="YouTube, Vimeo, Instagram Reels, TikTok, or direct URL" />
          </div>
          <div className={styles.fgBlock}>
            <label>Status</label>
            <select className={styles.fsel}><option>Active</option><option>Draft</option><option>Sold</option><option>Rented</option></select>
          </div>
        </div>
        <div className={styles.panelFooter}>
          <button className={styles.btnCancelSm} onClick={onClose}>Cancel</button>
          <button className={styles.btnPublish} onClick={onClose}>Publish Listing</button>
        </div>
      </div>
    </div>
  );
}

/* ─── INTEGRATIONS TAB ─── */
function IntegrationsTab() {
  const [emailActive, setEmailActive] = useState('sendgrid');
  const [connected, setConnected] = useState<Record<string, boolean>>({ whatsapp: true });

  function toggleConnect(key: string) {
    setConnected((c) => ({ ...c, [key]: !c[key] }));
  }

  const emailProviders = [
    { key: 'sendgrid', name: 'SendGrid', desc: "Twilio's reliable transactional email API" },
    { key: 'mailgun', name: 'Mailgun', desc: 'High-deliverability email for developers' },
    { key: 'mailchimp', name: 'Mailchimp Transactional', desc: 'Mandrill — powerful email automation' },
    { key: 'ses', name: 'Amazon SES', desc: 'AWS scalable email infrastructure' },
    { key: 'postmark', name: 'Postmark', desc: 'Fast, developer-first transactional email' },
    { key: 'brevo', name: 'Brevo (Sendinblue)', desc: 'Email + SMS marketing in one platform' },
    { key: 'resend', name: 'Resend', desc: 'Modern email API built for developers' },
    { key: 'smtp', name: 'Custom SMTP', desc: 'Gmail, Zoho, Outlook, or any SMTP server' },
  ];

  return (
    <div>
      <div className={styles.spTitle}>Integrations</div>
      <div className={styles.spSub}>Connect RokHaven to external services to automate your booking workflow, calendar sync, and client communications.</div>

      <div className={styles.intSectionLabel}>📅 Calendar</div>
      {[
        { key: 'gcal', icon: '🗓', color: '#4285F4', name: 'Google Calendar', desc: 'Sync confirmed inspections automatically. New bookings appear as calendar events with full client and property details.' },
        { key: 'outlook', icon: '📅', color: '#0078D4', name: 'Microsoft Outlook / Office 365', desc: 'Connect your Outlook calendar for automatic inspection scheduling and team-wide calendar visibility.' },
        { key: 'apple', icon: '📱', color: '#1a73e8', name: 'Apple Calendar (iCal)', desc: 'Sync inspections to Apple Calendar via iCal feed. Compatible with iOS and macOS Calendar apps.' },
      ].map((item) => (
        <div key={item.key} className={styles.intCard}>
          <div className={styles.intIcon} style={{ background: item.color, fontSize: 20 }}>{item.icon}</div>
          <div className={styles.intInfo}>
            <div className={styles.intName}>{item.name}</div>
            <div className={styles.intDesc}>{item.desc}</div>
          </div>
          <button
            className={`${styles.intBtn} ${connected[item.key] ? styles.intBtnConnected : ''}`}
            onClick={() => toggleConnect(item.key)}
          >
            {connected[item.key] ? '✓ Connected' : 'Connect →'}
          </button>
        </div>
      ))}

      <div className={`${styles.intSectionLabel} ${styles.intSectionLabelSpaced}`}>💬 Messaging</div>
      {[
        { key: 'whatsapp', icon: '💬', color: '#25D366', name: 'WhatsApp Business API', desc: 'Send automated inspection reminders, booking confirmations, and follow-up messages via WhatsApp.' },
        { key: 'telegram', icon: '✈️', color: '#0088CC', name: 'Telegram Bot', desc: 'Send booking notifications and reminders via Telegram to clients who prefer it.' },
        { key: 'instagram', icon: '📸', color: '#E4405F', name: 'Instagram Direct (via Meta API)', desc: 'Receive and reply to Instagram DM enquiries directly from the RokHaven dashboard.' },
      ].map((item) => (
        <div key={item.key} className={styles.intCard}>
          <div className={styles.intIcon} style={{ background: item.color, fontSize: 18 }}>{item.icon}</div>
          <div className={styles.intInfo}>
            <div className={styles.intName}>{item.name}</div>
            <div className={styles.intDesc}>{item.desc}</div>
          </div>
          <button
            className={`${styles.intBtn} ${connected[item.key] ? styles.intBtnConnected : ''}`}
            onClick={() => toggleConnect(item.key)}
          >
            {connected[item.key] ? '✓ Connected' : 'Connect →'}
          </button>
        </div>
      ))}

      <div className={`${styles.intSectionLabel} ${styles.intSectionLabelSpaced}`}>✉️ Email Provider</div>
      <div className={styles.emailProviderWrapper}>
        <div className={styles.emailProviderNote}>Select your preferred email delivery provider. Only one email provider can be active at a time.</div>
        <div className={styles.emailProviders}>
          {emailProviders.map((ep) => (
            <div
              key={ep.key}
              className={`${styles.emailOpt} ${emailActive === ep.key ? styles.emailOptActive : ''}`}
              onClick={() => setEmailActive(ep.key)}
            >
              <div className={styles.eoName}>{ep.name}</div>
              <div className={styles.eoDesc}>{ep.desc}</div>
              {emailActive === ep.key && <div className={styles.eoBadge}>✓ Active</div>}
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.intSectionLabel} ${styles.intSectionLabelSpaced}`}>💳 CRM &amp; Other</div>
      {[
        { key: 'salesforce', icon: '☁️', color: '#00A1E0', name: 'Salesforce CRM', desc: 'Sync leads and client data to your Salesforce org automatically when new enquiries arrive.' },
        { key: 'hubspot', icon: '🔶', color: '#FF7A59', name: 'HubSpot CRM', desc: 'Push new leads and inspection bookings directly into your HubSpot pipeline.' },
        { key: 'zapier', icon: '⚡', color: '#6C47FF', name: 'Zapier', desc: 'Connect RokHaven to 6,000+ apps. Automate anything — Notion, Slack, Sheets, and more.' },
      ].map((item) => (
        <div key={item.key} className={styles.intCard}>
          <div className={styles.intIcon} style={{ background: item.color, fontSize: 18 }}>{item.icon}</div>
          <div className={styles.intInfo}>
            <div className={styles.intName}>{item.name}</div>
            <div className={styles.intDesc}>{item.desc}</div>
          </div>
          <button
            className={`${styles.intBtn} ${connected[item.key] ? styles.intBtnConnected : ''}`}
            onClick={() => toggleConnect(item.key)}
          >
            {connected[item.key] ? '✓ Connected' : 'Connect →'}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── NOTIFICATIONS TAB ─── */
function NotificationsTab() {
  const [notifState, setNotifState] = useState(NOTIFS.map((n) => ({ ...n })));

  function toggle(i: number, ch: 'email' | 'whatsapp' | 'sms') {
    setNotifState((s) => s.map((n, j) => j === i ? { ...n, [ch]: !n[ch] } : n));
  }

  return (
    <div>
      <div className={styles.spTitle}>Notifications</div>
      <div className={styles.spSub}>Choose when and how you receive notifications about new leads, bookings, and system events.</div>
      <div className={styles.intSectionLabel} style={{ marginBottom: 12 }}>New Lead Alerts</div>
      {notifState.map((n, i) => (
        <div key={i} className={`${styles.notifRow} ${i === notifState.length - 1 ? styles.notifRowLast : ''}`}>
          <div className={styles.notifLabel}>{n.label}</div>
          <div className={styles.notifChannels}>
            {(['email', 'whatsapp', 'sms'] as const).map((ch) => (
              <label key={ch} className={styles.notifChk} onClick={() => toggle(i, ch)}>
                <div className={`${styles.notifChkBox} ${n[ch] ? styles.notifChkBoxOn : styles.notifChkBoxOff}`}>
                  {n[ch] ? '✓' : ''}
                </div>
                <span className={styles.notifChkLbl}>{ch === 'whatsapp' ? 'WA' : ch}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className={styles.quietHours}>
        <div className={styles.intSectionLabel} style={{ marginBottom: 12 }}>Quiet Hours</div>
        <div style={{ fontSize: 13, color: 'rgba(244,237,224,.5)', marginBottom: 10 }}>Suppress non-urgent notifications during these hours:</div>
        <div className={styles.quietHoursRow}>
          <select className={styles.fsel} style={{ width: 130, padding: '9px 12px' }}>
            <option>10:00 PM</option><option>9:00 PM</option><option>11:00 PM</option>
          </select>
          <span style={{ color: 'rgba(244,237,224,.3)' }}>to</span>
          <select className={styles.fsel} style={{ width: 130, padding: '9px 12px' }}>
            <option>7:00 AM</option><option>6:00 AM</option><option>8:00 AM</option>
          </select>
          <span style={{ fontSize: 11, color: 'rgba(244,237,224,.25)' }}>WAT (West Africa Time)</span>
        </div>
      </div>
      <button className={styles.btnGen} style={{ width: 'auto', padding: '11px 28px', marginTop: 20 }}>
        Save Notification Preferences
      </button>
    </div>
  );
}

/* ─── ACCOUNT TAB ─── */
function AccountTab() {
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div className={styles.spTitle}>Account</div>
      <div className={styles.spSub}>Manage your personal profile, password, and account security settings.</div>

      <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>Profile</div>
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>AO</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: 'var(--ivory)', marginBottom: 3 }}>Amaka Osei</div>
          <div style={{ fontSize: 12, color: 'rgba(244,237,224,.35)' }}>amaka@rokhaven.com · Super Admin</div>
        </div>
        <button className={styles.intBtn}>Change Photo</button>
      </div>
      <div className={`${styles.g2} ${styles.fgBlock}`}>
        <div>
          <label style={{ display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,.42)', letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8 }}>First Name</label>
          <input className={styles.fi} defaultValue="Amaka" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,.42)', letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8 }}>Last Name</label>
          <input className={styles.fi} defaultValue="Osei" />
        </div>
      </div>
      <div className={styles.fgBlock}>
        <label style={{ display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,.42)', letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8 }}>Email Address</label>
        <input className={styles.fi} defaultValue="amaka@rokhaven.com" type="email" />
      </div>
      <div className={styles.fgBlock}>
        <label style={{ display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,.42)', letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8 }}>Phone</label>
        <input className={styles.fi} defaultValue="+234 916 761 9009" type="tel" />
      </div>
      <button
        className={styles.btnGen}
        style={{ width: 'auto', padding: '11px 28px', marginBottom: 28 }}
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
      >
        {saved ? 'Saved ✓' : 'Save Profile Changes'}
      </button>

      <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>Change Password</div>
      <div className={styles.fgBlock}>
        <label style={{ display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,.42)', letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8 }}>Current Password</label>
        <input className={styles.fi} type="password" placeholder="••••••••••" />
      </div>
      <div className={`${styles.g2} ${styles.fgBlock}`}>
        <div>
          <label style={{ display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,.42)', letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8 }}>New Password</label>
          <input className={styles.fi} type="password" placeholder="••••••••••" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,.42)', letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8 }}>Confirm Password</label>
          <input className={styles.fi} type="password" placeholder="••••••••••" />
        </div>
      </div>
      <button className={styles.btnGen} style={{ width: 'auto', padding: '11px 28px', marginBottom: 28 }}>Update Password</button>

      <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>Security</div>
      <div className={styles.securityCard}>
        <div className={styles.securityRow}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--ivory)', marginBottom: 3 }}>Two-Factor Authentication</div>
            <div style={{ fontSize: 11, color: 'rgba(244,237,224,.32)' }}>Add an extra layer of security to your account.</div>
          </div>
          <button className={styles.intBtn}>Enable →</button>
        </div>
        <div className={`${styles.securityRow} ${styles.securityRowLast}`}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--ivory)', marginBottom: 3 }}>Active Sessions</div>
            <div style={{ fontSize: 11, color: 'rgba(244,237,224,.32)' }}>1 active session — Chrome, Lagos NG</div>
          </div>
          <button className={styles.intBtn} style={{ color: 'rgba(224,112,112,.6)', borderColor: 'rgba(224,112,112,.2)' }}>Sign out all</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ADMIN PAGE ─── */
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [emailVal, setEmailVal] = useState('');
  const [passVal, setPassVal] = useState('');
  const [emailErr, setEmailErr] = useState(false);

  const [activeNav, setActiveNav] = useState<NavSection>('dashboard');
  const [bookingTab, setBookingTab] = useState<BookingTab>('calendar');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('integrations');
  const [showAddModal, setShowAddModal] = useState(false);

  const topTitles: Record<NavSection, string> = {
    dashboard: 'Welcome back, Amaka.',
    listings: 'Listings',
    bookings: 'Bookings',
    leads: 'Leads Pipeline',
    reminders: 'Reminders',
    settings: 'Settings',
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function doLogin() {
    if (
      emailVal === 'admin@rokhaven.com' && passVal === 'admin123'
    ) {
      setIsLoggedIn(true);
      setLoginError('');
    } else if (emailVal && passVal) {
      setLoginError('Invalid email or password. Try admin@rokhaven.com / admin123');
      setEmailErr(true);
    } else {
      setEmailErr(true);
      setLoginError('Please enter your email and password.');
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && !isLoggedIn) doLogin();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const navItems: { key: NavSection; label: string; icon: React.ReactNode }[] = [
    {
      key: 'dashboard', label: 'Dashboard',
      icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    },
    {
      key: 'listings', label: 'Listings',
      icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
    },
    {
      key: 'bookings', label: 'Bookings',
      icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    },
    {
      key: 'leads', label: 'Leads',
      icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
    },
    {
      key: 'reminders', label: 'Reminders',
      icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
    },
    {
      key: 'settings', label: 'Settings',
      icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
    },
  ];

  return (
    <>
      {/* LOGIN OVERLAY */}
      {!isLoggedIn && (
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
              value={emailVal}
              onChange={(e) => { setEmailVal(e.target.value); setEmailErr(false); }}
            />
            <label className={styles.loginLbl}>Password</label>
            <input
              className={`${styles.loginIn} ${emailErr ? styles.loginInError : ''}`}
              type="password"
              placeholder="••••••••••"
              value={passVal}
              onChange={(e) => { setPassVal(e.target.value); setEmailErr(false); }}
            />
            <button className={styles.loginBtn} onClick={doLogin}>Sign In →</button>
            {loginError && <div className={styles.loginError}>{loginError}</div>}
            <div className={styles.loginForgot}>Forgot your password?</div>
            <div className={styles.loginSecure}>
              <svg width="9" height="11" viewBox="0 0 10 12" fill="rgba(244,237,224,.25)">
                <path d="M5 0C3.34 0 2 1.34 2 3v1H1C.45 4 0 4.45 0 5v6c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1H8V3C8 1.34 6.66 0 5 0zm0 1.5c.83 0 1.5.67 1.5 1.5v1h-3V3c0-.83.67-1.5 1.5-1.5z" />
              </svg>
              Secured connection
            </div>
          </div>
        </div>
      )}

      {/* ADD LISTING MODAL */}
      {showAddModal && <AddListingModal onClose={() => setShowAddModal(false)} />}

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
          <nav className={styles.sbNav}>
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`${styles.sbLink} ${activeNav === item.key ? styles.sbLinkActive : ''}`}
                onClick={() => setActiveNav(item.key)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className={styles.sbFoot}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className={styles.sbAvatar}>AO</div>
              <div>
                <div className={styles.sbName}>Amaka Osei</div>
                <div className={styles.sbRole}>Super Admin</div>
              </div>
            </div>
            <button className={styles.sbOut} onClick={() => setIsLoggedIn(false)}>
              Sign out →
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className={styles.main}>
          <div className={styles.topbar}>
            <div>
              <div className={styles.topbarTitle}>{topTitles[activeNav]}</div>
              <div className={styles.topbarDate}>{dateStr} · Admin Command Centre</div>
            </div>
            <button className={styles.btnAdd} onClick={() => setShowAddModal(true)}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New Listing
            </button>
          </div>

          <div className={styles.content}>

            {/* ── DASHBOARD ── */}
            <div className={`${styles.panel} ${activeNav === 'dashboard' ? styles.panelActive : ''}`}>
              <div className={styles.stats}>
                <div className={styles.sc}>
                  <span className={`${styles.scDelta} ${styles.up}`}>↑ 3 this week</span>
                  <div className={styles.scNum}>34</div>
                  <div className={styles.scLbl}>Active Listings</div>
                </div>
                <div className={styles.sc}>
                  <span className={`${styles.scDelta} ${styles.pend}`}>7 urgent</span>
                  <div className={styles.scNum}>19</div>
                  <div className={styles.scLbl}>Pending Inspections</div>
                </div>
                <div className={styles.sc}>
                  <span className={`${styles.scDelta} ${styles.up}`}>↑ 42% MoM</span>
                  <div className={styles.scNum}>47</div>
                  <div className={styles.scLbl}>Inspections This Month</div>
                </div>
                <div className={styles.sc}>
                  <span className={`${styles.scDelta} ${styles.up}`}>↑ 2 new</span>
                  <div className={styles.scNum}>12</div>
                  <div className={styles.scLbl}>Properties Sold / Rented</div>
                </div>
              </div>

              <div className={styles.secHdr}>
                <div className={styles.secTitle}>Recent Inspection Requests</div>
                <button className={styles.secLink} onClick={() => setActiveNav('bookings')}>View all →</button>
              </div>
              <div className={styles.tblWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Client</th><th>Phone</th><th>Property</th><th>Date</th><th>Status</th>
                      <th style={{ width: 110 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="strong">Adaeze Okonkwo</td>
                      <td>+234 803 441 7829</td>
                      <td>
                        <div className={styles.propRow}>
                          <div className={styles.propThumb}><img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=120&q=60&auto=format&fit=crop" alt="" /></div>
                          <div><div className={styles.propNameCell}>The Grand Arkadia</div><div className={styles.propLocCell}>Banana Island</div></div>
                        </div>
                      </td>
                      <td>Fri 22 May</td>
                      <td><span className={`${styles.badge} ${styles.bPending}`}>Pending</span></td>
                      <td><div className={styles.rowActions}><button className={styles.raBtn}>Confirm</button><button className={styles.raBtn}>View</button></div></td>
                    </tr>
                    <tr>
                      <td className="strong">Emeka Obiora</td>
                      <td>+234 816 902 3340</td>
                      <td>
                        <div className={styles.propRow}>
                          <div className={styles.propThumb}><img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=120&q=60&auto=format&fit=crop" alt="" /></div>
                          <div><div className={styles.propNameCell}>Oceanfront Penthouse</div><div className={styles.propLocCell}>Victoria Island</div></div>
                        </div>
                      </td>
                      <td>Tue 19 May</td>
                      <td><span className={`${styles.badge} ${styles.bConfirmed}`}>Confirmed</span></td>
                      <td><div className={styles.rowActions}><button className={styles.raBtn}>View</button><button className={styles.raBtn}>Reschedule</button></div></td>
                    </tr>
                    <tr>
                      <td className="strong">Chidinma Eze</td>
                      <td>+234 705 114 6682</td>
                      <td>
                        <div className={styles.propRow}>
                          <div className={styles.propThumb}><img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&q=60&auto=format&fit=crop" alt="" /></div>
                          <div><div className={styles.propNameCell}>Prestige Court, Ikoyi</div><div className={styles.propLocCell}>Ikoyi</div></div>
                        </div>
                      </td>
                      <td>Mon 18 May</td>
                      <td><span className={`${styles.badge} ${styles.bCompleted}`}>Completed</span></td>
                      <td><div className={styles.rowActions}><button className={styles.raBtn}>View</button><button className={styles.raBtn}>Follow up</button></div></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={styles.secHdr}>
                <div className={styles.secTitle}>Active Listings</div>
                <button className={styles.secLink} onClick={() => setActiveNav('listings')}>Manage all →</button>
              </div>
              <div className={styles.lgrid}>
                {LISTINGS.slice(0, 3).map((l) => (
                  <div key={l.id} className={styles.lcard}>
                    <div className={styles.lcardImg}>
                      <img src={l.img} alt={l.name} />
                      {l.badge && <div className={styles.lbadge}>{l.badge}</div>}
                    </div>
                    <div className={styles.lcardBody}>
                      <div className={styles.lcardName}>{l.name}</div>
                      <div className={styles.lcardPrice}>{l.price}</div>
                      <div className={styles.lcardMeta}>{l.meta}</div>
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

            {/* ── LISTINGS ── */}
            <div className={`${styles.panel} ${activeNav === 'listings' ? styles.panelActive : ''}`}>
              <div className={styles.secHdr} style={{ marginBottom: 20 }}>
                <div className={styles.secTitle}>All Listings</div>
                <button className={styles.btnAdd} style={{ fontSize: 10, padding: '8px 16px' }} onClick={() => setShowAddModal(true)}>
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add New
                </button>
              </div>
              <div className={`${styles.lgrid} ${styles.lgrid4}`}>
                {LISTINGS.map((l) => (
                  <div key={l.id} className={styles.lcard}>
                    <div className={styles.lcardImg}>
                      <img src={l.img} alt={l.name} />
                      {l.badge && <div className={styles.lbadge}>{l.badge}</div>}
                    </div>
                    <div className={styles.lcardBody}>
                      <div className={styles.lcardName}>{l.name}</div>
                      <div className={styles.lcardPrice}>{l.price}</div>
                      <div className={styles.lcardMeta}>{l.meta}</div>
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

            {/* ── BOOKINGS ── */}
            <div className={`${styles.panel} ${activeNav === 'bookings' ? styles.panelActive : ''}`}>
              <div className={styles.subTabs}>
                {([['calendar', '📅 Calendar'], ['genlink', '🔗 Generate Booking Link'], ['allinspections', '📋 All Inspections']] as [BookingTab, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    className={`${styles.stab} ${bookingTab === key ? styles.stabOn : ''}`}
                    onClick={() => setBookingTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {bookingTab === 'calendar' && <Calendar />}
              {bookingTab === 'genlink' && <GenerateLink />}
              {bookingTab === 'allinspections' && (
                <div>
                  <div className={styles.secHdr} style={{ marginBottom: 16 }}>
                    <div className={styles.secTitle}>All Inspection Requests</div>
                    <button className={styles.secLink}>Export CSV →</button>
                  </div>
                  <div className={styles.tblWrap}>
                    <table>
                      <thead>
                        <tr>
                          <th>Client</th><th>Phone</th><th>Property</th><th>Date &amp; Time</th><th>Status</th><th>Source</th>
                          <th style={{ width: 130 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Adaeze Okonkwo', phone: '+234 803 441 7829', prop: 'The Grand Arkadia', loc: 'Banana Island', date: 'Fri 22 May · 11am', status: 'pending', source: 'Website', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=120&q=60&auto=format&fit=crop' },
                          { name: 'Emeka Obiora', phone: '+234 816 902 3340', prop: 'Oceanfront Penthouse', loc: 'Victoria Island', date: 'Tue 19 May · 10am', status: 'confirmed', source: 'WhatsApp Link', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=120&q=60&auto=format&fit=crop' },
                          { name: 'Chidinma Eze', phone: '+234 705 114 6682', prop: 'Prestige Court, Ikoyi', loc: 'Ikoyi', date: 'Mon 18 May · 2pm', status: 'completed', source: 'Website', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&q=60&auto=format&fit=crop' },
                          { name: 'Babatunde Afolabi', phone: '+234 901 557 2290', prop: 'The Meridian, Lekki', loc: 'Lekki Phase 1', date: 'Wed 20 May · 3pm', status: 'pending', source: 'Instagram Link', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=120&q=60&auto=format&fit=crop' },
                          { name: 'Ngozi Okafor-Williams', phone: '+234 812 330 9954', prop: 'Eko Atlantic Residence', loc: 'Eko Atlantic', date: 'Thu 21 May · 2pm', status: 'confirmed', source: 'WhatsApp Link', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=120&q=60&auto=format&fit=crop' },
                        ].map((row, i) => (
                          <tr key={i}>
                            <td style={{ color: 'var(--ivory)', fontWeight: 400 }}>{row.name}</td>
                            <td>{row.phone}</td>
                            <td>
                              <div className={styles.propRow}>
                                <div className={styles.propThumb}><img src={row.img} alt="" /></div>
                                <div><div className={styles.propNameCell}>{row.prop}</div><div className={styles.propLocCell}>{row.loc}</div></div>
                              </div>
                            </td>
                            <td>{row.date}</td>
                            <td>
                              <span className={`${styles.badge} ${row.status === 'pending' ? styles.bPending : row.status === 'confirmed' ? styles.bConfirmed : styles.bCompleted}`}>
                                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                              </span>
                            </td>
                            <td style={{ fontSize: 11, color: 'rgba(244,237,224,.28)' }}>{row.source}</td>
                            <td>
                              <div className={styles.rowActions}>
                                {row.status === 'pending' ? <button className={styles.raBtn}>Confirm</button> : <button className={styles.raBtn}>View</button>}
                                <button className={styles.raBtn}>Reschedule</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ── LEADS ── */}
            <div className={`${styles.panel} ${activeNav === 'leads' ? styles.panelActive : ''}`}>
              <div className={styles.secHdr} style={{ marginBottom: 20 }}>
                <div className={styles.secTitle}>Leads Pipeline</div>
                <button className={styles.secLink}>Export →</button>
              </div>
              <div className={styles.leadsGrid}>
                {[
                  {
                    title: 'New Leads', count: 8,
                    cards: [
                      { name: 'Adaeze Okonkwo', prop: 'The Grand Arkadia', time: '2 hours ago' },
                      { name: 'Tunde Adeyemi', prop: 'General Enquiry', time: '5 hours ago' },
                      { name: 'Funke Balogun', prop: 'Oceanfront Penthouse', time: 'Yesterday' },
                    ],
                  },
                  {
                    title: 'Contacted', count: 12,
                    cards: [
                      { name: 'Emeka Obiora', prop: 'Oceanfront Penthouse', time: '✓ Called · 2 days ago' },
                      { name: 'Ngozi Okafor-Williams', prop: 'Eko Atlantic Residence', time: '✓ WhatsApp · Yesterday' },
                    ],
                  },
                  {
                    title: 'Inspection Booked', count: 6,
                    cards: [
                      { name: 'Babatunde Afolabi', prop: 'The Meridian, Lekki', time: '📅 Wed 20 May, 3pm' },
                      { name: 'Chidinma Eze', prop: 'Prestige Court', time: '📅 Mon 18 May (done)' },
                    ],
                  },
                  {
                    title: 'Closed', count: 12,
                    cards: [
                      { name: 'Adeola Sanni', prop: 'Harbour View Estate', time: '✓ Sale completed', success: true },
                      { name: 'Rotimi Fashola', prop: 'Sky Manor, Ikeja GRA', time: '✓ Lease signed', success: true },
                    ],
                  },
                ].map((col) => (
                  <div key={col.title} className={styles.pipeCol}>
                    <div className={styles.pipeHead}>
                      {col.title} <span className={styles.pipeCount}>{col.count}</span>
                    </div>
                    {col.cards.map((card, i) => (
                      <div key={i} className={styles.leadCard}>
                        <div className={styles.leadName}>{card.name}</div>
                        <div className={styles.leadProp}>{card.prop}</div>
                        <div className={styles.leadTime} style={'success' in card && card.success ? { color: '#5DC882' } : {}}>
                          {card.time}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* ── REMINDERS ── */}
            <div className={`${styles.panel} ${activeNav === 'reminders' ? styles.panelActive : ''}`}>
              <div className={styles.secHdr} style={{ marginBottom: 20 }}>
                <div className={styles.secTitle}>Inspection Reminders</div>
              </div>
              <div className={styles.tblWrap}>
                <table>
                  <thead>
                    <tr><th>Client</th><th>Property</th><th>Inspection Date</th><th>Reminders Sent</th><th style={{ width: 180 }}>Actions</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Babatunde Afolabi', phone: '+234 901 557 2290', prop: 'The Meridian, Lekki', loc: 'Lekki Phase 1', date: 'Wed 20 May, 3:00pm', rem: ['sent', 'pending', 'pending'] },
                      { name: 'Emeka Obiora', phone: '+234 816 902 3340', prop: 'Oceanfront Penthouse', loc: 'Victoria Island', date: 'Fri 22 May, 10:00am', rem: ['sent', 'sent', 'pending'] },
                      { name: 'Ngozi Okafor-Williams', phone: '+234 812 330 9954', prop: 'Eko Atlantic Residence', loc: 'Eko Atlantic', date: 'Mon 25 May, 2:00pm', rem: ['pending', 'pending', 'pending'] },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ color: 'var(--ivory)', fontWeight: 400 }}>{row.name}</div>
                          <div style={{ fontSize: 11, color: 'rgba(244,237,224,.3)', fontWeight: 300 }}>{row.phone}</div>
                        </td>
                        <td>
                          <div className={styles.propNameCell}>{row.prop}</div>
                          <div className={styles.propLocCell}>{row.loc}</div>
                        </td>
                        <td>{row.date}</td>
                        <td>
                          <div className={styles.remStatus}>
                            {row.rem.map((r, ri) => (
                              <span key={ri} className={`${styles.remPill} ${r === 'sent' ? styles.remSent : styles.remPending}`}>
                                {ri === 0 ? '48hr' : ri === 1 ? '24hr' : '2hr'} {r === 'sent' ? '✓' : '⏳'}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className={`${styles.rowActions} ${styles.rowActionsVisible}`}>
                            <button className={styles.raBtn}>Send Now</button>
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
                <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>Automated Reminder Schedule</div>
                <div className={styles.reminderScheduleRow}>
                  {[
                    { label: '48 hours before', sub: 'WhatsApp + Email + SMS' },
                    { label: '24 hours before', sub: 'WhatsApp + Email + SMS' },
                    { label: '2 hours before', sub: 'WhatsApp + SMS' },
                  ].map((r) => (
                    <div key={r.label} className={styles.reminderItem}>
                      <div className={styles.reminderDot} />
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--ivory)', fontWeight: 400 }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: 'rgba(244,237,224,.3)' }}>{r.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SETTINGS ── */}
            <div className={`${styles.panel} ${activeNav === 'settings' ? styles.panelActive : ''}`}>
              <div className={styles.secHdr} style={{ marginBottom: 24 }}>
                <div className={styles.secTitle}>Settings</div>
              </div>
              <div className={styles.settingsLayout}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {([['integrations', 'Integrations'], ['team', 'Team & Access'], ['notifications', 'Notifications'], ['account', 'Account']] as [SettingsTab, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      className={`${styles.snavItem} ${settingsTab === key ? styles.snavItemOn : ''}`}
                      onClick={() => setSettingsTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {settingsTab === 'integrations' && (
                  <div className={styles.spPanel}>
                    <IntegrationsTab />
                  </div>
                )}

                {settingsTab === 'team' && (
                  <div className={styles.spPanel}>
                    <div className={styles.spTitle}>Team &amp; Access</div>
                    <div className={styles.spSub}>Manage team members and their permission levels within the RokHaven admin.</div>
                    <div className={styles.teamHdr}>
                      <div className={styles.intSectionLabel}>Team Members (4)</div>
                      <button className={styles.intBtn}>+ Invite Member</button>
                    </div>
                    <div className={styles.tblWrap}>
                      <table>
                        <thead>
                          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th style={{ width: 100 }}></th></tr>
                        </thead>
                        <tbody>
                          {[
                            { init: 'AO', name: 'Amaka Osei', email: 'amaka@rokhaven.com', role: 'Super Admin', roleClass: styles.bConfirmed, status: 'Active', statusClass: styles.bConfirmed, actions: ['Edit'] },
                            { init: 'TF', name: 'Tola Fashola', email: 'tola@rokhaven.com', role: 'Agent', roleClass: styles.bPending, status: 'Active', statusClass: styles.bConfirmed, actions: ['Edit', 'Remove'] },
                            { init: 'KA', name: 'Kunle Adeyemi', email: 'kunle@rokhaven.com', role: 'Agent', roleClass: styles.bPending, status: 'Active', statusClass: styles.bConfirmed, actions: ['Edit', 'Remove'] },
                            { init: 'BI', name: 'Blessing Ikenna', email: 'blessing@rokhaven.com', role: 'Viewer', roleClass: styles.bCompleted, status: 'Invited', statusClass: styles.bPending, actions: ['Resend', 'Revoke'] },
                          ].map((m, i) => (
                            <tr key={i}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div className={styles.sbAvatar} style={{ width: 30, height: 30, fontSize: 10 }}>{m.init}</div>
                                  <span style={{ color: 'var(--ivory)', fontWeight: 400 }}>{m.name}</span>
                                </div>
                              </td>
                              <td style={{ fontSize: 12, color: 'rgba(244,237,224,.5)' }}>{m.email}</td>
                              <td><span className={`${styles.badge} ${m.roleClass}`} style={{ fontSize: 9 }}>{m.role}</span></td>
                              <td><span className={`${styles.badge} ${m.statusClass}`} style={{ fontSize: 9 }}>{m.status}</span></td>
                              <td>
                                <div className={`${styles.rowActions} ${styles.rowActionsVisible}`}>
                                  {m.actions.map((a) => (
                                    <button key={a} className={`${styles.raBtn} ${a === 'Remove' || a === 'Revoke' ? styles.raDel : ''}`}>{a}</button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className={styles.roleGrid}>
                      {[
                        { name: 'Super Admin', color: '#C0A870', desc: 'Full access — manage listings, view all leads, configure settings, manage team.' },
                        { name: 'Agent', color: '#E0B44A', desc: 'View and manage listings and bookings. Cannot access settings or billing.' },
                        { name: 'Viewer', color: '#527070', desc: 'Read-only access to listings and dashboard. No editing or exporting.' },
                      ].map((r) => (
                        <div key={r.name} className={styles.roleCard}>
                          <div className={styles.roleName} style={{ color: r.color }}>{r.name}</div>
                          <div className={styles.roleDesc}>{r.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className={styles.spPanel}>
                    <NotificationsTab />
                  </div>
                )}

                {settingsTab === 'account' && (
                  <div className={styles.spPanel}>
                    <AccountTab />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
