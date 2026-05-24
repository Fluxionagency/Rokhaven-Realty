'use client';

import { useState, useCallback, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import styles from './page.module.css';

// ─── TYPES ─────────────────────────────────────────────────────────────────

type Section = 'dashboard' | 'listings' | 'bookings' | 'leads' | 'reminders' | 'settings';
type BookingTab = 'calendar' | 'link' | 'inspections';
type SettingsTab = 'integration' | 'team' | 'notifications' | 'account';
type ListingFilter = 'All' | 'Active' | 'Rented' | 'Sold' | 'Pending';
type LeadStatus = 'New' | 'Contacted' | 'Booked' | 'Closed';

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

// ─── DASHBOARD SECTION ──────────────────────────────────────────────────────

function DashboardSection({ onNav, properties, inspections }: {
  onNav: (section: Section) => void;
  properties: AdminProperty[];
  inspections: AdminInspection[];
}) {
  const activeListings = properties.filter(p => p.status === 'ACTIVE').length;
  const pendingInspections = inspections.filter(i => i.status === 'PENDING').length;

  return (
    <div>
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
                    {insp.status === 'PENDING' && <button className={styles.raBtn}>Confirm</button>}
                    <button className={styles.raBtn}>View</button>
                    {insp.status === 'CONFIRMED' && <button className={styles.raBtn}>Reschedule</button>}
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
  const [fStatus, setFStatus] = useState('ACTIVE');

  const filtered = filter === 'All' ? properties : properties.filter(p => p.status.toLowerCase() === filter.toLowerCase());

  const doAction = async (p: AdminProperty, action: string) => {
    setOpenMenu(null);
    if (action === 'Edit') {
      openModal(p);
      return;
    }
    if (action === 'Mark as Rented') {
      await fetch('/api/properties/' + p.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'RENTED' }) });
      onRefresh();
    } else if (action === 'Mark as Sold') {
      await fetch('/api/properties/' + p.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'SOLD' }) });
      onRefresh();
    } else if (action === 'Deactivate') {
      await fetch('/api/properties/' + p.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'INACTIVE' }) });
      onRefresh();
    } else if (action === 'Delete') {
      await fetch('/api/properties/' + p.id, { method: 'DELETE' });
      onRefresh();
    }
  };

  const openModal = (p?: AdminProperty) => {
    if (p) {
      setEditingProp(p);
      setFTitle(p.title); setFDesc(''); setFPrice(p.price);
      setFLocation(p.location); setFNbh(p.neighbourhood || ''); setFType(p.type || 'Fully Detached');
      setFCat(p.category || 'SALE'); setFBeds(p.bedrooms); setFBaths(p.bathrooms);
      setFSqm(p.sqm ? String(p.sqm) : ''); setFBadge(p.badge || '');
      setFImages(p.images || '[]'); setFStatus(p.status);
    } else {
      setEditingProp(null);
      setFTitle(''); setFDesc(''); setFPrice(''); setFLocation('');
      setFNbh(''); setFType('Fully Detached'); setFCat('SALE');
      setFBeds(4); setFBaths(4); setFSqm(''); setFBadge('');
      setFImages('[]'); setFStatus('ACTIVE');
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!fTitle || !fPrice || !fLocation) {
      alert('Title, price and location are required.');
      return;
    }
    setSaving(true);
    const body = {
      title: fTitle, description: fDesc, price: fPrice,
      location: fLocation, neighbourhood: fNbh || null,
      type: fType, category: fCat,
      bedrooms: fBeds, bathrooms: fBaths,
      sqm: fSqm ? parseFloat(fSqm) : null,
      badge: fBadge || null,
      images: fImages || '[]',
      status: fStatus,
      features: '[]',
    };
    try {
      if (editingProp) {
        await fetch('/api/properties/' + editingProp.id, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/properties', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      setModalOpen(false);
      onRefresh();
    } catch {
      alert('Failed to save. Please try again.');
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
                <select className={styles.fsel} value={fNbh} onChange={e => setFNbh(e.target.value)}>
                  <option value="">Select…</option>
                  {['Banana Island','Ikoyi','Victoria Island','Eko Atlantic','Lekki Phase 1','Lekki Phase 2','Ajah','Ikeja GRA','Magodo','Other'].map(n => <option key={n}>{n}</option>)}
                </select>
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
                <label style={lbl}>Image URLs — JSON array</label>
                <textarea className={styles.fta} rows={2} value={fImages} onChange={e => setFImages(e.target.value)} placeholder='["https://...jpg","https://...jpg"]' />
                <div style={{ fontSize: 10, color: 'rgba(244,237,224,0.2)', marginTop: 4 }}>Paste direct image URLs as a JSON array</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: '1px solid rgba(192,168,112,0.2)', borderRadius: 2, padding: '10px 20px', color: 'rgba(244,237,224,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--fb)' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ background: '#C0A870', border: 'none', borderRadius: 2, padding: '10px 24px', color: '#060F1C', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : editingProp ? 'Save Changes →' : 'Create Listing →'}
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

function InspectionsTab({ inspections, onRefresh }: { inspections: AdminInspection[]; onRefresh: () => void }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const statuses = ['All', 'Pending', 'Confirmed', 'Completed'];
  const filtered = statusFilter === 'All' ? inspections : inspections.filter(i => i.status.toUpperCase() === statusFilter.toUpperCase());

  const confirmInspection = async (id: string) => {
    await fetch('/api/inspections/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CONFIRMED' }) });
    onRefresh();
  };

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

type Lead = { name: string; property: string; date: string; status: LeadStatus };

function toLeadStatus(s: string): LeadStatus {
  if (s === 'NEW') return 'New';
  if (s === 'CONTACTED') return 'Contacted';
  if (s === 'IN_PROGRESS') return 'Booked';
  return 'Closed';
}

function LeadsSection({ enquiries, onRefresh }: { enquiries: AdminEnquiry[]; onRefresh: () => void }) {
  const [leads, setLeads] = useState<Lead[]>(() => enquiries.map(e => ({
    name: e.name,
    property: e.property?.title || 'General Enquiry',
    date: new Date(e.createdAt).toLocaleDateString(),
    status: toLeadStatus(e.status),
  })));

  useEffect(() => {
    setLeads(enquiries.map(e => ({
      name: e.name,
      property: e.property?.title || 'General Enquiry',
      date: new Date(e.createdAt).toLocaleDateString(),
      status: toLeadStatus(e.status),
    })));
  }, [enquiries]);

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
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [inspections, setInspections] = useState<AdminInspection[]>([]);
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);

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
            <div className={styles.topbarDate}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' · Admin Command Centre'}
            </div>
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
          {section === 'dashboard' && <DashboardSection onNav={setSection} properties={properties} inspections={inspections} />}
          {section === 'listings' && <ListingsSection properties={properties} onRefresh={fetchAll} />}
          {section === 'bookings' && <BookingsSection properties={properties} inspections={inspections} onRefresh={fetchAll} />}
          {section === 'leads' && <LeadsSection enquiries={enquiries} onRefresh={fetchAll} />}
          {section === 'reminders' && <RemindersSection inspections={inspections} />}
          {section === 'settings' && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT PAGE ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  return <Dashboard onLogout={() => signOut({ callbackUrl: '/' })} />;
}
