'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import styles from './page.module.css';

// ─── TYPES ─────────────────────────────────────────────────────────────────

type Section = 'dashboard' | 'listings' | 'bookings' | 'leads' | 'contacts' | 'reminders' | 'settings';
type BookingTab = 'calendar' | 'link' | 'inspections';
type SettingsTab = 'integration' | 'team' | 'notifications' | 'account';
type ListingFilter = 'All' | 'Active' | 'Rented' | 'Sold' | 'Pending';
type LeadStatus = 'New' | 'Contacted' | 'Booked' | 'InspectionDone' | 'Closed' | 'Failed';

interface AdminProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number | null;
  images: string;
  status: string;
  badge: string | null;
  category: string;
  type: string;
  neighbourhood: string | null;
}

interface AdminInspection {
  id: string;
  referenceNo: string | null;
  clientName: string;
  clientPhone: string;
  propertyId: string;
  property: { title: string; location: string } | null;
  preferredDate: string;
  preferredTime: string;
  status: string;
  notes: string | null;
}

interface AdminEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: { title: string } | null;
  status: string;
  createdAt: string;
  budget: string | null;
  intent: string | null;
  howHeard: string | null;
  notes: string | null;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function firstPropImage(images: string, w = 200): string {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr[0] ? arr[0] + `?w=${w}&q=80&auto=format&fit=crop` : `https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=${w}&q=80&auto=format&fit=crop`;
  } catch {
    return `https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=${w}&q=80&auto=format&fit=crop`;
  }
}

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
  const norm = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const cls = norm === 'Confirmed' ? styles.bConfirmed : norm === 'Completed' ? styles.bCompleted : styles.bPending;
  return <span className={`${styles.badge} ${cls}`}>{norm}</span>;
}

