'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type TabId = 'dashboard' | 'properties' | 'calendar' | 'submit' | 'profile';
type PropFilterId = 'all' | 'active' | 'rented' | 'sold' | 'pending';
type PropStatus = 'active' | 'pending' | 'rented' | 'sold';

function getInitials(name?: string | null): string {
  if (!name) return 'P';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'P';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

interface MockProperty {
  id: number;
  name: string;
  location: string;
  dateListed: string;
  status: PropStatus;
  inspections: number;
  enquiries: number;
  lastInspection: string | null;
  img: string | null;
}

const MOCK_PROPERTIES: MockProperty[] = [
  {
    id: 1,
    name: 'Oceanfront Penthouse',
    location: 'Victoria Island, Lagos',
    dateListed: 'Listed with RokHaven: 14 March 2026',
    status: 'active',
    inspections: 4,
    enquiries: 9,
    lastInspection: '18 May 2026',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Lekki Garden Mansion',
    location: 'Lekki Phase 2, Lagos',
    dateListed: 'Listed with RokHaven: 2 April 2026',
    status: 'active',
    inspections: 3,
    enquiries: 6,
    lastInspection: '20 May 2026',
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Ikoyi Terrace (3-bedroom)',
    location: 'Ikoyi, Lagos',
    dateListed: 'Submitted: 22 May 2026',
    status: 'pending',
    inspections: 0,
    enquiries: 0,
    lastInspection: null,
    img: null,
  },
];

const INSPECTIONS_DATA: Record<string, { p: string; t: string; confirmed: boolean }[]> = {
  '2026-05-30': [{ p: 'Oceanfront', t: '11am', confirmed: true }],
  '2026-06-04': [{ p: 'Lekki Garden', t: '2pm', confirmed: false }],
  '2026-06-09': [{ p: 'Oceanfront', t: '2pm', confirmed: true }],
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const FEATURES = [
  'Swimming Pool', 'Gym / Fitness Centre', 'Generator', 'BQ / Staff Quarters',
  '24/7 Security', 'Smart Home System', 'Garden / Landscaping', 'Parking (Multiple Cars)',
  'Furnished', 'Elevator', 'Water Treatment Plant', 'Gated Estate',
];

export default function PrincipalPortalPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/principal-login');
    },
  });

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [propFilter, setPropFilter] = useState<PropFilterId>('all');
  const [openStatusMenu, setOpenStatusMenu] = useState<number | null>(null);
  const [modalProp, setModalProp] = useState<string | null>(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [submitRole, setSubmitRole] = useState<'owner' | 'direct' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [beds, setBeds] = useState(4);
  const [baths, setBaths] = useState(4);
  const [activeFeatures, setActiveFeatures] = useState<Set<string>>(new Set(['Swimming Pool', 'Generator', '24/7 Security', 'Smart Home System', 'Gated Estate']));
  const [notifInspection, setNotifInspection] = useState(true);
  const [notifEnquiry, setNotifEnquiry] = useState(true);
  const [notifListing, setNotifListing] = useState(true);
  const [saveMsg, setSaveMsg] = useState('Save Changes');
  const [submissions, setSubmissions] = useState<MockProperty[]>([]);

  // Form refs for submit section
  const titleRef = useRef<HTMLInputElement>(null);
  const txnRef = useRef<HTMLSelectElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const nbhRef = useRef<HTMLSelectElement>(null);
  const sqmRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const topLabels: Record<TabId, string> = {
    dashboard: 'Principal Dashboard',
    properties: 'My Properties',
    calendar: 'Inspection Calendar',
    submit: 'Submit a Property',
    profile: 'My Profile',
  };

  const userName = session?.user?.name ?? 'Principal';
  const firstName = userName.split(' ')[0];
  const userInitials = getInitials(session?.user?.name);

  useEffect(() => {
    fetch('/api/submissions')
      .then(r => r.json())
      .then((data: { id: string; title: string; location: string; status: string; createdAt: string; neighbourhood?: string }[]) => {
        if (!Array.isArray(data)) return;
        setSubmissions(data.map((s, i) => ({
          id: i + 1000,
          name: s.title,
          location: s.neighbourhood ? `${s.neighbourhood}, Lagos` : s.location,
          dateListed: `Submitted: ${new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          status: (s.status === 'APPROVED' ? 'active' : s.status === 'REJECTED' ? 'pending' : 'pending') as PropStatus,
          inspections: 0,
          enquiries: 0,
          lastInspection: null,
          img: null,
        })));
      })
      .catch(() => {});
  }, []);

  const allProperties = [...MOCK_PROPERTIES, ...submissions];

  const filteredProperties = allProperties.filter((p) => {
    if (propFilter === 'all') return true;
    return p.status === propFilter;
  });

  const handlePropertySubmit = async () => {
    if (!submitRole) {
      alert('Please confirm your relationship to the property to proceed.');
      return;
    }
    setSubmitting(true);
    const txnVal = txnRef.current?.value || 'For Sale';
    const categoryMap: Record<string, string> = { 'For Sale': 'SALE', 'For Rent': 'RENT', 'Shortlet': 'SHORTLET', 'Joint Venture (JV)': 'JV' };
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship: submitRole,
          title: titleRef.current?.value || '',
          category: categoryMap[txnVal] || 'SALE',
          type: typeRef.current?.value || 'Fully Detached',
          price: priceRef.current?.value || '',
          location: addressRef.current?.value || '',
          neighbourhood: nbhRef.current?.value || null,
          bedrooms: beds,
          bathrooms: baths,
          sqm: sqmRef.current?.value ? parseFloat(sqmRef.current.value) : null,
          yearBuilt: yearRef.current?.value || null,
          description: descRef.current?.value || '',
          features: JSON.stringify([...activeFeatures]),
          notes: noteRef.current?.value || null,
        }),
      });
    } catch {
      // show success regardless — don't block the principal
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  const toggleFeature = (f: string) => {
    setActiveFeatures((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  const handleSaveProfile = () => {
    setSaveMsg('Saved ✓');
    setTimeout(() => setSaveMsg('Save Changes'), 2000);
  };

  // Close status menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest(`.${styles.statusDrop}`)) {
        setOpenStatusMenu(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Build calendar days
  const renderCalendar = useCallback(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
    const today = new Date();
    const days: React.ReactNode[] = [];

    // Leading blank days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className={`${styles.calDay} ${styles.calDayOther} ${styles.calDayWeekend}`}>
          <div className={styles.calDn}>{prevMonthDays - i}</div>
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dow = new Date(calYear, calMonth, day).getDay();
      const isWeekend = dow === 0 || dow === 6;
      const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day;
      const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const slots = INSPECTIONS_DATA[key] ?? [];

      days.push(
        <div
          key={day}
          className={[
            styles.calDay,
            isWeekend ? styles.calDayWeekend : '',
            isToday ? styles.calDayToday : '',
          ].filter(Boolean).join(' ')}
        >
          <div className={styles.calDn}>{day}</div>
          {slots.map((s, si) => (
            <div key={si} className={s.confirmed ? styles.calSlotGold : styles.calSlotAmber}>
              {s.p} · {s.t}
            </div>
          ))}
        </div>
      );
    }

    // Trailing blank days
    const total = firstDay + daysInMonth;
    const trailing = (7 - (total % 7)) % 7;
    for (let i = 1; i <= trailing; i++) {
      days.push(
        <div key={`next-${i}`} className={`${styles.calDay} ${styles.calDayOther} ${styles.calDayWeekend}`}>
          <div className={styles.calDn}>{i}</div>
        </div>
      );
    }

    return days;
  }, [calYear, calMonth]);

  const navCal = (dir: -1 | 1) => {
    let m = calMonth + dir;
    let y = calYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setCalMonth(m);
    setCalYear(y);
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
      {/* STATUS CONFIRM MODAL */}
      {modalProp && (
        <div className={styles.modalOv} onClick={(e) => e.target === e.currentTarget && setModalProp(null)}>
          <div className={styles.modal}>
            <div className={styles.modalH}>Mark as {modalProp}?</div>
            <p className={styles.modalP}>
              This will remove the property from active listings.{' '}
              {modalProp === 'Inactive'
                ? 'It will no longer be visible to clients.'
                : 'You can contact the RokHaven team if you need to reactivate it.'}
            </p>
            <div className={styles.modalBtns}>
              <button className={styles.modalCancel} onClick={() => setModalProp(null)}>Cancel</button>
              <button className={styles.modalConfirm} onClick={() => setModalProp(null)}>Confirm →</button>
            </div>
          </div>
        </div>
      )}

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
            <div className={styles.sbRole}>Principal</div>
          </div>
        </div>

        <div className={styles.sbSection}>Principal Portal</div>

        <nav className={styles.sbNav}>
          {(
            [
              { id: 'dashboard', label: 'Dashboard', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
              { id: 'properties', label: 'My Properties', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
              { id: 'calendar', label: 'Inspection Calendar', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { id: 'submit', label: 'Submit a Property', icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
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
          <button className={styles.sbLogout} onClick={() => signOut({ callbackUrl: '/' })}>
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
          <button className={styles.tbBtn} onClick={() => { setActiveTab('submit'); setSubmitted(false); }}>
            + Submit a Property
          </button>
        </div>

        <div className={styles.content}>

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div>
              <div className={styles.pgGreeting}>Welcome back, {firstName}.</div>
              <p className={styles.pgSub}>Here&apos;s a snapshot of your property portfolio.</p>

              <div className={styles.stats}>
                <div className={styles.sc}>
                  <div className={styles.scNum}>2</div>
                  <div className={styles.scLbl}>Active Listings</div>
                </div>
                <div className={styles.sc}>
                  <div className={styles.scNum}>7</div>
                  <div className={styles.scLbl}>Inspections This Month</div>
                </div>
                <div className={styles.sc}>
                  <div className={styles.scNum}>1</div>
                  <div className={styles.scLbl}>Properties Sold / Rented</div>
                </div>
              </div>

              {/* Pending Banner */}
              <div className={styles.amberBanner}>
                <svg className={styles.abIcon} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <div className={styles.abTxt}>
                  <span className={styles.abTxtStrong}>1 property submission is under review.</span>
                  {' '}Our team will notify you once it&apos;s approved and goes live — usually within 24–48 hours.
                </div>
              </div>

              {/* Property Snapshot */}
              <div className={styles.secHdr}>
                <span className={styles.slbl} style={{ marginBottom: 0 }}>Your Properties</span>
                <button className={styles.linkGold} onClick={() => setActiveTab('properties')}>
                  View All →
                </button>
              </div>

              {MOCK_PROPERTIES.map((p) => (
                <div key={p.id} className={styles.propRow} onClick={() => setActiveTab('properties')}>
                  {p.img ? (
                    <div className={styles.prThumb}>
                      <img src={p.img} alt={p.name} />
                    </div>
                  ) : (
                    <div className={styles.prThumbPending}>
                      <svg width="22" height="22" fill="none" stroke="rgba(212,146,74,.4)" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                  )}
                  <div>
                    <div className={styles.prName}>{p.name}</div>
                    <div className={styles.prLoc}>{p.location}</div>
                  </div>
                  {p.status === 'active' && (
                    <span className={`${styles.badge} ${styles.bActive}`} style={{ marginLeft: '16px' }}>Active</span>
                  )}
                  {p.status === 'pending' && (
                    <span className={`${styles.badge} ${styles.bPend}`} style={{ marginLeft: '16px' }}>Pending Approval</span>
                  )}
                  <div className={styles.prStats}>
                    <div className={styles.prStat}>
                      <div className={styles.prStatN}>{p.status === 'pending' ? '—' : p.inspections}</div>
                      <div className={styles.prStatL}>Inspections</div>
                    </div>
                    <div className={styles.prStat}>
                      <div className={styles.prStatN}>{p.status === 'pending' ? '—' : p.enquiries}</div>
                      <div className={styles.prStatL}>Enquiries</div>
                    </div>
                  </div>
                  {p.status === 'active' ? (
                    <button className={styles.linkGold} onClick={(e) => { e.stopPropagation(); setActiveTab('properties'); }}>
                      View Details →
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'rgba(212,146,74,.45)' }}>Under Review</span>
                  )}
                </div>
              ))}

              {/* Upcoming Inspections Table */}
              <div className={styles.secHdr} style={{ marginTop: '32px' }}>
                <span className={styles.slbl} style={{ marginBottom: 0 }}>Upcoming Inspections</span>
                <button className={styles.linkGold} onClick={() => setActiveTab('calendar')}>
                  View Full Calendar →
                </button>
              </div>
              <div className={styles.inspTableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={styles.tdStrong}>Oceanfront Penthouse</td>
                      <td>Adaeze O.</td>
                      <td>Fri, 30 May 2026</td>
                      <td><span className={`${styles.badge} ${styles.bConf}`}>Confirmed</span></td>
                    </tr>
                    <tr>
                      <td className={styles.tdStrong}>Lekki Garden Mansion</td>
                      <td>Babatunde A.</td>
                      <td>Wed, 4 Jun 2026</td>
                      <td><span className={`${styles.badge} ${styles.bPend}`}>Pending</span></td>
                    </tr>
                    <tr>
                      <td className={styles.tdStrong}>Oceanfront Penthouse</td>
                      <td>Ngozi O.</td>
                      <td>Mon, 9 Jun 2026</td>
                      <td><span className={`${styles.badge} ${styles.bConf}`}>Confirmed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── MY PROPERTIES ── */}
          {activeTab === 'properties' && (
            <div>
              <div className={styles.pgH}>My Properties</div>
              <div className={styles.tabs}>
                {(['all', 'active', 'rented', 'sold', 'pending'] as PropFilterId[]).map((f) => (
                  <button
                    key={f}
                    className={`${styles.tab}${propFilter === f ? ' ' + styles.active : ''}`}
                    onClick={() => setPropFilter(f)}
                  >
                    {f === 'pending' ? 'Pending Approval' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {filteredProperties.length === 0 && (
                <div className={styles.empty}>
                  <div className={styles.emptyH}>No properties in this category</div>
                </div>
              )}

              {filteredProperties.map((p) => (
                <div key={p.id} className={`${styles.propCard}${p.status === 'pending' ? ' ' + styles.propCardDimmed : ''}`}>
                  {p.img ? (
                    <div className={styles.pcImg}>
                      <img src={p.img} alt={p.name} />
                    </div>
                  ) : (
                    <div className={styles.pcImgPending}>
                      <svg width="32" height="32" fill="none" stroke="rgba(212,146,74,.35)" strokeWidth="1.2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                  )}
                  <div className={styles.pcBody}>
                    <div>
                      <div className={styles.pcName}>{p.name}</div>
                      <div className={styles.pcLoc}>
                        <svg width="10" height="12" viewBox="0 0 12 15" fill="rgba(192,168,112,.35)">
                          <path d="M6 0C2.686 0 0 2.686 0 6c0 4.5 6 9 6 9s6-4.5 6-9c0-3.314-2.686-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                        </svg>
                        {p.location}
                      </div>
                      <div className={styles.pcDate}>{p.dateListed}</div>
                      {(p.status as string) === 'active' && <span className={`${styles.badge} ${styles.bActive}`}>Active</span>}
                      {(p.status as string) === 'pending' && <span className={`${styles.badge} ${styles.bPend}`}>Pending Approval</span>}
                      {(p.status as string) === 'rented' && <span className={`${styles.badge} ${styles.bTeal}`}>Rented</span>}
                      {(p.status as string) === 'sold' && <span className={`${styles.badge} ${styles.bSold}`}>Sold</span>}
                    </div>
                    <div className={styles.pcActions}>
                      {p.status !== 'pending' ? (
                        <>
                          <div className={styles.statusDrop}>
                            <button
                              className={styles.btnSmG}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenStatusMenu(openStatusMenu === p.id ? null : p.id);
                              }}
                            >
                              Update Status ▾
                            </button>
                            <div className={`${styles.statusMenu}${openStatusMenu === p.id ? ' ' + styles.open : ''}`}>
                              <button className={styles.statusOption} onClick={() => { setModalProp('Rented'); setOpenStatusMenu(null); }}>
                                ✓ Mark as Rented
                              </button>
                              <button className={styles.statusOption} onClick={() => { setModalProp('Sold'); setOpenStatusMenu(null); }}>
                                ✓ Mark as Sold
                              </button>
                              <button className={`${styles.statusOption} ${styles.statusOptionDanger}`} onClick={() => { setModalProp('Inactive'); setOpenStatusMenu(null); }}>
                                Mark as Inactive
                              </button>
                            </div>
                          </div>
                          <button className={styles.btnSmG} onClick={() => setActiveTab('calendar')}>View Inspections</button>
                          <button className={styles.btnSmG}>View Enquiries</button>
                        </>
                      ) : (
                        <div className={styles.pcPendingNote}>
                          Under review by RokHaven team — actions available once live.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.pcStats}>
                    {p.status !== 'pending' ? (
                      <>
                        <div className={styles.pcStat}>
                          <div className={styles.pcStatN}>{p.inspections}</div>
                          <div className={styles.pcStatL}>Inspections</div>
                        </div>
                        <div className={styles.pcStat}>
                          <div className={styles.pcStatN}>{p.enquiries}</div>
                          <div className={styles.pcStatL}>Enquiries</div>
                        </div>
                        {p.lastInspection && (
                          <div className={styles.pcStat}>
                            <div className={styles.pcStatLastLbl}>Last inspection</div>
                            <div className={styles.pcStatLastVal}>{p.lastInspection}</div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className={styles.pcStat}>
                          <div className={styles.pcStatN} style={{ fontSize: '18px', color: 'rgba(244,237,224,.2)' }}>—</div>
                          <div className={styles.pcStatL}>Inspections</div>
                        </div>
                        <div className={styles.pcStat}>
                          <div className={styles.pcStatN} style={{ fontSize: '18px', color: 'rgba(244,237,224,.2)' }}>—</div>
                          <div className={styles.pcStatL}>Enquiries</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── INSPECTION CALENDAR ── */}
          {activeTab === 'calendar' && (
            <div>
              <div className={styles.secHdr} style={{ marginBottom: '18px' }}>
                <div className={styles.pgH} style={{ marginBottom: 0 }}>Inspection Calendar</div>
                <select className={styles.calFilter}>
                  <option>All Properties</option>
                  <option>Oceanfront Penthouse</option>
                  <option>Lekki Garden Mansion</option>
                </select>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(244,237,224,.3)', marginBottom: '22px' }}>
                All scheduled inspections across your properties.
              </p>

              <div className={styles.calControls}>
                <div className={styles.calMonth}>{MONTHS[calMonth]} {calYear}</div>
                <div className={styles.calRight}>
                  <button className={styles.calBtn} onClick={() => navCal(-1)}>‹</button>
                  <button className={`${styles.calBtn} ${styles.calTodayBtn}`} onClick={() => { setCalYear(2026); setCalMonth(4); }}>
                    Today
                  </button>
                  <button className={styles.calBtn} onClick={() => navCal(1)}>›</button>
                </div>
              </div>

              <div className={styles.calGridHdr}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className={styles.calDh}>{d}</div>
                ))}
              </div>
              <div className={styles.calGrid}>
                {renderCalendar()}
              </div>

              <div className={styles.calLegend}>
                <div className={styles.calLi}>
                  <div className={styles.calDot} style={{ background: 'rgba(192,168,112,.12)', border: '1px solid rgba(192,168,112,.3)' }} />
                  Confirmed inspection
                </div>
                <div className={styles.calLi}>
                  <div className={styles.calDot} style={{ background: 'rgba(212,146,74,.12)', border: '1px solid rgba(212,146,74,.25)' }} />
                  Pending confirmation
                </div>
                <div className={styles.calLi}>
                  <div className={styles.calDot} style={{ border: '1.5px solid #C0A870' }} />
                  Today
                </div>
              </div>

              <div className={styles.calNote}>
                <svg width="16" height="16" fill="none" stroke="#527070" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                For changes to inspections, please contact the RokHaven team. Principals cannot reschedule or cancel inspections directly.
              </div>

              <div style={{ marginTop: '28px' }}>
                <span className={styles.slbl}>Upcoming Inspections</span>
                <div className={styles.inspTableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={styles.tdStrong}>Oceanfront Penthouse</td>
                        <td>Adaeze O.</td>
                        <td>Fri, 30 May 2026</td>
                        <td><span className={`${styles.badge} ${styles.bConf}`}>Confirmed</span></td>
                        <td className={styles.tdNote}>Morning preferred</td>
                      </tr>
                      <tr>
                        <td className={styles.tdStrong}>Lekki Garden Mansion</td>
                        <td>Babatunde A.</td>
                        <td>Wed, 4 Jun 2026</td>
                        <td><span className={`${styles.badge} ${styles.bPend}`}>Pending</span></td>
                        <td className={styles.tdNote}>—</td>
                      </tr>
                      <tr>
                        <td className={styles.tdStrong}>Oceanfront Penthouse</td>
                        <td>Ngozi O.</td>
                        <td>Mon, 9 Jun 2026</td>
                        <td><span className={`${styles.badge} ${styles.bConf}`}>Confirmed</span></td>
                        <td className={styles.tdNote}>Afternoon slot</td>
                      </tr>
                      <tr className={styles.dimmedRow}>
                        <td className={styles.tdStrong}>Oceanfront Penthouse</td>
                        <td>Emeka B.</td>
                        <td>Thu, 15 May 2026</td>
                        <td><span className={`${styles.badge} ${styles.bTeal}`}>Completed</span></td>
                        <td className={styles.tdNote}>—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── SUBMIT A PROPERTY ── */}
          {activeTab === 'submit' && (
            <div>
              {!submitted ? (
                <div>
                  <div className={styles.pgH}>Submit a New Property</div>
                  <p className={styles.pgSub}>
                    Once submitted, our team will review your property and publish it within 24–48 hours.
                    You will be notified when it goes live.
                  </p>

                  {/* Section 0 — Relationship */}
                  <div className={styles.formSection}>
                    <div className={styles.fsTitle}>Your Relationship to the Property</div>
                    <p className={styles.fsSub}>Confirm your direct relationship to this property.</p>
                    <div className={styles.fg}>
                      <label className={styles.fLbl}>Which best describes you?</label>
                      <div className={styles.rolePillRow}>
                        <button
                          type="button"
                          className={`${styles.rolePill}${submitRole === 'owner' ? ' ' + styles.active : ''}`}
                          onClick={() => setSubmitRole('owner')}
                        >
                          I am the Property Owner
                        </button>
                        <button
                          type="button"
                          className={`${styles.rolePill}${submitRole === 'direct' ? ' ' + styles.active : ''}`}
                          onClick={() => setSubmitRole('direct')}
                        >
                          I have a Direct Mandate
                        </button>
                      </div>
                    </div>
                    <div className={styles.infoBoxGold}>
                      <span className={styles.infoBoxIcon}>ℹ</span>
                      <div className={styles.infoBoxTxt}>
                        <span className={styles.infoBoxTxtStrong}>We only work with direct relationships.</span>{' '}
                        RokHaven Realty does not accept semi-direct or sub-mandates of any kind. Submissions are only reviewed from verified property owners or holders of a direct mandate.
                      </div>
                    </div>
                  </div>

                  {/* Section 1 — Basic Details */}
                  <div className={styles.formSection}>
                    <div className={styles.fsTitle}>Basic Details</div>
                    <div className={styles.fg}>
                      <label className={styles.fLbl}>Property Title</label>
                      <input ref={titleRef} className={styles.fi} placeholder="e.g. 4-Bedroom Duplex in Lekki Phase 1" />
                    </div>
                    <div className={`${styles.g3} ${styles.fg}`}>
                      <div>
                        <label className={styles.fLbl}>Transaction Type</label>
                        <select ref={txnRef} className={styles.fsel}>
                          <option>For Sale</option>
                          <option>For Rent</option>
                          <option>Shortlet</option>
                          <option>Joint Venture (JV)</option>
                        </select>
                      </div>
                      <div>
                        <label className={styles.fLbl}>Property Type</label>
                        <select ref={typeRef} className={styles.fsel}>
                          <option>Fully Detached</option>
                          <option>Apartment</option>
                          <option>Semi-Detached</option>
                          <option>Penthouse</option>
                          <option>Villa</option>
                          <option>Townhouse</option>
                          <option>Maisonette</option>
                        </select>
                      </div>
                      <div>
                        <label className={styles.fLbl}>Price (₦)</label>
                        <input ref={priceRef} className={styles.fi} placeholder="e.g. 450,000,000" />
                      </div>
                    </div>
                    <div className={styles.fg}>
                      <label className={styles.fLbl}>Full Address</label>
                      <input ref={addressRef} className={styles.fi} placeholder="Street address, estate name" />
                    </div>
                    <div className={styles.fg}>
                      <label className={styles.fLbl}>Neighbourhood</label>
                      <select ref={nbhRef} className={styles.fsel}>
                        <option value="">Select neighbourhood</option>
                        <option>Banana Island</option>
                        <option>Ikoyi</option>
                        <option>Victoria Island</option>
                        <option>Eko Atlantic</option>
                        <option>Lekki Phase 1</option>
                        <option>Lekki Phase 2</option>
                        <option>Ajah</option>
                        <option>Ikeja GRA</option>
                        <option>Magodo</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Section 2 — Property Details */}
                  <div className={styles.formSection}>
                    <div className={styles.fsTitle}>Property Details</div>
                    <div className={`${styles.g3} ${styles.fg}`}>
                      <div>
                        <label className={styles.fLbl}>Bedrooms</label>
                        <div className={styles.stepper}>
                          <button className={styles.stepBtn} onClick={() => setBeds((v) => Math.max(1, v - 1))}>−</button>
                          <div className={styles.stepVal}>{beds}</div>
                          <button className={styles.stepBtn} onClick={() => setBeds((v) => Math.min(10, v + 1))}>+</button>
                        </div>
                      </div>
                      <div>
                        <label className={styles.fLbl}>Bathrooms</label>
                        <div className={styles.stepper}>
                          <button className={styles.stepBtn} onClick={() => setBaths((v) => Math.max(1, v - 1))}>−</button>
                          <div className={styles.stepVal}>{baths}</div>
                          <button className={styles.stepBtn} onClick={() => setBaths((v) => Math.min(10, v + 1))}>+</button>
                        </div>
                      </div>
                      <div>
                        <label className={styles.fLbl}>Size (sqm)</label>
                        <input ref={sqmRef} className={styles.fi} placeholder="e.g. 650" />
                      </div>
                    </div>
                    <div className={styles.fg}>
                      <label className={styles.fLbl}>
                        Year Built{' '}
                        <span className={styles.fLblNote}>— Optional</span>
                      </label>
                      <input ref={yearRef} className={styles.fi} placeholder="e.g. 2021" type="number" min={1980} max={2026} />
                    </div>
                    <div className={styles.fg}>
                      <label className={styles.fLbl}>Full Description</label>
                      <textarea
                        ref={descRef}
                        className={styles.fta}
                        style={{ minHeight: '120px' }}
                        placeholder="Describe the property in detail — style, finishes, outdoor spaces, views, unique features…"
                      />
                    </div>
                  </div>

                  {/* Section 3 — Features */}
                  <div className={styles.formSection}>
                    <div className={styles.fsTitle}>Features &amp; Amenities</div>
                    <p className={styles.fsSub}>Select all that apply to your property.</p>
                    <div className={styles.featGrid}>
                      {FEATURES.map((f) => (
                        <div
                          key={f}
                          className={`${styles.featOpt}${activeFeatures.has(f) ? ' ' + styles.active : ''}`}
                          onClick={() => toggleFeature(f)}
                        >
                          <div className={styles.featChk}>
                            <span className={styles.featChkMark}>✓</span>
                          </div>
                          <span className={styles.featTxt}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4 — Note */}
                  <div className={styles.formSection}>
                    <div className={styles.fsTitle}>
                      Note to RokHaven Team{' '}
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(244,237,224,.25)', fontWeight: 300 }}>
                        — Optional
                      </span>
                    </div>
                    <div className={styles.fg}>
                      <textarea
                        ref={noteRef}
                        className={styles.fta}
                        placeholder="e.g. Preferred inspection times, special access instructions, anything our team should know before publishing…"
                      />
                    </div>
                  </div>

                  <button
                    className={styles.btnGoldFull}
                    disabled={submitting}
                    onClick={handlePropertySubmit}
                  >
                    {submitting ? 'Submitting…' : 'Submit for Review →'}
                  </button>
                  <p className={styles.submitDisclaimer}>
                    Once submitted, a member of the RokHaven team will review your listing. You will receive a notification when it goes live. You will not be able to edit the listing directly — please contact our team for changes after submission.
                  </p>
                </div>
              ) : (
                /* Success State */
                <div className={styles.submitSuccess}>
                  <div className={styles.ssRing}>
                    <svg width="30" height="30" fill="none">
                      <polyline
                        className={styles.ssCk}
                        points="6,15 12,21 24,9"
                        stroke="#C0A870"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className={styles.ssH}>Property Submitted for Review</div>
                  <p className={styles.ssP}>
                    Thank you, {firstName}. Our team will review your submission and publish it within 24–48 hours.
                    You&apos;ll receive a WhatsApp and email notification once your property is live on RokHaven.
                  </p>
                  <button
                    className={styles.ssBtn}
                    onClick={() => {
                      setActiveTab('properties');
                      setSubmitted(false);
                      setSubmitRole(null);
                    }}
                  >
                    Return to My Properties →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── MY PROFILE ── */}
          {activeTab === 'profile' && (
            <div>
              <div className={styles.pgH}>My Profile</div>

              <div className={styles.profSection}>
                <div className={styles.profH}>Personal Details</div>
                <div className={styles.profGrid}>
                  <div>
                    <label className={styles.fLbl}>Full Name</label>
                    <input className={styles.fi} defaultValue={session?.user?.name ?? ''} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className={styles.fLbl}>
                      Email Address{' '}
                      <span className={styles.fLblNote}>— contact support to change</span>
                    </label>
                    <input className={styles.fi} value={session?.user?.email ?? ''} disabled readOnly />
                  </div>
                  <div>
                    <label className={styles.fLbl}>Phone Number</label>
                    <input className={styles.fi} defaultValue="+234 816 902 3340" placeholder="Your phone number" />
                  </div>
                  <div>
                    <label className={styles.fLbl}>
                      WhatsApp Number{' '}
                      <span className={styles.fLblNote}>— used for listing notifications</span>
                    </label>
                    <input className={styles.fi} defaultValue="+234 816 902 3340" placeholder="WhatsApp number" />
                  </div>
                </div>
              </div>

              <div className={styles.profSection}>
                <div className={styles.profH}>Notification Preferences</div>
                {[
                  { label: 'Inspection Alerts', sub: 'Notified when an inspection is booked on your property', val: notifInspection, set: setNotifInspection },
                  { label: 'New Enquiry Alerts', sub: 'Notified when a client submits an enquiry about your listing', val: notifEnquiry, set: setNotifEnquiry },
                  { label: 'Listing Status Updates', sub: 'Notified when your listing is approved, paused, or goes live', val: notifListing, set: setNotifListing },
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
                <button className={styles.btnGoldSm} onClick={handleSaveProfile}>{saveMsg}</button>
                <button className={styles.btnSmG}>Change Password</button>
              </div>

              <div className={styles.profInfoNote}>
                <svg width="14" height="14" fill="none" stroke="#527070" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Need to update a listing?{' '}
                <Link href="/contact">Contact the RokHaven team →</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM TABS */}
      <div className={styles.mobTabs}>
        {(
          [
            { id: 'dashboard', label: 'Home', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { id: 'properties', label: 'Properties', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/></svg> },
            { id: 'submit', label: 'Submit', icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
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
