'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type TabId = 'dashboard' | 'inspections' | 'saved' | 'enquiries' | 'profile';
type InspFilterId = 'all' | 'upcoming' | 'completed' | 'cancelled';
type ContactPref = 'WhatsApp' | 'SMS' | 'Email';

interface PortalInspection {
  id: number | string;
  name: string;
  location: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  img: string;
}

interface PortalEnquiry {
  id: number | string;
  name: string;
  type: string;
  date: string;
  status: 'prog' | 'recv' | 'closed';
  fields: { label: string; value: string; full?: boolean }[];
}

function firstImg(images: string, w = 200): string {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr[0]
      ? arr[0]
      : `https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=${w}&q=70&auto=format&fit=crop`;
  } catch {
    return `https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=${w}&q=70&auto=format&fit=crop`;
  }
}

function mapInspStatus(s: string): PortalInspection['status'] {
  const u = s.toUpperCase();
  if (u === 'CONFIRMED') return 'confirmed';
  if (u === 'COMPLETED') return 'completed';
  if (u === 'CANCELLED') return 'cancelled';
  return 'pending';
}

function mapEnqStatus(s: string): PortalEnquiry['status'] {
  if (s === 'CLOSED') return 'closed';
  if (s === 'CONTACTED' || s === 'IN_PROGRESS') return 'prog';
  return 'recv';
}

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'U';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