function PropThumbRow({ imgUrl, name, loc }: { imgUrl: string; name: string; loc: string }) {
  return (
    <div className={styles.propRow}>
      <div className={styles.propThumb}>
        <img src={imgUrl} alt={name} />
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
const IconContacts = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
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

// ─── RESCHEDULE MODAL ───────────────────────────────────────────────────────

function RescheduleModal({ inspection, onClose, onDone }: {
  inspection: AdminInspection;
  onClose: () => void;
  onDone: () => void;
}) {
  const [date, setDate] = useState(inspection.preferredDate);
  const [time, setTime] = useState(inspection.preferredTime);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!date || !time) { setError('Please select a date and time.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/inspections/' + inspection.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredDate: date, preferredTime: time, status: 'PENDING' }),
      });
      if (!res.ok) { setError('Failed to reschedule. Please try again.'); setSaving(false); return; }
      onDone();
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  };

  const lbl: React.CSSProperties = { display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,0.5)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,15,28,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0D1E30', border: '1px solid rgba(192,168,112,0.15)', borderRadius: 4, padding: 28, maxWidth: 400, width: '100%' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#F4EDE0', marginBottom: 6 }}>Reschedule Inspection</div>
        <p style={{ fontSize: 12, color: 'rgba(244,237,224,0.4)', marginBottom: 20 }}>{inspection.clientName} · {inspection.property?.title || 'Unknown property'}</p>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>New Date</label>
          <input className={styles.fi} type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>New Time</label>
          <input className={styles.fi} type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>
        {error && <p style={{ color: '#e57373', fontSize: 12, marginBottom: 14 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(192,168,112,0.2)', borderRadius: 2, padding: '9px 18px', color: 'rgba(244,237,224,0.5)', fontSize: 12, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ background: '#C0A870', border: 'none', borderRadius: 2, padding: '9px 22px', color: '#060F1C', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Reschedule →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD SECTION ──────────────────────────────────────────────────────

function DashboardSection({ onNav, properties, inspections, onRefresh }: {
  onNav: (section: Section) => void;
  properties: AdminProperty[];
  inspections: AdminInspection[];
  onRefresh: () => void;
}) {
  const activeListings = properties.filter(p => p.status === 'ACTIVE').length;
  const pendingInspections = inspections.filter(i => i.status === 'PENDING').length;
  const [rescheduleInsp, setRescheduleInsp] = useState<AdminInspection | null>(null);

  const confirmInspection = async (id: string) => {
    await fetch('/api/inspections/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' }),
    });
    onRefresh();
  };

  return (
    <div>
      {rescheduleInsp && (
        <RescheduleModal
          inspection={rescheduleInsp}
          onClose={() => setRescheduleInsp(null)}
          onDone={() => { setRescheduleInsp(null); onRefresh(); }}
        />
      )}
      <div className={styles.stats}>
        <div className={styles.sc}>
          <span className={`${styles.scDelta} ${styles.up}`}>↑ 3 this week</span>
          <div className={styles.scNum}>{activeListings}</div>
          <div className={styles.scLbl}>Active Listings</div>
        </div>
        <div className={styles.sc}>
          <span className={`${styles.scDelta} ${styles.pend}`}>{pendingInspections} today</span>
          <div className={styles.scNum}>{pendingInspections}</div>
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
            {inspections.slice(0, 4).map(insp => (
              <tr key={insp.id}>
                <td>
                  <div className={styles.propRow}>
                    <div>
                      <div className={styles.propNameCell}>{insp.property?.title || 'Unknown'}</div>
                      <div className={styles.propLocCell}>{insp.property?.location || ''}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.strong}>{insp.clientName}</td>
                <td>{insp.preferredDate}</td>
                <td><Badge status={insp.status} /></td>
                <td>
                  <div className={styles.rowActions}>
                    {insp.status === 'PENDING' && (
                      <button className={styles.raBtn} onClick={() => confirmInspection(insp.id)}>Confirm</button>
                    )}
                    <button className={styles.raBtn} onClick={() => onNav('bookings')}>View</button>
                    {insp.status === 'CONFIRMED' && <button className={styles.raBtn} onClick={() => setRescheduleInsp(insp)}>Reschedule</button>}
                    {insp.status === 'COMPLETED' && <button className={styles.raBtn}>Follow up</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.secHdr}>
        <div className={styles.secTitle}>Active Listings</div>
        <button className={styles.secLink} onClick={() => onNav('listings')}>Manage all →</button>
      </div>
      <div className={styles.lgrid}>
        {properties.slice(0, 6).map(p => (
          <div key={p.id} className={styles.lcard}>
            <div className={styles.lcardImg}>
              <img src={firstPropImage(p.images, 400)} alt={p.title} />
              {p.badge && <div className={styles.lbadge}>{p.badge}</div>}
            </div>
            <div className={styles.lcardBody}>
              <div className={styles.lcardName}>{p.title}</div>
              <div className={styles.lcardPrice}>{p.price}</div>
              <div className={styles.lcardMeta}>{p.location} · {p.bedrooms} Beds · For Sale</div>
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

function ListingsSection({ properties, onRefresh }: { properties: AdminProperty[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState<ListingFilter>('All');
  const filters: ListingFilter[] = ['All', 'Active', 'Rented', 'Sold', 'Pending'];
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<AdminProperty | null>(null);
  const [saving, setSaving] = useState(false);
  // form fields
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [fLocation, setFLocation] = useState('');
  const [fNbh, setFNbh] = useState('');
  const [fType, setFType] = useState('Fully Detached');
  const [fCat, setFCat] = useState('SALE');
  const [fBeds, setFBeds] = useState(4);
  const [fBaths, setFBaths] = useState(4);
  const [fSqm, setFSqm] = useState('');
  const [fBadge, setFBadge] = useState('');
  const [fImages, setFImages] = useState('');
  const [fVideo, setFVideo] = useState('');
  const [fVideoFile, setFVideoFile] = useState<File | null>(null);
  const [fVideoFileName, setFVideoFileName] = useState('');
  const [fImagePreviews, setFImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);
  const [fStatus, setFStatus] = useState('ACTIVE');

  const filtered = filter === 'All' ? properties : properties.filter(p => p.status.toLowerCase() === filter.toLowerCase());

  const doAction = async (p: AdminProperty, action: string) => {
    setOpenMenu(null);
    if (action === 'Edit') {
      openModal(p);
      return;
    }
    if (action === 'Delete') {
      if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    }
    setActing(p.id + action);
    try {
      let res: Response;
      if (action === 'Mark as Rented') {
        res = await fetch('/api/properties/' + p.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'RENTED' }) });
      } else if (action === 'Mark as Sold') {
        res = await fetch('/api/properties/' + p.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'SOLD' }) });
      } else if (action === 'Deactivate') {
        res = await fetch('/api/properties/' + p.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'INACTIVE' }) });
      } else {
        res = await fetch('/api/properties/' + p.id, { method: 'DELETE' });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Action failed: ' + (err.error || res.status));
      } else {
        await onRefresh();
      }
    } catch {
      alert('Network error — please try again.');
    }
    setActing(null);
  };

  const openModal = (p?: AdminProperty) => {
    if (p) {
      setEditingProp(p);
      setFTitle(p.title); setFDesc(''); setFPrice(p.price);
      setFLocation(p.location); setFNbh(p.neighbourhood || ''); setFType(p.type || 'Fully Detached');
      setFCat(p.category || 'SALE'); setFBeds(p.bedrooms); setFBaths(p.bathrooms);
      setFSqm(p.sqm ? String(p.sqm) : ''); setFBadge(p.badge || '');
      setFImages(p.images || '[]'); setFStatus(p.status);
      setFVideo((p as AdminProperty & { video?: string }).video || '');
      try { setFImagePreviews(JSON.parse(p.images || '[]')); } catch { setFImagePreviews([]); }
      setFVideoFile(null); setFVideoFileName(''); setVideoUploading(false); setVideoUploadProgress(null);
    } else {
      setEditingProp(null);
      setFTitle(''); setFDesc(''); setFPrice(''); setFLocation('');
      setFNbh(''); setFType('Fully Detached'); setFCat('SALE');
      setFBeds(4); setFBaths(4); setFSqm(''); setFBadge('');
      setFImages('[]'); setFVideo(''); setFVideoFile(null);
      setFVideoFileName(''); setVideoUploading(false); setVideoUploadProgress(null);
      setFImagePreviews([]); setFStatus('ACTIVE');
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!fTitle || !fPrice || !fLocation) {
      alert('Title, price and location are required.');
      return;
    }
    if (videoUploading) {
      alert('Please wait for the video to finish uploading.');
      return;
    }
    setSaving(true);
    const videoUrl = fVideo;
    const body = {
      title: fTitle, description: fDesc, price: fPrice,
      location: fLocation, neighbourhood: fNbh || null,
      type: fType, category: fCat,
      bedrooms: fBeds, bathrooms: fBaths,
      sqm: fSqm ? parseFloat(fSqm) : null,
      badge: fBadge || null,
      images: fImages || '[]',
      video: videoUrl || null,
      status: fStatus,
      features: '[]',
    };
    try {
      let res: Response;
      if (editingProp) {
        res = await fetch('/api/properties/' + editingProp.id, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/properties', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Save failed: ' + (err.error || `HTTP ${res.status}`));
        setSaving(false);
        return;
      }
      setModalOpen(false);
      await onRefresh();
    } catch {
      alert('Network error — please try again.');
    }
    setSaving(false);
  };

  const lbl: React.CSSProperties = { display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,0.5)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 6 };

  return (
    <div>
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,15,28,0.85)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 16px' }}
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div style={{ background: '#0D1E30', border: '1px solid rgba(192,168,112,0.15)', borderRadius: 4, padding: 32, width: '100%', maxWidth: 620 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#F4EDE0', marginBottom: 6 }}>
              {editingProp ? 'Edit Listing' : 'Add New Listing'}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(244,237,224,0.3)', marginBottom: 24 }}>
              {editingProp ? 'Update the listing details below.' : 'Fill in the details to create a new property listing.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Property Title *</label>
                <input className={styles.fi} value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="e.g. 4-Bedroom Duplex in Lekki Phase 1" />
              </div>
              <div>
                <label style={lbl}>Price *</label>
                <input className={styles.fi} value={fPrice} onChange={e => setFPrice(e.target.value)} placeholder="e.g. ₦450,000,000" />
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select className={styles.fsel} value={fCat} onChange={e => setFCat(e.target.value)}>
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                  <option value="SHORTLET">Shortlet</option>
                  <option value="JV">Joint Venture</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Property Type</label>
                <select className={styles.fsel} value={fType} onChange={e => setFType(e.target.value)}>
                  {['Fully Detached','Apartment','Semi-Detached','Penthouse','Villa','Townhouse','Maisonette'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Full Address *</label>
                <input className={styles.fi} value={fLocation} onChange={e => setFLocation(e.target.value)} placeholder="Street address, estate name" />
              </div>
              <div>
                <label style={lbl}>Neighbourhood</label>
                <input className={styles.fi} value={fNbh} onChange={e => setFNbh(e.target.value)} placeholder="e.g. Lekki Phase 1, Ikoyi…" />
              </div>
              <div>
                <label style={lbl}>Bedrooms</label>
                <input className={styles.fi} type="number" min={1} max={20} value={fBeds} onChange={e => setFBeds(parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <label style={lbl}>Bathrooms</label>
                <input className={styles.fi} type="number" min={1} max={20} value={fBaths} onChange={e => setFBaths(parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <label style={lbl}>Size (sqm)</label>
                <input className={styles.fi} value={fSqm} onChange={e => setFSqm(e.target.value)} placeholder="e.g. 650" />
              </div>
              <div>
                <label style={lbl}>Badge</label>
                <input className={styles.fi} value={fBadge} onChange={e => setFBadge(e.target.value)} placeholder="e.g. New, Hot, Featured" />
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select className={styles.fsel} value={fStatus} onChange={e => setFStatus(e.target.value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="RENTED">Rented</option>
                  <option value="SOLD">Sold</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Description</label>
                <textarea className={styles.fta} rows={3} value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Describe the property…" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Photos {uploadProgress && <span style={{ color: 'rgba(192,168,112,0.5)', fontWeight: 300 }}>— {uploadProgress}</span>}</label>
                <div
                  style={{ border: '1.5px dashed rgba(192,168,112,0.2)', borderRadius: 3, padding: '18px 16px', cursor: 'pointer', textAlign: 'center', marginBottom: fImagePreviews.length ? 12 : 0 }}
                  onClick={() => document.getElementById('imgUploadInput')?.click()}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>📷</div>
                  <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.4)' }}>Click to select photos — JPG, PNG, WEBP</div>
                  <div style={{ fontSize: 10, color: 'rgba(244,237,224,0.2)', marginTop: 3 }}>Multiple files supported</div>
                </div>
                <input
                  id="imgUploadInput"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={async e => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    const uploaded: string[] = [];
                    for (let i = 0; i < files.length; i++) {
                      setUploadProgress(`Uploading ${i + 1} of ${files.length}…`);
                      const fd = new FormData();
                      fd.append('file', files[i]);
                      fd.append('folder', 'images');
                      const res = await fetch('/api/upload', { method: 'POST', body: fd });
                      if (res.ok) { const d = await res.json(); uploaded.push(d.url); }
                      else { alert(`Failed to upload ${files[i].name}`); }
                    }
                    const newPreviews = [...fImagePreviews, ...uploaded];
                    setFImagePreviews(newPreviews);
                    setFImages(JSON.stringify(newPreviews));
                    setUploadProgress('');
                    e.target.value = '';
                  }}
                />
                {fImagePreviews.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {fImagePreviews.map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 80, height: 60 }}>
                        <img src={url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 2, border: '1px solid rgba(192,168,112,0.15)' }} />
                        <button
                          onClick={() => {
                            const next = fImagePreviews.filter((_, j) => j !== i);
                            setFImagePreviews(next);
                            setFImages(JSON.stringify(next));
                          }}
                          style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'rgba(224,112,112,0.85)', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Video</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={() => document.getElementById('videoUploadInput')?.click()}
                    disabled={videoUploading}
                    style={{ background: 'rgba(192,168,112,0.08)', border: '1px solid rgba(192,168,112,0.2)', borderRadius: 2, padding: '8px 14px', fontSize: 11, color: 'rgba(192,168,112,0.7)', cursor: videoUploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: videoUploading ? 0.6 : 1 }}
                  >
                    {videoUploading ? '⏳ Uploading…' : fVideo && !fVideo.startsWith('http') === false && fVideoFileName ? `✓ ${fVideoFileName}` : fVideo ? '✓ Video ready' : '📹 Upload video'}
                  </button>
                  <input
                    id="videoUploadInput"
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setFVideoFileName(file.name);
                      setFVideo('');
                      setVideoUploading(true);
                      setVideoUploadProgress(0);
                      try {
                        // Get signed upload params from server
                        const tokenRes = await fetch('/api/cloudinary-token', { method: 'POST' });
                        if (!tokenRes.ok) throw new Error('Failed to get upload token');
                        const { signature, timestamp, folder, cloudName, apiKey } = await tokenRes.json();

                        // Upload directly to Cloudinary — no file size limit, progress tracking
                        const fd = new FormData();
                        fd.append('file', file);
                        fd.append('signature', signature);
                        fd.append('timestamp', String(timestamp));
                        fd.append('folder', folder);
                        fd.append('api_key', apiKey);
                        fd.append('resource_type', 'video');

                        await new Promise<void>((resolve, reject) => {
                          const xhr = new XMLHttpRequest();
                          xhr.upload.onprogress = (ev) => {
                            if (ev.lengthComputable) setVideoUploadProgress(Math.round((ev.loaded / ev.total) * 100));
                          };
                          xhr.onload = () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                              try {
                                const data = JSON.parse(xhr.responseText);
                                setFVideo(data.secure_url);
                                resolve();
                              } catch { reject(new Error('Invalid response from Cloudinary')); }
                            } else {
                              reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
                            }
                          };
                          xhr.onerror = () => reject(new Error('Network error'));
                          xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
                          xhr.send(fd);
                        });
                      } catch (err) {
                        const msg = err instanceof Error ? err.message : String(err);
                        console.error('Video upload error:', msg);
                        alert(`Video upload failed: ${msg}`);
                      } finally {
                        setVideoUploading(false);
                        setVideoUploadProgress(null);
                        e.target.value = '';
                      }
                    }}
                  />
                  <input
                    className={styles.fi}
                    value={fVideo}
                    onChange={e => { setFVideo(e.target.value); setFVideoFileName(''); }}
                    placeholder="Or paste a video URL (YouTube, Vimeo, direct link…)"
                    disabled={videoUploading}
                  />
                </div>
                {videoUploading && videoUploadProgress !== null && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(192,168,112,0.6)', marginBottom: 4 }}>
                      <span>Uploading {fVideoFileName}…</span>
                      <span>{videoUploadProgress}%</span>
                    </div>
                    <div style={{ background: 'rgba(192,168,112,0.1)', borderRadius: 2, height: 4, overflow: 'hidden' }}>
                      <div style={{ background: '#C0A870', height: '100%', width: `${videoUploadProgress}%`, transition: 'width 0.2s ease', borderRadius: 2 }} />
                    </div>
                  </div>
                )}
                {!videoUploading && fVideo && fVideoFileName && (
                  <div style={{ fontSize: 10, color: 'rgba(192,168,112,0.55)', marginTop: 4 }}>✓ {fVideoFileName} uploaded successfully</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: '1px solid rgba(192,168,112,0.2)', borderRadius: 2, padding: '10px 20px', color: 'rgba(244,237,224,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--fb)' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || videoUploading} style={{ background: '#C0A870', border: 'none', borderRadius: 2, padding: '10px 24px', color: '#060F1C', fontSize: 12, fontWeight: 600, cursor: (saving || videoUploading) ? 'not-allowed' : 'pointer', opacity: (saving || videoUploading) ? 0.6 : 1 }}>
                {saving ? 'Saving…' : videoUploading ? `Uploading video ${videoUploadProgress ?? 0}%…` : editingProp ? 'Save Changes →' : 'Create Listing →'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.secHdr} style={{ marginBottom: 20 }}>
        <div className={styles.secTitle}>All Listings</div>
        <button className={styles.btnAdd} style={{ fontSize: 11, padding: '8px 16px' }} onClick={() => openModal()}>
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
                      <img src={firstPropImage(p.images, 200)} alt={p.title} />
                    </div>
                    <div>
                      <div className={styles.propNameCell}>{p.title}</div>
                      <div className={styles.propLocCell}>{p.location}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${p.status === 'ACTIVE' ? styles.bConfirmed : p.status === 'PENDING' ? styles.bPending : styles.bCompleted}`}>
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'rgba(244,237,224,0.45)' }}>
                  {p.bedrooms} Beds · {p.bathrooms} Baths · {p.sqm} sqm
                </td>
                <td>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      className={styles.raBtn}
                      style={{ opacity: 1 }}
                      disabled={acting !== null}
                      onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                    >
                      {acting && acting.startsWith(p.id) ? '…' : 'Actions ▾'}
                    </button>
                    {openMenu === p.id && (
                      <div style={{
                        position: 'absolute', top: '100%', right: 0, zIndex: 200, marginTop: 4,
                        background: '#0D1E30', border: '1px solid rgba(192,168,112,0.15)',
                        borderRadius: 3, minWidth: 160, overflow: 'hidden',
                      }}>
                        {['Edit', 'Mark as Rented', 'Mark as Sold', 'Deactivate', 'Delete'].map(action => (
                          <button
                            key={action}
                            onClick={() => doAction(p, action)}
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
              <img src={firstPropImage(p.images, 400)} alt={p.title} />
              {p.badge && <div className={styles.lbadge}>{p.badge}</div>}
            </div>
            <div className={styles.lcardBody}>
              <div className={styles.lcardName}>{p.title}</div>
              <div className={styles.lcardPrice}>{p.price}</div>
              <div className={styles.lcardMeta}>{p.location} · {p.bedrooms} Beds · For Sale</div>
              <div className={styles.lcardActions}>
                <button className={styles.lcbtn} onClick={() => openModal(p)}>Edit</button>
                <button className={styles.lcbtn} onClick={() => doAction(p, 'Mark as Sold')}>Sold</button>
                <button className={styles.lcbtn} onClick={() => doAction(p, 'Delete')}>Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CALENDAR TAB ───────────────────────────────────────────────────────────

function CalendarTab({ properties }: { properties: AdminProperty[] }) {
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
    const classes = [styles.calDay, isWe ? styles.calWe : '', isToday ? styles.calToday : ''].filter(Boolean).join(' ');
    calCells.push(
      <div key={day} className={classes}>
        <div className={styles.calDn}>{day}</div>
        {!isWe && (
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
          {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
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

function GenerateLinkTab({ properties }: { properties: AdminProperty[] }) {
  const [propVal, setPropVal] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [note, setNote] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expiryDaysDisplay, setExpiryDaysDisplay] = useState<number>(7);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      let expiryDays = 7;
      if (expiryDate) {
        const diff = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff > 0) expiryDays = diff;
      }
      const res = await fetch('/api/booking-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: propVal || null,
          clientName: clientName || null,
          clientPhone: clientPhone || null,
          note: note || null,
          expiryDays,
        }),
      });
      const data = await res.json();
      if (data.code) {
        setGeneratedUrl(`rokhaven.com/book/${data.code}`);
        setExpiryDaysDisplay(expiryDays);
        setCopied(false);
      }
    } catch {
      // silently fail
    }
    setGenerating(false);
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
            {properties.map(p => <option key={p.id} value={p.id}>{p.title} — {p.location}</option>)}
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
        <button className={styles.btnGen} onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating…' : 'Generate Booking Link →'}
        </button>
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
            Expires in {expiryDaysDisplay} days
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
            <div style={{ background: '#fff', padding: 8, borderRadius: 2, width: 116, height: 116, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {generatedUrl ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://' + generatedUrl)}`}
                  alt="QR code"
                  width={100}
                  height={100}
                />
              ) : (
                <div style={{ width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: 1.4 }}>
                  Generate a link first
                </div>
              )}
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

function InspectionsTab({ inspections, onRefresh }: { inspections: AdminInspection[]; onRefresh: () => void }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const statuses = ['All', 'Pending', 'Confirmed', 'Completed'];
  const filtered = statusFilter === 'All' ? inspections : inspections.filter(i => i.status.toUpperCase() === statusFilter.toUpperCase());
  const [rescheduleInsp, setRescheduleInsp] = useState<AdminInspection | null>(null);

  const confirmInspection = async (id: string) => {
    await fetch('/api/inspections/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CONFIRMED' }) });
    onRefresh();
  };

  return (
    <div>
      {rescheduleInsp && (
        <RescheduleModal
          inspection={rescheduleInsp}
          onClose={() => setRescheduleInsp(null)}
          onDone={() => { setRescheduleInsp(null); onRefresh(); }}
        />
      )}
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
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(insp => (
              <tr key={insp.id}>
                <td style={{ color: 'rgba(192,168,112,0.5)', fontSize: 11 }}>{insp.referenceNo || insp.id.slice(0, 8)}</td>
                <td className={styles.strong}>
                  {insp.clientName}<br />
                  <span style={{ fontSize: 10, color: 'rgba(244,237,224,0.3)', fontWeight: 300 }}>{insp.clientPhone}</span>
                </td>
                <td>
                  <div>
                    <div className={styles.propNameCell}>{insp.property?.title || 'Unknown'}</div>
                    <div className={styles.propLocCell}>{insp.property?.location || ''}</div>
                  </div>
                </td>
                <td>{insp.preferredDate}</td>
                <td>{insp.preferredTime}</td>
                <td><Badge status={insp.status} /></td>
                <td style={{ fontSize: 11, color: 'rgba(244,237,224,0.35)', maxWidth: 140 }}>{insp.notes || '—'}</td>
                <td>
                  <div className={styles.rowActions}>
                    {insp.status === 'PENDING' && <button className={styles.raBtn} onClick={() => confirmInspection(insp.id)}>Confirm</button>}
                    <button className={styles.raBtn} onClick={() => setStatusFilter(insp.status.charAt(0) + insp.status.slice(1).toLowerCase())}>View</button>
                    <button className={styles.raBtn} onClick={() => setRescheduleInsp(insp)}>Reschedule</button>
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

function BookingsSection({ properties, inspections, onRefresh }: {
  properties: AdminProperty[];
  inspections: AdminInspection[];
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<BookingTab>('calendar');

  return (
    <div>
      <div className={styles.subTabs}>
        <button className={`${styles.stab} ${tab === 'calendar' ? styles.stabOn : ''}`} onClick={() => setTab('calendar')}>📅 Calendar</button>
        <button className={`${styles.stab} ${tab === 'link' ? styles.stabOn : ''}`} onClick={() => setTab('link')}>🔗 Generate Booking Link</button>
        <button className={`${styles.stab} ${tab === 'inspections' ? styles.stabOn : ''}`} onClick={() => setTab('inspections')}>📋 All Inspections</button>
      </div>
      {tab === 'calendar' && <CalendarTab properties={properties} />}
      {tab === 'link' && <GenerateLinkTab properties={properties} />}
      {tab === 'inspections' && <InspectionsTab inspections={inspections} onRefresh={onRefresh} />}
    </div>
  );
}

// ─── LEADS SECTION ──────────────────────────────────────────────────────────

function nameInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

const LEAD_COLUMNS: { key: LeadStatus; label: string; color?: string }[] = [
  { key: 'New', label: 'New Leads' },
  { key: 'Contacted', label: 'Contacted' },
  { key: 'Booked', label: 'Inspection Booked' },
  { key: 'InspectionDone', label: 'Inspection Done', color: '#5DC882' },
  { key: 'Closed', label: 'Closed', color: '#5DC882' },
  { key: 'Failed', label: 'Failed', color: 'rgba(224,112,112,0.7)' },
];

function parseNoteHistory(notes: string | undefined): { date: string; text: string }[] {
  if (!notes) return [];
  return notes.split('\n').filter(l => l.trim()).map(line => {
    const m = line.match(/^\[(.+?)\] (.+)$/);
    return m ? { date: m[1], text: m[2] } : { date: '', text: line };
  }).reverse();
}

function ContactPanel({ lead, onClose, onMove, onUpdateNotes }: { lead: Lead; onClose: () => void; onMove: (status: LeadStatus) => void; onUpdateNotes: (notes: string) => void }) {
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const noteHistory = parseNoteHistory(lead.notes);

  const saveFeedback = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const entry = `[${dateStr}] ${newNote.trim()}`;
    const combined = lead.notes ? `${lead.notes}\n${entry}` : entry;
    const url = lead.sourceType === 'enquiry' ? `/api/enquiries/${lead.id}` : `/api/inspections/${lead.id}`;
    await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: combined }) });
    setSaving(false);
    setSaved(true);
    setNewNote('');
    onUpdateNotes(combined);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(6,15,28,0.72)', display: 'flex', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{ width: 420, maxWidth: '100vw', background: '#0e1f38', borderLeft: '1px solid rgba(192,168,112,0.14)', height: '100%', overflowY: 'auto', padding: '32px 28px 48px', display: 'flex', flexDirection: 'column', gap: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(192,168,112,0.45)', textTransform: 'uppercase' }}>Contact Session</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(244,237,224,0.4)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(192,168,112,0.12)', border: '1px solid rgba(192,168,112,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 500, color: '#C0A870', flexShrink: 0 }}>
            {nameInitials(lead.name)}
          </div>
          <div>
            <div style={{ fontSize: 18, fontFamily: "'DM Serif Display', serif", color: '#f4ede0', marginBottom: 4 }}>{lead.name}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 2, background: lead.source === 'instagram' ? 'rgba(228,64,95,0.12)' : lead.source === 'inspection' ? 'rgba(192,168,112,0.1)' : 'rgba(255,255,255,0.06)', color: lead.source === 'instagram' ? '#E4405F' : lead.source === 'inspection' ? '#C0A870' : 'rgba(244,237,224,0.5)', border: '1px solid', borderColor: lead.source === 'instagram' ? 'rgba(228,64,95,0.25)' : lead.source === 'inspection' ? 'rgba(192,168,112,0.2)' : 'rgba(255,255,255,0.08)' }}>
                {lead.source === 'instagram' ? '📸 Instagram' : lead.source === 'inspection' ? '🏠 Inspection' : '🌐 Website'}
              </span>
              <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 2, background: 'rgba(255,255,255,0.04)', color: 'rgba(244,237,224,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {LEAD_COLUMNS.find(c => c.key === lead.status)?.label || lead.status}
              </span>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(11,27,53,0.5)', border: '1px solid rgba(192,168,112,0.08)', borderRadius: 3, padding: '16px 18px', marginBottom: 18 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.3em', color: 'rgba(192,168,112,0.4)', textTransform: 'uppercase', marginBottom: 12 }}>Contact Details</div>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textDecoration: 'none' }}>
              <span style={{ fontSize: 14 }}>📞</span>
              <span style={{ fontSize: 13, color: '#f4ede0' }}>{lead.phone}</span>
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textDecoration: 'none' }}>
              <span style={{ fontSize: 14 }}>✉️</span>
              <span style={{ fontSize: 13, color: '#f4ede0' }}>{lead.email}</span>
            </a>
          )}
          {lead.phone && (
            <a
              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, this is RokHaven Realty reaching out regarding your enquiry.`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '7px 14px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 2, fontSize: 11, color: '#25D366', textDecoration: 'none', letterSpacing: '0.06em' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893C23.943 5.337 18.608.001 12.05 0z"/></svg>
              Message on WhatsApp
            </a>
          )}
        </div>

        <div style={{ background: 'rgba(11,27,53,0.5)', border: '1px solid rgba(192,168,112,0.08)', borderRadius: 3, padding: '16px 18px', marginBottom: 18 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.3em', color: 'rgba(192,168,112,0.4)', textTransform: 'uppercase', marginBottom: 12 }}>What They Want</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: 'rgba(192,168,112,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Property</div>
            <div style={{ fontSize: 13, color: '#f4ede0' }}>{lead.property}</div>
          </div>
          {lead.intent && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: 'rgba(192,168,112,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Intent</div>
              <div style={{ fontSize: 13, color: '#f4ede0' }}>{lead.intent}</div>
            </div>
          )}
          {lead.budget && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: 'rgba(192,168,112,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Budget</div>
              <div style={{ fontSize: 13, color: '#C0A870', fontWeight: 500 }}>{lead.budget}</div>
            </div>
          )}
          {lead.time && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: 'rgba(192,168,112,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Preferred Time</div>
              <div style={{ fontSize: 13, color: '#f4ede0' }}>{lead.date} at {lead.time}</div>
            </div>
          )}
          {lead.referenceNo && (
            <div>
              <div style={{ fontSize: 9, color: 'rgba(192,168,112,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Reference</div>
              <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.5)', fontFamily: 'monospace' }}>{lead.referenceNo}</div>
            </div>
          )}
        </div>

        {/* Feedback / Notes — history + new entry */}
        <div style={{ background: 'rgba(11,27,53,0.5)', border: '1px solid rgba(192,168,112,0.08)', borderRadius: 3, padding: '16px 18px', marginBottom: 18 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.3em', color: 'rgba(192,168,112,0.4)', textTransform: 'uppercase', marginBottom: 12 }}>Feedback / Notes</div>

          {/* History entries — newest first */}
          {noteHistory.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {noteHistory.map((entry, i) => (
                <div key={i} style={{ padding: '8px 12px', background: 'rgba(6,15,28,0.45)', borderRadius: 2, borderLeft: '2px solid rgba(192,168,112,0.22)' }}>
                  {entry.date && (
                    <div style={{ fontSize: 9, color: 'rgba(192,168,112,0.5)', letterSpacing: '0.1em', marginBottom: 3 }}>{entry.date}</div>
                  )}
                  <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.75)', lineHeight: 1.65 }}>{entry.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* New note input */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 8, color: 'rgba(192,168,112,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Add Note</div>
            {saved && <span style={{ fontSize: 10, color: '#5DC882' }}>Saved ✓</span>}
          </div>
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Write a note…"
            rows={3}
            style={{ width: '100%', background: 'rgba(6,15,28,0.5)', border: '1px solid rgba(192,168,112,0.12)', borderRadius: 2, color: '#f4ede0', fontSize: 13, padding: '10px 12px', resize: 'vertical', outline: 'none', lineHeight: 1.75, boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' }}
          />
          <button
            onClick={saveFeedback}
            disabled={saving || !newNote.trim()}
            style={{ marginTop: 8, padding: '8px 18px', background: 'rgba(192,168,112,0.15)', border: '1px solid rgba(192,168,112,0.3)', borderRadius: 2, color: '#C0A870', fontSize: 11, cursor: saving || !newNote.trim() ? 'default' : 'pointer', letterSpacing: '0.1em', opacity: !newNote.trim() ? 0.45 : 1 }}
          >
            {saving ? 'Saving…' : 'Save Note'}
          </button>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.3em', color: 'rgba(192,168,112,0.4)', textTransform: 'uppercase', marginBottom: 10 }}>Move Stage</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {LEAD_COLUMNS.map(c => (
              <button
                key={c.key}
                onClick={() => onMove(c.key)}
                style={{
                  padding: '9px 14px', borderRadius: 2, fontSize: 11, cursor: 'pointer', textAlign: 'left',
                  border: '1px solid',
                  borderColor: lead.status === c.key ? (c.color || 'rgba(192,168,112,0.5)') : 'rgba(192,168,112,0.1)',
                  background: lead.status === c.key ? 'rgba(192,168,112,0.1)' : 'transparent',
                  color: lead.status === c.key ? (c.color || '#C0A870') : 'rgba(244,237,224,0.4)',
                  fontWeight: lead.status === c.key ? 500 : 400,
                }}
              >
                {lead.status === c.key ? '● ' : '○ '}{c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type LeadSource = 'website' | 'instagram' | 'inspection';
type Lead = {
  id: string; sourceType: 'enquiry' | 'inspection';
  name: string; email?: string; property: string; date: string;
  status: LeadStatus; source: LeadSource; phone?: string; notes?: string;
  budget?: string; intent?: string; time?: string; referenceNo?: string;
};

function leadStatusToDb(status: LeadStatus, sourceType: 'enquiry' | 'inspection'): string {
  if (sourceType === 'enquiry') {
    if (status === 'New') return 'NEW';
    if (status === 'Contacted') return 'CONTACTED';
    if (status === 'Booked') return 'IN_PROGRESS';
    if (status === 'InspectionDone') return 'INSPECTION_DONE';
    if (status === 'Closed') return 'CLOSED';
    if (status === 'Failed') return 'FAILED';
    return 'NEW';
  } else {
    if (status === 'New' || status === 'Contacted') return 'PENDING';
    if (status === 'Booked') return 'CONFIRMED';
    if (status === 'InspectionDone') return 'COMPLETED';
    if (status === 'Closed') return 'COMPLETED';
    if (status === 'Failed') return 'CANCELLED';
    return 'PENDING';
  }
}

async function persistLeadStatus(lead: Lead, newStatus: LeadStatus) {
  const dbStatus = leadStatusToDb(newStatus, lead.sourceType);
  const url = lead.sourceType === 'enquiry'
    ? `/api/enquiries/${lead.id}`
    : `/api/inspections/${lead.id}`;
  await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: dbStatus }) });
}

function toLeadStatus(s: string): LeadStatus {
  if (s === 'NEW') return 'New';
  if (s === 'CONTACTED') return 'Contacted';
  if (s === 'IN_PROGRESS') return 'Booked';
  if (s === 'INSPECTION_DONE') return 'InspectionDone';
  if (s === 'FAILED') return 'Failed';
  if (s === 'CLOSED') return 'Closed';
  return 'New';
}

function inspectionToLeadStatus(s: string): LeadStatus {
  if (s === 'PENDING') return 'New';
  if (s === 'CONFIRMED') return 'Booked';
  if (s === 'COMPLETED') return 'InspectionDone';
  if (s === 'CANCELLED') return 'Failed';
  return 'Closed';
}

function LeadsSection({ enquiries, inspections, onRefresh, onSelectLead }: { enquiries: AdminEnquiry[]; inspections: AdminInspection[]; onRefresh: () => void; onSelectLead: (lead: Lead) => void }) {
  const buildLeads = () => {
    const fromEnquiries: Lead[] = enquiries.map(e => ({
      id: e.id, sourceType: 'enquiry' as const,
      name: e.name, email: e.email,
      property: e.property?.title || (e.howHeard === 'Instagram' ? 'Instagram DM' : 'General Enquiry'),
      date: new Date(e.createdAt).toLocaleDateString(),
      status: toLeadStatus(e.status),
      source: (e.howHeard === 'Instagram' ? 'instagram' : 'website') as LeadSource,
      phone: e.phone, budget: e.budget || undefined, intent: e.intent || undefined,
      notes: e.intent === 'Instagram DM' ? 'Via Instagram Direct' : undefined,
    }));
    const fromInspections: Lead[] = inspections.map(i => ({
      id: i.id, sourceType: 'inspection' as const,
      name: i.clientName,
      property: i.property?.title || 'Unknown Property',
      date: i.preferredDate, time: i.preferredTime,
      status: inspectionToLeadStatus(i.status),
      source: 'inspection' as LeadSource,
      phone: i.clientPhone, referenceNo: i.referenceNo || undefined, notes: i.notes || undefined,
    }));
    const allNames = new Set(fromEnquiries.map(l => l.name));
    const dedupedInspections = fromInspections.filter(l => !allNames.has(l.name));
    return [...fromEnquiries, ...dedupedInspections];
  };

  const [leads, setLeads] = useState<Lead[]>(buildLeads);
  const [sourceFilter, setSourceFilter] = useState<'all' | LeadSource>('all');

  useEffect(() => {
    setLeads(buildLeads());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiries, inspections]);

  const columns = LEAD_COLUMNS;

  const moveLead = (lead: Lead, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
    persistLeadStatus(lead, newStatus).catch(() => {});
  };

  const filteredLeads = sourceFilter === 'all' ? leads : leads.filter(l => l.source === sourceFilter);
  const igCount = leads.filter(l => l.source === 'instagram').length;

  return (
    <div>
      <div className={styles.secHdr} style={{ marginBottom: 16 }}>
        <div className={styles.secTitle}>Leads Pipeline</div>
        <button className={styles.secLink}>Export →</button>
      </div>

      {/* Source filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'website', 'instagram', 'inspection'] as const).map(f => (
          <button
            key={f}
            onClick={() => setSourceFilter(f)}
            style={{
              padding: '5px 14px', borderRadius: 2, fontSize: 11, cursor: 'pointer', letterSpacing: '0.08em',
              border: '1px solid',
              borderColor: sourceFilter === f ? 'rgba(192,168,112,0.6)' : 'rgba(192,168,112,0.18)',
              background: sourceFilter === f ? 'rgba(192,168,112,0.12)' : 'transparent',
              color: sourceFilter === f ? '#C0A870' : 'rgba(244,237,224,0.45)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {f === 'instagram' && <span>📸</span>}
            {f === 'website' && <span>🌐</span>}
            {f === 'inspection' && <span>🏠</span>}
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'instagram' && igCount > 0 && (
              <span style={{ background: '#E4405F', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 9 }}>{igCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Pipeline board — horizontally scrollable */}
      <div className={styles.pipeScroll}>
        <div className={styles.pipeBoard}>
          {columns.map(col => {
            const colLeads = filteredLeads.filter(l => l.status === col.key);
            return (
              <div key={col.key} className={styles.pipeCol} style={{ width: 170, flexShrink: 0, ...(col.key === 'Failed' ? { borderColor: 'rgba(224,112,112,0.15)' } : col.key === 'InspectionDone' || col.key === 'Closed' ? { borderColor: 'rgba(93,200,130,0.15)' } : {}) }}>
                <div className={styles.pipeHead} style={col.color ? { color: col.color } : {}}>
                  {col.label}
                  <span className={styles.pipeCount}>{colLeads.length}</span>
                </div>
                {colLeads.map((lead, i) => (
                  <div key={i} className={styles.leadCard} onClick={() => onSelectLead(lead)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
                      <div className={styles.leadName}>{lead.name}</div>
                      {lead.source === 'instagram' && (
                        <span style={{ fontSize: 9, background: 'rgba(228,64,95,0.15)', color: '#E4405F', border: '1px solid rgba(228,64,95,0.3)', borderRadius: 2, padding: '2px 6px', letterSpacing: '0.1em', whiteSpace: 'nowrap', marginLeft: 6 }}>
                          📸 IG
                        </span>
                      )}
                      {lead.source === 'inspection' && (
                        <span style={{ fontSize: 9, background: 'rgba(192,168,112,0.1)', color: 'rgba(192,168,112,0.6)', border: '1px solid rgba(192,168,112,0.2)', borderRadius: 2, padding: '2px 6px', letterSpacing: '0.1em', whiteSpace: 'nowrap', marginLeft: 6 }}>
                          🏠 Booking
                        </span>
                      )}
                    </div>
                    <div className={styles.leadProp}>{lead.property}</div>
                    {lead.notes && (
                      <div style={{ fontSize: 10, color: 'rgba(244,237,224,0.35)', marginTop: 2, fontStyle: 'italic' }}>{lead.notes}</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                      <div className={styles.leadTime} style={col.color ? { color: col.color } : {}}>
                        {lead.date}
                      </div>
                      <select
                        className={styles.fsel}
                        style={{ width: 'auto', padding: '3px 26px 3px 8px', fontSize: 10, border: '1px solid rgba(192,168,112,0.18)' }}
                        value={lead.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => moveLead(lead, e.target.value as LeadStatus)}
                      >
                        {columns.map(c => <option key={c.key} value={c.key}>→ {c.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ─── EDITABLE REMINDER SCHEDULE ─────────────────────────────────────────────

type ReminderSlot = { timing: string; email: boolean; whatsapp: boolean; sms: boolean };

function ReminderScheduleCard() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slots, setSlots] = useState<ReminderSlot[]>([
    { timing: '48', email: true, whatsapp: true, sms: true },
    { timing: '24', email: true, whatsapp: true, sms: true },
    { timing: '2',  email: false, whatsapp: true, sms: true },
  ]);
  const [staged, setStaged] = useState<ReminderSlot[]>(slots);

  const startEdit = () => { setStaged(slots.map(s => ({ ...s }))); setEditing(true); setSaved(false); };
  const cancel = () => setEditing(false);
  const save = () => { setSlots(staged); setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const toggle = (i: number, ch: 'email' | 'whatsapp' | 'sms') => {
    setStaged(prev => prev.map((s, idx) => idx === i ? { ...s, [ch]: !s[ch] } : s));
  };

  const channelLabel = (s: ReminderSlot) =>
    [s.email && 'Email', s.whatsapp && 'WhatsApp', s.sms && 'SMS'].filter(Boolean).join(' + ') || 'None';

  return (
    <div className={styles.reminderSchedule}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className={styles.intSectionLabel} style={{ marginBottom: 0 }}>Automated Reminder Schedule</div>
        {!editing ? (
          <button className={styles.raBtn} style={{ opacity: 1 }} onClick={startEdit}>Edit Schedule</button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={styles.raBtn} style={{ opacity: 1 }} onClick={cancel}>Cancel</button>
            <button className={styles.raBtn} style={{ opacity: 1, background: 'var(--gold)', color: '#060F1C' }} onClick={save}>Save</button>
          </div>
        )}
      </div>
      {saved && <div style={{ fontSize: 12, color: '#5DC882', marginBottom: 10 }}>Schedule saved ✓</div>}
      {!editing ? (
        <div className={styles.reminderScheduleRow}>
          {slots.map((s, i) => (
            <div key={i} className={styles.reminderItem}>
              <div className={styles.reminderDot} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--ivory)', fontWeight: 400 }}>{s.timing} hours before</div>
                <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.3)' }}>{channelLabel(s)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {staged.map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(192,168,112,0.1)', borderRadius: 3, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={s.timing}
                    onChange={e => setStaged(prev => prev.map((sl, idx) => idx === i ? { ...sl, timing: e.target.value } : sl))}
                    style={{ width: 56, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(192,168,112,0.2)', color: '#f4ede0', padding: '6px 10px', fontSize: 13, borderRadius: 2, outline: 'none' }}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(244,237,224,0.4)' }}>hours before</span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {(['email', 'whatsapp', 'sms'] as const).map(ch => (
                    <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: s[ch] ? 'var(--gold)' : 'rgba(244,237,224,0.3)' }}>
                      <input
                        type="checkbox"
                        checked={s[ch]}
                        onChange={() => toggle(i, ch)}
                        style={{ accentColor: '#C0A870', cursor: 'pointer' }}
                      />
                      {ch === 'whatsapp' ? 'WhatsApp' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── REMINDERS SECTION ──────────────────────────────────────────────────────

function RemindersSection({ inspections }: { inspections: AdminInspection[] }) {
  const reminders = inspections.filter(i => i.status === 'PENDING' || i.status === 'CONFIRMED').slice(0, 10);
  const [emailToggles, setEmailToggles] = useState<boolean[]>(() => reminders.map(() => true));
  const [waToggles, setWaToggles] = useState<boolean[]>(() => reminders.map(() => true));

  useEffect(() => {
    setEmailToggles(reminders.map(() => true));
    setWaToggles(reminders.map(() => true));
  }, [inspections]);

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
            {reminders.map((insp, i) => (
              <tr key={insp.id}>
                <td className={styles.strong}>
                  {insp.clientName}<br />
                  <span style={{ fontSize: 10, color: 'rgba(244,237,224,0.3)', fontWeight: 300 }}>{insp.clientPhone}</span>
                </td>
                <td>
                  <div className={styles.propNameCell}>{insp.property?.title || 'Unknown'}</div>
                  <div className={styles.propLocCell}>{insp.property?.location || ''}</div>
                </td>
                <td>{insp.preferredDate + ' ' + insp.preferredTime}</td>
                <td>
                  <div className={styles.remStatus}>
                    <span className={`${styles.remPill} ${styles.remPending}`}>
                      48hr ⏳
                    </span>
                    <span className={`${styles.remPill} ${styles.remPending}`}>
                      24hr ⏳
                    </span>
                    <span className={`${styles.remPill} ${styles.remPending}`}>
                      2hr ⏳
                    </span>
                  </div>
                </td>
                <td>
                  <Toggle on={emailToggles[i] ?? true} onToggle={() => setEmailToggles(prev => prev.map((v, idx) => idx === i ? !v : v))} />
                </td>
                <td>
                  <Toggle on={waToggles[i] ?? true} onToggle={() => setWaToggles(prev => prev.map((v, idx) => idx === i ? !v : v))} />
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
      <ReminderScheduleCard />
    </div>
  );
}

// ─── SETTINGS: INTEGRATION TAB ──────────────────────────────────────────────

function IntegrationTab() {
  const [activeEmail, setActiveEmail] = useState('resend');
  const [setupModal, setSetupModal] = useState<{ name: string; instructions: string } | null>(null);
  const [waActive, setWaActive] = useState(false);
  const [waTesting, setWaTesting] = useState(false);
  const [waTestMsg, setWaTestMsg] = useState('');
  const [igActive, setIgActive] = useState(false);

  useEffect(() => {
    fetch('/api/admin/integrations/status')
      .then(r => r.json())
      .then(d => {
        if (d.whatsapp) setWaActive(true);
        if (d.instagram) setIgActive(true);
      })
      .catch(() => {});
  }, []);

  async function sendWaTest() {
    setWaTesting(true);
    setWaTestMsg('');
    try {
      const res = await fetch('/api/admin/integrations/whatsapp/test', { method: 'POST' });
      const d = await res.json();
      setWaTestMsg(res.ok ? '✓ Test message sent to your WhatsApp number.' : d.error || 'Failed.');
    } catch {
      setWaTestMsg('Request failed.');
    } finally {
      setWaTesting(false);
    }
  }

  const SETUP_INSTRUCTIONS: Record<string, string> = {
    'Google Calendar': 'To connect Google Calendar, enable the Google Calendar API in Google Cloud Console, create OAuth credentials, and add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.',
    'Microsoft Outlook / Office 365': 'Register an app in Azure Active Directory, grant Calendar.ReadWrite permissions, and add AZURE_CLIENT_ID and AZURE_CLIENT_SECRET to your environment variables.',
    'Apple Calendar (iCal)': 'Apple Calendar sync works via iCal feed URL. Generate a secret iCal URL from your calendar settings and add it to your environment as ICAL_FEED_URL.',
    'WhatsApp Business API': 'Apply for WhatsApp Business API access via Meta for Developers. Once approved, add WHATSAPP_API_TOKEN and WHATSAPP_PHONE_ID to your environment variables.',
    'Telegram Bot': 'Create a bot via @BotFather on Telegram, copy the bot token, and add TELEGRAM_BOT_TOKEN to your environment variables.',
    'Instagram Direct (via Meta API)': 'In Meta Developer Portal, connect your Instagram Business account, add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_WEBHOOK_TOKEN to your Vercel environment variables, then set the webhook URL to https://www.rokhaven.com/api/webhooks/instagram.',
    'Salesforce CRM': 'Create a connected app in Salesforce Setup, copy the Consumer Key and Secret, and add SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET to your environment variables.',
    'HubSpot CRM': 'Create a private app in your HubSpot account, grant CRM contacts and deals scopes, and add HUBSPOT_API_KEY to your environment variables.',
    'Zapier': 'In Zapier, create a new Zap with a Webhook trigger. Copy the webhook URL and add it as ZAPIER_WEBHOOK_URL to your environment variables.',
  };

  function IntCard({ icon, iconBg, name, desc, active, comingSoon, onTest, testLabel }: {
    icon: React.ReactNode; iconBg: string; name: string; desc: string; active?: boolean; comingSoon?: boolean;
    onTest?: () => void; testLabel?: string;
  }) {
    return (
      <div className={styles.intCard}>
        <div className={styles.intIcon} style={{ background: iconBg }}>{icon}</div>
        <div className={styles.intInfo}>
          <div className={styles.intName}>{name}</div>
          <div className={styles.intDesc}>{desc}</div>
        </div>
        {active ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <button className={`${styles.intBtn} ${styles.intBtnConnected}`}>✓ Active</button>
            {onTest && (
              <button
                onClick={onTest}
                style={{ fontSize: 10, color: 'rgba(192,168,112,0.55)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em', whiteSpace: 'nowrap', padding: 0 }}
              >
                {testLabel || 'Send test →'}
              </button>
            )}
          </div>
        ) : comingSoon ? (
          <span style={{ fontSize: 10, color: 'rgba(192,168,112,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Coming Soon</span>
        ) : (
          <button
            className={styles.intBtn}
            onClick={() => setSetupModal({ name, instructions: SETUP_INSTRUCTIONS[name] || 'Contact your development team for setup instructions.' })}
          >
            Setup →
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {setupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,15,28,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => e.target === e.currentTarget && setSetupModal(null)}>
          <div style={{ background: '#0D1E30', border: '1px solid rgba(192,168,112,0.15)', borderRadius: 4, padding: 28, maxWidth: 500, width: '100%' }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#F4EDE0', marginBottom: 12 }}>{setupModal.name}</div>
            <p style={{ fontSize: 13, color: 'rgba(244,237,224,0.55)', lineHeight: 1.7, marginBottom: 20 }}>{setupModal.instructions}</p>
            <div style={{ fontSize: 11, color: 'rgba(192,168,112,0.45)', marginBottom: 20 }}>Add the required environment variables in your Vercel project settings, then redeploy.</div>
            <button onClick={() => setSetupModal(null)} style={{ background: '#C0A870', border: 'none', borderRadius: 2, padding: '10px 24px', color: '#060F1C', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Got it
            </button>
          </div>
        </div>
      )}

      <div className={styles.spTitle}>Integrations</div>
      <div className={styles.spSub}>Connect RokHaven to external services to automate your booking workflow, calendar sync, and client communications.</div>

      <div className={styles.intSectionLabel}>📅 Calendar</div>
      <IntCard
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
        iconBg="#4285F4" name="Google Calendar"
        desc="Each admin connects their own Google Calendar individually. Go to Account → My Integrations to connect yours."
        active
      />
      <IntCard icon="📅" iconBg="#0078D4" name="Microsoft Outlook / Office 365"
        desc="Connect your Outlook calendar for automatic inspection scheduling and team-wide calendar visibility."
      />
      <IntCard icon="📱" iconBg="#1a73e8" name="Apple Calendar (iCal)"
        desc="Sync inspections to Apple Calendar via iCal feed. Compatible with iOS and macOS Calendar apps."
      />

      <div className={`${styles.intSectionLabel} ${styles.intSectionLabelSpaced}`}>💬 Messaging</div>
      <IntCard
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.8 9.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>}
        iconBg="#25D366" name="WhatsApp Business API"
        desc="Send automated inspection reminders, booking confirmations, and follow-up messages via WhatsApp."
        active={waActive}
        onTest={waTesting ? undefined : sendWaTest}
        testLabel={waTesting ? 'Sending…' : 'Send test →'}
      />
      {waTestMsg && (
        <div style={{ fontSize: 11, color: waTestMsg.startsWith('✓') ? '#4ade80' : '#f87171', marginTop: -8, marginBottom: 8, paddingLeft: 56 }}>
          {waTestMsg}
        </div>
      )}
      <IntCard icon="✈️" iconBg="#0088CC" name="Telegram Bot"
        desc="Send booking notifications and reminders via Telegram to clients who prefer it."
        comingSoon
      />
      <IntCard icon="📸" iconBg="#E4405F" name="Instagram Direct (via Meta API)"
        desc="Receive Instagram DM enquiries automatically. New DMs appear in your Leads section."
        active={igActive}
      />

      <div className={`${styles.intSectionLabel} ${styles.intSectionLabelSpaced}`}>✉️ Email Provider</div>
      <div className={styles.emailProviderWrapper}>
        <div className={styles.emailProviderNote}>
          Resend is currently active and configured. Transactional emails are sent via <strong style={{ color: 'rgba(192,168,112,0.7)' }}>noreply@rokhaven.com</strong>.
        </div>
        <div className={styles.emailProviders}>
          {EMAIL_PROVIDERS.map(p => (
            <div
              key={p.id}
              className={`${styles.emailOpt} ${activeEmail === p.id ? styles.emailOptActive : ''}`}
              onClick={() => setActiveEmail(p.id)}
            >
              <div className={styles.eoName}>{p.name}</div>
              <div className={styles.eoDesc}>{p.desc}</div>
              {activeEmail === p.id && <div className={styles.eoBadge}>{p.id === 'resend' ? '✓ Active' : '✓ Selected'}</div>}
            </div>
          ))}
        </div>
        {activeEmail && activeEmail !== 'resend' && (
          <div style={{ marginTop: 14 }}>
            <label style={{ display: 'block', fontSize: 9, fontWeight: 500, color: 'rgba(192,168,112,0.42)', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 8 }}>
              API Key — {EMAIL_PROVIDERS.find(p => p.id === activeEmail)?.name}
            </label>
            <input className={styles.fi} type="password" placeholder="Enter your API key and add to Vercel env vars…" />
          </div>
        )}
      </div>

      <div className={`${styles.intSectionLabel} ${styles.intSectionLabelSpaced}`}>💳 CRM &amp; Other</div>
      <IntCard icon="☁️" iconBg="#00A1E0" name="Salesforce CRM"
        desc="Sync leads and client data to your Salesforce org automatically when new enquiries arrive."
        comingSoon
      />
      <IntCard icon="🔶" iconBg="#FF7A59" name="HubSpot CRM"
        desc="Push new leads and inspection bookings directly into your HubSpot pipeline."
        comingSoon
      />
      <IntCard icon="⚡" iconBg="#6C47FF" name="Zapier"
        desc="Connect RokHaven to 6,000+ apps. Automate anything — Notion, Slack, Sheets, and more."
      />
    </div>
  );
}

// ─── SETTINGS: TEAM TAB ─────────────────────────────────────────────────────

interface TeamMember { id: string; name: string; email: string; phone?: string | null; role: string; title?: string | null; createdAt: string }

const ROLE_OPTIONS = [
  { value: 'Super Admin', color: 'var(--gold)', desc: 'Full access — manage listings, view all leads, configure settings, manage team.' },
  { value: 'Agent', color: '#E0B44A', desc: 'View and manage listings and bookings. Cannot access settings or billing.' },
  { value: 'Viewer', color: 'var(--teal)', desc: 'Read-only access to listings and dashboard. No editing or exporting.' },
];

function roleColor(title: string | null | undefined) {
  const r = ROLE_OPTIONS.find(o => o.value === title);
  return r ? r.color : 'var(--gold)';
}

function TeamTab() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTitle, setInviteTitle] = useState('Agent');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ name: string; email: string; title: string; tempPassword: string } | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/team');
      if (res.ok) setMembers(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleInvite = async () => {
    if (!inviteName || !inviteEmail) { setInviteError('Name and email are required.'); return; }
    setInviting(true); setInviteError('');
    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inviteName, email: inviteEmail, title: inviteTitle }),
    });
    const data = await res.json();
    if (!res.ok) { setInviteError(data.error || 'Failed to create member.'); setInviting(false); return; }
    setInviteResult({ name: data.name, email: data.email, title: data.title, tempPassword: data.tempPassword });
    setInviteName(''); setInviteEmail(''); setInviteTitle('Agent');
    setInviting(false);
    fetchMembers();
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this team member? This cannot be undone.')) return;
    setRemoving(id);
    await fetch('/api/admin/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setRemoving(null);
    fetchMembers();
  };

  const sessionEmail = (session?.user as { email?: string })?.email;

  return (
    <div>
      <div className={styles.spTitle}>Team &amp; Access</div>
      <div className={styles.spSub}>Manage admin accounts for the RokHaven portal.</div>

      <div className={styles.intSectionLabel} style={{ marginBottom: 12 }}>Roles</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {ROLE_OPTIONS.map(r => (
          <div key={r.value} className={styles.roleCard}>
            <div className={styles.roleName} style={{ color: r.color }}>{r.value}</div>
            <div className={styles.roleDesc}>{r.desc}</div>
          </div>
        ))}
      </div>

      <div className={styles.teamHdr}>
        <div className={styles.intSectionLabel} style={{ marginBottom: 0 }}>Team Members ({members.length})</div>
        <button className={styles.intBtn} style={{ fontSize: 10, padding: '6px 14px' }} onClick={() => { setShowInvite(s => !s); setInviteResult(null); setInviteError(''); }}>
          {showInvite ? 'Close' : '+ Add Member'}
        </button>
      </div>

      {showInvite && (
        <div style={{ background: 'var(--card)', border: '1px solid rgba(192,168,112,0.09)', borderRadius: 3, padding: '18px 20px', marginBottom: 16 }}>
          {inviteResult ? (
            <div>
              <div style={{ fontSize: 13, color: '#5DC882', marginBottom: 10 }}>✓ Member created successfully</div>
              <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.55)', marginBottom: 4 }}>Name: <strong style={{ color: 'var(--ivory)' }}>{inviteResult.name}</strong></div>
              <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.55)', marginBottom: 4 }}>Email: <strong style={{ color: 'var(--ivory)' }}>{inviteResult.email}</strong></div>
              <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.55)', marginBottom: 4 }}>Role: <strong style={{ color: roleColor(inviteResult.title) }}>{inviteResult.title}</strong></div>
              <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.55)', marginBottom: 14 }}>Temporary password: <code style={{ background: 'rgba(192,168,112,0.1)', padding: '2px 6px', color: 'var(--gold)', borderRadius: 2 }}>{inviteResult.tempPassword}</code></div>
              <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.3)', marginBottom: 14 }}>Share these credentials with the new member. They can change their password after logging in.</div>
              <button className={styles.raBtn} style={{ opacity: 1 }} onClick={() => { setInviteResult(null); setShowInvite(false); }}>Done</button>
            </div>
          ) : (
            <div>
              <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>New Team Member</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 12 }}>
                <div className={styles.fgBlock} style={{ marginBottom: 0 }}>
                  <label>Full Name</label>
                  <input className={styles.fi} placeholder="e.g. Tola Fashola" value={inviteName} onChange={e => setInviteName(e.target.value)} />
                </div>
                <div className={styles.fgBlock} style={{ marginBottom: 0 }}>
                  <label>Email Address</label>
                  <input className={styles.fi} type="email" placeholder="admin@rokhaven.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                </div>
                <div className={styles.fgBlock} style={{ marginBottom: 0 }}>
                  <label>Role</label>
                  <select className={styles.fsel} value={inviteTitle} onChange={e => setInviteTitle(e.target.value)}>
                    <option>Agent</option>
                    <option>Viewer</option>
                    <option>Super Admin</option>
                  </select>
                </div>
              </div>
              {inviteError && <div style={{ fontSize: 12, color: '#e57373', marginBottom: 10 }}>{inviteError}</div>}
              <button className={styles.btnGen} style={{ width: 'auto', padding: '10px 24px' }} onClick={handleInvite} disabled={inviting}>
                {inviting ? 'Creating…' : 'Create Member →'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className={styles.tblWrap}>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th style={{ width: 120 }}></th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'rgba(244,237,224,0.3)', padding: 28 }}>Loading…</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'rgba(244,237,224,0.3)', padding: 28 }}>No team members found.</td></tr>
            ) : members.map(m => {
              const initials = m.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();
              const isSelf = m.email === sessionEmail;
              const displayTitle = m.title || 'Super Admin';
              return (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={styles.sbAvatar} style={{ width: 30, height: 30, fontSize: 10 }}>{initials}</div>
                      <span className={styles.strong}>{m.name}{isSelf && <span style={{ fontSize: 10, color: 'rgba(244,237,224,0.3)', marginLeft: 6 }}>(you)</span>}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'rgba(244,237,224,0.5)' }}>{m.email}</td>
                  <td>
                    <span className={styles.badge} style={{ fontSize: 9, color: roleColor(displayTitle), background: 'rgba(192,168,112,0.08)', border: `1px solid ${roleColor(displayTitle)}33` }}>
                      {displayTitle}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions} style={{ opacity: 1 }}>
                      {!isSelf && (
                        <button className={`${styles.raBtn} ${styles.raDel}`} disabled={removing === m.id} onClick={() => handleRemove(m.id)}>
                          {removing === m.id ? '…' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SETTINGS: NOTIFICATIONS TAB ────────────────────────────────────────────

function NotificationsTab() {
  const [notifs, setNotifs] = useState(NOTIFS.map(n => ({ ...n })));
  const [saved, setSaved] = useState(false);
  const [quietFrom, setQuietFrom] = useState('22:00');
  const [quietTo, setQuietTo] = useState('07:00');

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
          <input
            type="time"
            className={styles.fsel}
            style={{ width: 130, padding: '9px 12px', fontSize: 13 }}
            min="00:00"
            max="23:59"
            value={quietFrom}
            onChange={e => setQuietFrom(e.target.value)}
          />
          <span style={{ color: 'rgba(244,237,224,0.3)' }}>to</span>
          <input
            type="time"
            className={styles.fsel}
            style={{ width: 130, padding: '9px 12px', fontSize: 13 }}
            min="00:00"
            max="23:59"
            value={quietTo}
            onChange={e => setQuietTo(e.target.value)}
          />
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
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [twoFa, setTwoFa] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarMsg, setCalendarMsg] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.json())
      .then(data => {
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.whatsapp) setWhatsapp(data.whatsapp);
        setCalendarConnected(!!data.googleCalendarConnected);
      })
      .catch(() => {});

    // Check URL params after Google OAuth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendarConnected')) {
      setCalendarConnected(true);
      setCalendarMsg('Google Calendar connected successfully ✓');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setCalendarMsg(''), 4000);
    }
    if (params.get('calendarError')) {
      setCalendarMsg('Failed to connect Google Calendar. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setCalendarMsg(''), 4000);
    }
  }, []);

  const initials = name ? name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() : (session?.user?.name ? session.user.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() : 'ME');

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: phone || null, whatsapp: whatsapp || null }),
      });
      if (res.ok) { setProfileMsg('Saved ✓'); }
      else { const d = await res.json(); setProfileMsg(d.error || 'Save failed.'); }
    } catch { setProfileMsg('Network error.'); }
    setProfileSaving(false);
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const disconnectCalendar = async () => {
    setDisconnecting(true);
    await fetch('/api/auth/google-calendar', { method: 'DELETE' });
    setCalendarConnected(false);
    setCalendarMsg('Google Calendar disconnected.');
    setDisconnecting(false);
    setTimeout(() => setCalendarMsg(''), 3000);
  };

  const changePassword = async () => {
    setPwdError('');
    setPwdMsg('');
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match.'); return; }
    if (newPwd.length < 8) { setPwdError('New password must be at least 8 characters.'); return; }
    setPwdSaving(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }),
      });
      const d = await res.json();
      if (res.ok) { setPwdMsg('Password updated ✓'); setCurPwd(''); setNewPwd(''); setConfirmPwd(''); }
      else { setPwdError(d.error || 'Failed to update password.'); }
    } catch { setPwdError('Network error.'); }
    setPwdSaving(false);
    setTimeout(() => { setPwdMsg(''); setPwdError(''); }, 4000);
  };

  return (
    <div>
      <div className={styles.spTitle}>Account</div>
      <div className={styles.spSub}>Manage your personal profile, password, and account security settings.</div>

      <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>Profile</div>
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: 'var(--ivory)', marginBottom: 3 }}>{name || 'Your Name'}</div>
          <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.35)' }}>{email} · Super Admin</div>
        </div>
      </div>

      <div className={styles.fgBlock}>
        <label>Full Name</label>
        <input className={styles.fi} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
      </div>
      <div className={styles.fgBlock}>
        <label>Email Address</label>
        <input className={styles.fi} type="email" value={email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
      </div>
      <div className={styles.g2}>
        <div className={styles.fgBlock}>
          <label>Phone</label>
          <input className={styles.fi} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
        </div>
        <div className={styles.fgBlock}>
          <label>WhatsApp Number</label>
          <input className={styles.fi} type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+234 800 000 0000" />
        </div>
      </div>
      <button
        className={styles.btnGen}
        style={{ width: 'auto', padding: '11px 28px', marginBottom: 28 }}
        onClick={saveProfile}
        disabled={profileSaving}
      >
        {profileSaving ? 'Saving…' : profileMsg || 'Save Profile Changes'}
      </button>

      <div className={styles.intSectionLabel} style={{ marginBottom: 14 }}>Change Password</div>
      <div className={styles.fgBlock}>
        <label>Current Password</label>
        <input className={styles.fi} type="password" placeholder="••••••••••" value={curPwd} onChange={e => setCurPwd(e.target.value)} />
      </div>
      <div className={styles.g2}>
        <div className={styles.fgBlock}>
          <label>New Password</label>
          <input className={styles.fi} type="password" placeholder="Min 8 characters" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
        </div>
        <div className={styles.fgBlock}>
          <label>Confirm New Password</label>
          <input className={styles.fi} type="password" placeholder="••••••••••" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
        </div>
      </div>
      {pwdError && <div style={{ fontSize: 12, color: 'rgba(224,112,112,0.8)', marginBottom: 10 }}>{pwdError}</div>}
      <button
        className={styles.btnGen}
        style={{ width: 'auto', padding: '11px 28px', marginBottom: 28 }}
        onClick={changePassword}
        disabled={pwdSaving}
      >
        {pwdSaving ? 'Updating…' : pwdMsg || 'Update Password'}
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
            <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.32)' }}>
              Signed in as {session?.user?.email || email} — current session
            </div>
          </div>
          <button
            className={styles.intBtn}
            style={{ color: 'rgba(224,112,112,0.6)', borderColor: 'rgba(224,112,112,0.2)' }}
            onClick={() => signOut({ callbackUrl: '/auth/admin-login' })}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className={styles.intSectionLabel} style={{ marginBottom: 14, marginTop: 32 }}>My Integrations</div>
      <div style={{ background: 'var(--card)', border: '1px solid rgba(192,168,112,0.09)', borderRadius: 3, overflow: 'hidden' }}>
        {/* WhatsApp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderBottom: '1px solid rgba(192,168,112,0.07)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.8 9.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--ivory)', fontWeight: 400, marginBottom: 2 }}>WhatsApp Business</div>
            <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.35)' }}>Your personal WhatsApp number used for client communication</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              className={styles.fi}
              type="tel"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="+234 800 000 0000"
              style={{ width: 180, marginBottom: 0 }}
            />
            <button className={styles.intBtn} onClick={saveProfile} disabled={profileSaving}>
              {profileSaving ? '…' : whatsapp ? 'Update' : 'Save'}
            </button>
          </div>
        </div>

        {/* Google Calendar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--ivory)', fontWeight: 400, marginBottom: 2 }}>Google Calendar</div>
            <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.35)' }}>
              {calendarConnected ? 'Connected — confirmed inspections sync to your calendar' : 'Connect to auto-sync confirmed inspections to your Google Calendar'}
            </div>
            {calendarMsg && <div style={{ fontSize: 11, color: calendarMsg.includes('✓') ? '#5DC882' : 'rgba(224,112,112,0.8)', marginTop: 4 }}>{calendarMsg}</div>}
          </div>
          <div>
            {calendarConnected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#5DC882' }}>✓ Connected</span>
                <button
                  className={styles.intBtn}
                  style={{ color: 'rgba(224,112,112,0.6)', borderColor: 'rgba(224,112,112,0.2)', fontSize: 10 }}
                  onClick={disconnectCalendar}
                  disabled={disconnecting}
                >
                  {disconnecting ? '…' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <a href="/api/auth/google-calendar" className={styles.intBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>
                Connect →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS SECTION ───────────────────────────────────────────────────────

function SettingsSection({ defaultTab }: { defaultTab?: SettingsTab }) {
  const [tab, setTab] = useState<SettingsTab>(defaultTab ?? 'integration');
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
  { key: 'leads', label: 'Leads Pipeline', Icon: IconLeads },
  { key: 'contacts', label: 'Contacts', Icon: IconContacts },
  { key: 'reminders', label: 'Reminders', Icon: IconReminders },
  { key: 'settings', label: 'Settings', Icon: IconSettings },
];

const SECTION_TITLES: Record<Section, string> = {
  dashboard: 'Dashboard',
  listings: 'Listings',
  bookings: 'Bookings',
  leads: 'Leads Pipeline',
  contacts: 'Contacts',
  reminders: 'Reminders',
  settings: 'Settings',
};

// ─── CONTACTS SECTION ───────────────────────────────────────────────────────

function ContactsSection({ enquiries, inspections, onSelectLead }: { enquiries: AdminEnquiry[]; inspections: AdminInspection[]; onSelectLead: (lead: Lead) => void }) {
  const [search, setSearch] = useState('');

  const contacts: Lead[] = (() => {
    const fromEnquiries: Lead[] = enquiries.map(e => ({
      id: e.id, sourceType: 'enquiry' as const,
      name: e.name, email: e.email, phone: e.phone,
      property: e.property?.title || (e.howHeard === 'Instagram' ? 'Instagram DM' : 'General Enquiry'),
      date: new Date(e.createdAt).toLocaleDateString(),
      status: toLeadStatus(e.status),
      source: (e.howHeard === 'Instagram' ? 'instagram' : 'website') as LeadSource,
      budget: e.budget || undefined, intent: e.intent || undefined,
    }));
    const fromInspections: Lead[] = inspections.map(i => ({
      id: i.id, sourceType: 'inspection' as const,
      name: i.clientName, phone: i.clientPhone,
      property: i.property?.title || 'Unknown Property',
      date: i.preferredDate, time: i.preferredTime,
      status: inspectionToLeadStatus(i.status),
      source: 'inspection' as LeadSource,
      referenceNo: i.referenceNo || undefined, notes: i.notes || undefined,
    }));
    const allNames = new Set(fromEnquiries.map(l => l.name));
    return [...fromEnquiries, ...fromInspections.filter(l => !allNames.has(l.name))];
  })();

  const filtered = contacts.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) || (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    c.property.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className={styles.secHdr} style={{ marginBottom: 20 }}>
        <div className={styles.secTitle}>Contacts</div>
        <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.35)' }}>{contacts.length} total</div>
      </div>

      <input
        type="text"
        placeholder="Search by name, phone, email or property…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: 420, padding: '10px 14px', background: 'rgba(11,27,53,0.6)', border: '1px solid rgba(192,168,112,0.15)', borderRadius: 2, color: '#f4ede0', fontSize: 13, marginBottom: 24, outline: 'none', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 180px 150px 110px', gap: 12, padding: '8px 16px', fontSize: 8, letterSpacing: '0.25em', color: 'rgba(192,168,112,0.4)', textTransform: 'uppercase', borderBottom: '1px solid rgba(192,168,112,0.07)' }}>
          <span>Contact</span><span>Phone</span><span>Property Interest</span><span>Source</span><span>Stage</span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'rgba(244,237,224,0.25)', fontSize: 13 }}>No contacts found</div>
        )}

        {filtered.map((c, i) => (
          <div
            key={i}
            onClick={() => onSelectLead(c)}
            style={{ display: 'grid', gridTemplateColumns: '1fr 140px 180px 150px 110px', gap: 12, padding: '13px 16px', borderRadius: 2, cursor: 'pointer', transition: 'background 0.15s', background: i % 2 === 0 ? 'rgba(11,27,53,0.3)' : 'transparent', alignItems: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(192,168,112,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(11,27,53,0.3)' : 'transparent')}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(192,168,112,0.1)', border: '1px solid rgba(192,168,112,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#C0A870', flexShrink: 0 }}>
                  {nameInitials(c.name)}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#f4ede0', fontWeight: 400 }}>{c.name}</div>
                  {c.email && <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.35)', marginTop: 1 }}>{c.email}</div>}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.55)' }}>{c.phone || '—'}</div>
            <div style={{ fontSize: 12, color: 'rgba(244,237,224,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.property}</div>
            <div>
              <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 2, background: c.source === 'instagram' ? 'rgba(228,64,95,0.1)' : c.source === 'inspection' ? 'rgba(192,168,112,0.08)' : 'rgba(255,255,255,0.05)', color: c.source === 'instagram' ? '#E4405F' : c.source === 'inspection' ? '#C0A870' : 'rgba(244,237,224,0.4)', border: '1px solid', borderColor: c.source === 'instagram' ? 'rgba(228,64,95,0.2)' : c.source === 'inspection' ? 'rgba(192,168,112,0.15)' : 'rgba(255,255,255,0.07)' }}>
                {c.source === 'instagram' ? '📸 IG' : c.source === 'inspection' ? '🏠 Booking' : '🌐 Web'}
              </span>
            </div>
            <div style={{ fontSize: 10, color: LEAD_COLUMNS.find(col => col.key === c.status)?.color || 'rgba(244,237,224,0.35)' }}>
              {LEAD_COLUMNS.find(col => col.key === c.status)?.label || c.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD SHELL ────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const VALID_SECTIONS: Section[] = ['dashboard', 'listings', 'bookings', 'leads', 'contacts', 'reminders', 'settings'];
  const urlSection = searchParams.get('section') as Section | null;
  const [section, setSection] = useState<Section>(
    urlSection && VALID_SECTIONS.includes(urlSection) ? urlSection : 'dashboard'
  );
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('integration');
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [inspections, setInspections] = useState<AdminInspection[]>([]);
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const userName = session?.user?.name || 'Admin';
  const userInitials = userName.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();

  const navigateTo = useCallback((s: Section) => {
    setSection(s);
    const params = s === 'dashboard' ? '/admin' : `/admin?section=${s}`;
    router.replace(params, { scroll: false });
  }, [router]);

  const goToAccount = () => { setSettingsTab('account'); navigateTo('settings'); };

  const fetchAll = useCallback(async () => {
    try {
      const [propRes, inspRes, enqRes] = await Promise.all([
        fetch('/api/properties?limit=100&admin=1'),
        fetch('/api/inspections'),
        fetch('/api/enquiries'),
      ]);
      const propData = await propRes.json();
      const inspData = await inspRes.json();
      const enqData = await enqRes.json();
      setProperties(propData.properties || []);
      setInspections(Array.isArray(inspData) ? inspData : []);
      setEnquiries(Array.isArray(enqData) ? enqData : []);
    } catch {
      // silently fail — UI shows empty state
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className={styles.adminWrap} onClick={() => notifOpen && setNotifOpen(false)}>
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
              onClick={() => navigateTo(key)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>
        <div style={{ padding: '0 12px', marginBottom: 8 }}>
          <a
            href="/admin/import"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              color: 'rgba(244,237,224,.55)', textDecoration: 'none',
              background: 'rgba(192,168,112,.06)', border: '1px solid rgba(192,168,112,.1)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v10m0 0l-3-3m3 3l3-3M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"/></svg>
            Import Listings
          </a>
        </div>
        <div className={styles.sbFoot}>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left' }}
            onClick={goToAccount}
          >
            <div className={styles.sbAvatar}>{userInitials}</div>
            <div>
              <div className={styles.sbName}>{userName}</div>
              <div className={styles.sbRole}>Super Admin</div>
            </div>
          </button>
          <button className={styles.sbOut} onClick={onLogout}>Sign out →</button>
        </div>
      </aside>

      {/* MAIN */}
      <div className={styles.main}>
        {/* TOPBAR */}
        <div className={styles.topbar}>
          <div>
            <div className={styles.topbarTitle}>{section === 'dashboard' ? `Welcome back, ${userName.split(' ')[0]}.` : SECTION_TITLES[section]}</div>
            <div className={styles.topbarDate}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' · Admin Command Centre'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: notifOpen ? 'var(--gold)' : 'rgba(244,237,224,0.4)', position: 'relative', padding: 4 }}
              >
                <IconBell />
                {(inspections.filter(i => i.status === 'PENDING').length + enquiries.filter(e => e.status === 'NEW').length) > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)' }} />
                )}
              </button>
              {notifOpen && (
                <div
                  style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 320, background: '#0D1E30', border: '1px solid rgba(192,168,112,0.15)', borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 500 }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(192,168,112,0.08)', fontSize: 11, fontWeight: 600, color: 'rgba(192,168,112,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Notifications
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {inspections.filter(i => i.status === 'PENDING').slice(0, 5).map(insp => (
                      <div key={insp.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                        onClick={() => { navigateTo('bookings'); setNotifOpen(false); }}>
                        <div style={{ fontSize: 12, color: '#f4ede0', marginBottom: 2 }}>New inspection request</div>
                        <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.4)' }}>{insp.clientName} · {insp.property?.title || 'Unknown property'}</div>
                        <div style={{ fontSize: 10, color: 'rgba(192,168,112,0.4)', marginTop: 3 }}>{insp.preferredDate} at {insp.preferredTime}</div>
                      </div>
                    ))}
                    {enquiries.filter(e => e.status === 'NEW').slice(0, 5).map(enq => (
                      <div key={enq.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                        onClick={() => { navigateTo('leads'); setNotifOpen(false); }}>
                        <div style={{ fontSize: 12, color: '#f4ede0', marginBottom: 2 }}>New enquiry</div>
                        <div style={{ fontSize: 11, color: 'rgba(244,237,224,0.4)' }}>{enq.name} · {enq.property?.title || 'General enquiry'}</div>
                        <div style={{ fontSize: 10, color: 'rgba(192,168,112,0.4)', marginTop: 3 }}>{new Date(enq.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                    {inspections.filter(i => i.status === 'PENDING').length === 0 && enquiries.filter(e => e.status === 'NEW').length === 0 && (
                      <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: 'rgba(244,237,224,0.3)' }}>
                        No new notifications
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(192,168,112,0.08)' }}>
                    <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', fontSize: 11, color: 'rgba(192,168,112,0.5)', cursor: 'pointer', padding: 0 }}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={goToAccount}
            >
              <div className={styles.sbAvatar}>{userInitials}</div>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {section === 'dashboard' && <DashboardSection onNav={navigateTo} properties={properties} inspections={inspections} onRefresh={fetchAll} />}
          {section === 'listings' && <ListingsSection properties={properties} onRefresh={fetchAll} />}
          {section === 'bookings' && <BookingsSection properties={properties} inspections={inspections} onRefresh={fetchAll} />}
          {section === 'leads' && <LeadsSection enquiries={enquiries} inspections={inspections} onRefresh={fetchAll} onSelectLead={setSelectedLead} />}
          {section === 'contacts' && <ContactsSection enquiries={enquiries} inspections={inspections} onSelectLead={setSelectedLead} />}
          {section === 'reminders' && <RemindersSection inspections={inspections} />}
          {section === 'settings' && <SettingsSection defaultTab={settingsTab} />}
        </div>
      </div>

      {/* ── CONTACT SESSION PANEL — rendered at top level, always on top ── */}
      {selectedLead && (
        <ContactPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onMove={(status) => {
            if (selectedLead) persistLeadStatus(selectedLead, status).catch(() => {});
            setSelectedLead(prev => prev ? { ...prev, status } : null);
          }}
          onUpdateNotes={(notes) => {
            // Update the source data so Contacts + Pipeline both reflect the new notes
            if (selectedLead.sourceType === 'enquiry') {
              setEnquiries(prev => prev.map(e => e.id === selectedLead.id ? { ...e, notes } : e));
            } else {
              setInspections(prev => prev.map(i => i.id === selectedLead.id ? { ...i, notes } : i));
            }
            setSelectedLead(prev => prev ? { ...prev, notes } : null);
          }}
        />
      )}
    </div>
  );
}

// ─── ROOT PAGE ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <Suspense>
      <Dashboard onLogout={() => signOut({ callbackUrl: '/auth/admin-login' })} />
    </Suspense>
  );
}