export default function ClientPortalPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/client-login');
    },
  });

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [inspFilter, setInspFilter] = useState<InspFilterId>('all');
  const [expandedEnq, setExpandedEnq] = useState<number | string | null>(null);
  const [contactPref, setContactPref] = useState<ContactPref>('WhatsApp');
  const [notifInspection, setNotifInspection] = useState(true);
  const [notifListings, setNotifListings] = useState(true);
  const [notifMarket, setNotifMarket] = useState(false);
  const [saveMsg, setSaveMsg] = useState('Save Changes');

  const [inspections, setInspections] = useState<PortalInspection[]>([]);
  const [enquiries, setEnquiries] = useState<PortalEnquiry[]>([]);

  const userEmail = session?.user?.email;

  useEffect(() => {
    if (!userEmail) return;
    fetch(`/api/inspections?email=${encodeURIComponent(userEmail)}`)
      .then(r => r.json())
      .then((data: { id: string; preferredDate: string; preferredTime: string; status: string; property?: { title: string; location: string; images: string } }[]) => {
        if (!Array.isArray(data)) return;
        setInspections(data.map(insp => ({
          id: insp.id,
          name: insp.property?.title || 'Property',
          location: insp.property?.location || '',
          date: insp.preferredDate,
          time: insp.preferredTime,
          status: mapInspStatus(insp.status),
          img: firstImg(insp.property?.images || '[]'),
        })));
      })
      .catch(() => {});

    fetch(`/api/enquiries?email=${encodeURIComponent(userEmail)}`)
      .then(r => r.json())
      .then((data: { id: string; property?: { title: string } | null; status: string; createdAt: string; budget?: string; timeline?: string; mustHaves?: string; notes?: string }[]) => {
        if (!Array.isArray(data)) return;
        setEnquiries(data.map(enq => {
          const fields: { label: string; value: string; full?: boolean }[] = [];
          if (enq.property?.title) fields.push({ label: 'Property', value: enq.property.title });
          if (enq.budget) fields.push({ label: 'Budget', value: enq.budget });
          if (enq.timeline) fields.push({ label: 'Timeline', value: enq.timeline });
          if (enq.mustHaves) {
            try {
              const mh = JSON.parse(enq.mustHaves);
              if (Array.isArray(mh) && mh.length) fields.push({ label: 'Must-Haves', value: mh.join(' · '), full: true });
            } catch { /* ignore */ }
          }
          if (enq.notes) fields.push({ label: 'Notes', value: enq.notes, full: true });
          return {
            id: enq.id,
            name: enq.property?.title || 'General Enquiry',
            type: enq.property ? 'Property Enquiry' : 'General Enquiry',
            date: new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: mapEnqStatus(enq.status),
            fields,
          };
        }));
      })
      .catch(() => {});
  }, [userEmail]);

  const topLabels: Record<TabId, string> = {
    dashboard: 'Client Dashboard',
    inspections: 'My Inspections',
    saved: 'Saved Properties',
    enquiries: 'My Enquiries',
    profile: 'My Profile',
  };

  const userName = session?.user?.name ?? 'there';
  const userInitials = getInitials(session?.user?.name);
  const greeting = getGreeting();

  const filteredInspections = inspections.filter((i) => {
    if (inspFilter === 'all') return true;
    if (inspFilter === 'upcoming') return i.status === 'confirmed' || i.status === 'pending';
    if (inspFilter === 'completed') return i.status === 'completed';
    if (inspFilter === 'cancelled') return i.status === 'cancelled';
    return true;
  });

  const handleSaveProfile = () => {
    setSaveMsg('Saved ✓');
    setTimeout(() => setSaveMsg('Save Changes'), 2000);
  };

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0B1B35', color: 'rgba(244,237,224,0.4)', fontFamily: 'DM Sans, sans-serif' }}>
        Loading…
      </div>
    );
  }

  return (
    <div className={styles.portalWrap}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sbLogo}>
          <svg width="24" height="24" viewBox="0 0 60 60" fill="#C0A870">
            <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
          </svg>
          <div>
            <div className={styles.sbWordmark}>ROKHAVEN</div>
            <div className={styles.sbSubmark}>REALTY</div>
          </div>
        </div>

        <div className={styles.sbUser}>
          <div className={styles.sbAvatar}>{userInitials}</div>
          <div>
            <div className={styles.sbName}>{userName}</div>
            <div className={styles.sbRole}>Client</div>
          </div>
        </div>

        <div className={styles.sbSection}>My Portal</div>

        <nav className={styles.sbNav}>
          {(
            [
              { id: 'dashboard', label: 'Dashboard', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
              { id: 'inspections', label: 'My Inspections', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { id: 'saved', label: 'Saved Properties', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> },
              { id: 'enquiries', label: 'My Enquiries', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
              { id: 'profile', label: 'My Profile', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            ] as { id: TabId; label: string; icon: React.ReactNode }[]
          ).map(({ id, label, icon }) => (
            <button
              key={id}
              className={`${styles.sbLink}${activeTab === id ? ' ' + styles.active : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.sbFoot}>
          <button
            className={styles.sbLogout}
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className={styles.main}>
        {/* TOP BAR */}
        <div className={styles.topbar}>
          <span className={styles.tbTitle}>{topLabels[activeTab]}</span>
          <div className={styles.tbRight}>
            <button className={styles.tbBell} aria-label="Notifications">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className={styles.tbDot} />
            </button>
            <button className={styles.tbBtn} onClick={() => setActiveTab('inspections')}>
              My Inspections
            </button>
          </div>
        </div>

        <div className={styles.content}>

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div>
              <div className={styles.pgGreeting}>
                <span style={{ color: '#C0A870' }}>{greeting}</span>{' '}
                {userName.split(' ')[0]}.
              </div>
              <p className={styles.pgSub}>Here&apos;s where things stand with your property search.</p>

              <div className={styles.stats}>
                <div className={styles.sc}>
                  <div className={styles.scNum}>{inspections.filter(i => i.status === 'confirmed' || i.status === 'pending').length || 0}</div>
                  <div className={styles.scLbl}>Upcoming Inspections</div>
                </div>
                <div className={styles.sc}>
                  <div className={styles.scNum}>{enquiries.length || 0}</div>
                  <div className={styles.scLbl}>Enquiries Submitted</div>
                </div>
                <div className={styles.sc}>
                  <div className={styles.scNum}>{inspections.filter(i => i.status === 'completed').length || 0}</div>
                  <div className={styles.scLbl}>Completed Viewings</div>
                </div>
              </div>

              {/* Next Inspection */}
              {inspections.filter(i => i.status === 'confirmed' || i.status === 'pending').length > 0 && (() => {
                const next = inspections.find(i => i.status === 'confirmed' || i.status === 'pending');
                if (!next) return null;
                return (
                  <>
                    <span className={styles.slbl}>Next Inspection</span>
                    <div className={styles.inspCard}>
                      <div className={styles.inspImg}>
                        <img src={next.img} alt={next.name} />
                      </div>
                      <div className={styles.inspBody}>
                        <div className={styles.inspLabel}>{next.status === 'confirmed' ? 'Confirmed Inspection' : 'Pending Confirmation'}</div>
                        <div className={styles.inspName}>{next.name}</div>
                        <div className={styles.inspLoc}>
                          <svg width="10" height="12" viewBox="0 0 12 15" fill="rgba(192,168,112,.4)">
                            <path d="M6 0C2.686 0 0 2.686 0 6c0 4.5 6 9 6 9s6-4.5 6-9c0-3.314-2.686-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                          </svg>
                          {next.location}
                        </div>
                        <div className={styles.inspDt}>{next.date}</div>
                        <div className={styles.inspTime}>{next.time} · In-Person Viewing</div>
                        <div className={styles.inspActions}>
                          <span className={next.status === 'confirmed' ? styles.badgeConf : styles.badgePend}>
                            {next.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                          <button className={styles.linkGold} onClick={() => setActiveTab('inspections')}>
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Recently Viewed */}
              <div className={styles.secHdr}>
                <span className={styles.slbl} style={{ marginBottom: 0 }}>Recently Viewed</span>
                <Link href="/listings" className={styles.linkGold} style={{ borderBottom: '1px solid rgba(192,168,112,.28)', paddingBottom: '1px' }}>
                  View All Listings →
                </Link>
              </div>
              <div className={styles.scrollRow}>
                {[
                  { name: 'The Grand Arkadia', price: '₦1,200,000,000', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=70&auto=format&fit=crop', saved: true },
                  { name: 'Oceanfront Penthouse', price: '₦780,000,000', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70&auto=format&fit=crop', saved: false },
                  { name: 'Prestige Court, Ikoyi', price: '₦450,000,000', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70&auto=format&fit=crop', saved: true },
                  { name: 'The Meridian, Lekki', price: '₦320,000,000', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=70&auto=format&fit=crop', saved: false },
                ].map((p, i) => (
                  <div key={i} className={styles.miniCard}>
                    <div className={styles.miniImg}>
                      <img src={p.img} alt={p.name} />
                      <button className={styles.bmBtn} aria-label={p.saved ? 'Remove bookmark' : 'Add bookmark'}>
                        🔖
                      </button>
                    </div>
                    <div className={styles.miniBody}>
                      <div className={styles.miniName}>{p.name}</div>
                      <div className={styles.miniPrice}>{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <span className={styles.slbl}>Quick Actions</span>
              <div className={styles.qaGrid}>
                <Link href="/listings" className={styles.qa} style={{ textDecoration: 'none' }}>
                  <div className={styles.qaIcon}>
                    <svg width="16" height="16" fill="none" stroke="rgba(192,168,112,.6)" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.qaLabel}>Browse Properties</div>
                    <div className={styles.qaSub}>Explore curated listings</div>
                  </div>
                </Link>
                <Link href="/enquiry" className={styles.qa} style={{ textDecoration: 'none' }}>
                  <div className={styles.qaIcon}>
                    <svg width="16" height="16" fill="none" stroke="rgba(192,168,112,.6)" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.qaLabel}>Submit New Enquiry</div>
                    <div className={styles.qaSub}>Start a fresh enquiry</div>
                  </div>
                </Link>
                <button className={styles.qa} onClick={() => setActiveTab('inspections')}>
                  <div className={styles.qaIcon}>
                    <svg width="16" height="16" fill="none" stroke="rgba(192,168,112,.6)" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.qaLabel}>View My Inspections</div>
                    <div className={styles.qaSub}>Upcoming &amp; past</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── MY INSPECTIONS ── */}
          {activeTab === 'inspections' && (
            <div>
              <div className={styles.pgH}>My Inspections</div>
              <div className={styles.tabs}>
                {(['all', 'upcoming', 'completed', 'cancelled'] as InspFilterId[]).map((f) => (
                  <button
                    key={f}
                    className={`${styles.tab}${inspFilter === f ? ' ' + styles.active : ''}`}
                    onClick={() => setInspFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {filteredInspections.length === 0 && (
                <div className={styles.empty}>
                  <div className={styles.emptyH}>No inspections found</div>
                  <p className={styles.emptyP}>No inspections match this filter.</p>
                </div>
              )}

              {filteredInspections.map((insp) => (
                <div
                  key={insp.id}
                  className={`${styles.inspRow}${insp.status === 'completed' ? ' ' + styles.dimmed : ''}`}
                >
                  <div className={styles.irThumb}>
                    <img src={insp.img} alt={insp.name} />
                  </div>
                  <div className={styles.irInfo}>
                    <div className={styles.irName}>{insp.name}</div>
                    <div className={styles.irLoc}>{insp.location}</div>
                  </div>
                  <div>
                    <div className={styles.irDt}>{insp.date}</div>
                    <div className={styles.irDtSub}>{insp.time}</div>
                  </div>
                  <div>
                    {insp.status === 'confirmed' && <span className={styles.badgeConf}>Confirmed</span>}
                    {insp.status === 'pending' && <span className={styles.badgePend}>Pending</span>}
                    {insp.status === 'completed' && (
                      <span className={`${styles.badgeStatus} ${styles.bsCls}`}>Completed</span>
                    )}
                  </div>
                  <div className={styles.irActions}>
                    {insp.status === 'confirmed' && (
                      <button className={styles.irLink}>+ Calendar</button>
                    )}
                    <button className={styles.irLink}>View Property</button>
                    {insp.status === 'pending' && (
                      <button className={styles.irLink}>Reschedule</button>
                    )}
                    {(insp.status === 'confirmed' || insp.status === 'pending') && (
                      <button className={styles.irLinkDel}>Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SAVED PROPERTIES ── */}
          {activeTab === 'saved' && (
            <div>
              <div className={styles.secHdr}>
                <div className={styles.pgH} style={{ marginBottom: 0 }}>Saved Properties</div>
                <Link href="/listings" className={styles.linkGold} style={{ borderBottom: '1px solid rgba(192,168,112,.28)', paddingBottom: '1px' }}>
                  Explore More →
                </Link>
              </div>
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>
                  <svg width="22" height="22" fill="none" stroke="rgba(192,168,112,.4)" strokeWidth="1.4" viewBox="0 0 24 24">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                </div>
                <div className={styles.emptyH}>No saved properties yet</div>
                <p className={styles.emptyP}>Browse our listings and save the properties you love.</p>
                <Link href="/listings" className={styles.emptyCta}>Browse Listings →</Link>
              </div>
            </div>
          )}

          {/* ── MY ENQUIRIES ── */}
          {activeTab === 'enquiries' && (
            <div>
              <div className={styles.pgH}>My Enquiries</div>
              <p style={{ fontSize: '12.5px', color: 'rgba(244,237,224,.3)', marginBottom: '20px' }}>
                {enquiries.length} {enquiries.length === 1 ? 'enquiry' : 'enquiries'} submitted
              </p>

              {enquiries.length === 0 && (
                <div className={styles.empty}>
                  <div className={styles.emptyH}>No enquiries yet</div>
                  <p className={styles.emptyP}>Submit an enquiry to get started.</p>
                  <Link href="/enquiry" className={styles.linkGold}>Submit an Enquiry →</Link>
                </div>
              )}

              {enquiries.map((enq) => (
                <div key={enq.id} className={styles.enqCard}>
                  <div
                    className={styles.enqHdr}
                    onClick={() => setExpandedEnq(expandedEnq === enq.id ? null : enq.id)}
                  >
                    <div>
                      <div className={styles.enqName}>{enq.name}</div>
                      <div className={styles.enqType}>{enq.type}</div>
                    </div>
                    <div className={styles.enqDate}>{enq.date}</div>
                    <div>
                      {enq.status === 'prog' && (
                        <span className={`${styles.badgeStatus} ${styles.bsProg}`}>In Progress</span>
                      )}
                      {enq.status === 'recv' && (
                        <span className={`${styles.badgeStatus} ${styles.bsRecv}`}>Received</span>
                      )}
                      {(enq.status as string) === 'rev' && (
                        <span className={`${styles.badgeStatus} ${styles.bsRev}`}>Under Review</span>
                      )}
                    </div>
                    <div />
                    <div className={styles.enqExpand}>
                      {expandedEnq === enq.id ? 'Close ▴' : 'View ▾'}
                    </div>
                  </div>
                  {expandedEnq === enq.id && (
                    <div className={styles.enqBody}>
                      <div className={styles.enqSummary}>
                        {enq.fields.map((f, i) => (
                          <div
                            key={i}
                            className={`${styles.enqField}${(f as {label:string;value:string;full?:boolean}).full ? ' ' + styles.enqFieldFull : ''}`}
                          >
                            <div className={styles.enqFieldLbl}>{f.label}</div>
                            <div className={styles.enqFieldVal}>{f.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── MY PROFILE ── */}
          {activeTab === 'profile' && (
            <div>
              <div className={styles.pgH}>My Profile</div>

              <div className={styles.profSection}>
                <div className={styles.profSectionH}>Personal Details</div>
                <div className={styles.profGrid}>
                  <div className={styles.fBlock}>
                    <label className={styles.fLbl}>Full Name</label>
                    <input
                      className={styles.fIn}
                      defaultValue={session?.user?.name ?? ''}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className={styles.fBlock}>
                    <label className={styles.fLbl}>
                      Email Address{' '}
                      <span className={styles.fLblNote}>— contact support to change</span>
                    </label>
                    <input
                      className={styles.fIn}
                      value={session?.user?.email ?? ''}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className={styles.fBlock}>
                    <label className={styles.fLbl}>Phone Number</label>
                    <input
                      className={styles.fIn}
                      defaultValue="+234 803 441 7829"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className={styles.fBlock}>
                    <label className={styles.fLbl}>Preferred Contact Method</label>
                    <div className={styles.prefPills}>
                      {(['WhatsApp', 'SMS', 'Email'] as ContactPref[]).map((p) => (
                        <button
                          key={p}
                          className={`${styles.prefPill}${contactPref === p ? ' ' + styles.active : ''}`}
                          onClick={() => setContactPref(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.profSection}>
                <div className={styles.profSectionH}>Property Preferences</div>
                <div className={styles.profGrid}>
                  <div className={styles.fBlock}>
                    <label className={styles.fLbl}>
                      Preferred Locations{' '}
                      <span className={styles.fLblNote}>— Optional</span>
                    </label>
                    <input
                      className={styles.fIn}
                      defaultValue="Banana Island, Ikoyi"
                      placeholder="e.g. Banana Island, Ikoyi"
                    />
                  </div>
                  <div className={styles.fBlock}>
                    <label className={styles.fLbl}>
                      Property Type{' '}
                      <span className={styles.fLblNote}>— Optional</span>
                    </label>
                    <select className={styles.fSel}>
                      <option>Fully Detached House</option>
                      <option>Apartment</option>
                      <option>Penthouse</option>
                      <option>Villa</option>
                    </select>
                  </div>
                  <div className={styles.fBlock}>
                    <label className={styles.fLbl}>
                      Budget Range{' '}
                      <span className={styles.fLblNote}>— Optional</span>
                    </label>
                    <select className={styles.fSel}>
                      <option>Above ₦1B</option>
                      <option>₦700M – ₦1B</option>
                      <option>₦300M – ₦700M</option>
                    </select>
                  </div>
                  <div className={styles.fBlock}>
                    <label className={styles.fLbl}>
                      Preferred Bedrooms{' '}
                      <span className={styles.fLblNote}>— Optional</span>
                    </label>
                    <select className={styles.fSel}>
                      <option>5+</option>
                      <option>4</option>
                      <option>3</option>
                      <option>Any</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.profSection}>
                <div className={styles.profSectionH}>Notification Preferences</div>
                {[
                  { label: 'Inspection Reminders', sub: 'Get reminders 48hr, 24hr, and 2hr before your inspections', val: notifInspection, set: setNotifInspection },
                  { label: 'New Property Listings', sub: 'Be notified when properties matching your preferences are listed', val: notifListings, set: setNotifListings },
                  { label: 'Market Updates & Insights', sub: 'Monthly Lagos luxury property market reports', val: notifMarket, set: setNotifMarket },
                ].map(({ label, sub, val, set }) => (
                  <div key={label} className={styles.togRow}>
                    <div>
                      <div className={styles.togLabel}>{label}</div>
                      <div className={styles.togSub}>{sub}</div>
                    </div>
                    <div
                      className={`${styles.tog}${val ? ' ' + styles.on : ''}`}
                      onClick={() => set(!val)}
                    >
                      <div className={styles.togThumb} />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.profActions}>
                <button className={styles.btnGold} onClick={handleSaveProfile}>
                  {saveMsg}
                </button>
                <button
                  className={styles.btnSmOutline}
                  onClick={() => alert('A password reset link has been sent to your email.')}
                >
                  Change Password
                </button>
              </div>
              <button className={styles.delLink}>Delete my account</button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM TAB BAR */}
      <div className={styles.mobTabs}>
        {(
          [
            { id: 'dashboard', label: 'Home', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { id: 'inspections', label: 'Inspections', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
            { id: 'saved', label: 'Saved', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> },
            { id: 'profile', label: 'Profile', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          ] as { id: TabId; label: string; icon: React.ReactNode }[]
        ).map(({ id, label, icon }) => (
          <button
            key={id}
            className={`${styles.mobTab}${activeTab === id ? ' ' + styles.active : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
