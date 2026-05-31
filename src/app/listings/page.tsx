'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import styles from './page.module.css';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number | null;
  category: 'SALE' | 'RENT' | 'SHORTLET';
  type: string;
  badge: string | null;
  images: string;
}

function firstImage(images: string): string {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr[0] ? arr[0] : 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop';
  } catch {
    return 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop';
  }
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cat = searchParams.get('cat') || '';

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selLoc, setSelLoc] = useState(() => searchParams.get('loc') || '');
  const [selType, setSelType] = useState('');
  const [selBeds, setSelBeds] = useState('any');
  const [selBaths, setSelBaths] = useState('any');
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [isListView, setIsListView] = useState(false);
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    fetch('/api/properties?limit=100')
      .then((r) => r.json())
      .then((data) => setAllProperties(data.properties || []))
      .catch(() => setAllProperties([]))
      .finally(() => setLoading(false));
  }, []);

  // Determine title and breadcrumb from ?cat
  const catConfig: Record<string, { title: string; breadcrumb: string }> = {
    rent: { title: 'Properties for Rent', breadcrumb: 'Rent' },
    shortlet: { title: 'Short-let Properties', breadcrumb: 'Shortlets' },
    '': { title: 'Properties for Sale', breadcrumb: 'Sales' },
  };
  const { title: pageTitle, breadcrumb } = catConfig[cat] || catConfig[''];

  // Filter properties client-side
  const filtered = allProperties.filter((p) => {
    // Category filter
    if (cat === 'rent' && p.category !== 'RENT') return false;
    if (cat === 'shortlet' && p.category !== 'SHORTLET') return false;
    if (!cat && p.category !== 'SALE') return false;

    // Search text
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) return false;
    }

    // Location filter
    if (selLoc && !p.location.toLowerCase().includes(selLoc.toLowerCase())) return false;

    // Type filter
    if (selType && p.type !== selType) return false;

    // Beds filter
    if (selBeds !== 'any') {
      if (selBeds === '5+') { if (p.bedrooms < 5) return false; }
      else { if (p.bedrooms !== parseInt(selBeds)) return false; }
    }

    // Baths filter
    if (selBaths !== 'any') {
      if (selBaths === '4+') { if (p.bathrooms < 4) return false; }
      else { if (p.bathrooms !== parseInt(selBaths)) return false; }
    }

    return true;
  });

  // Build active tags
  const tags: { label: string; key: string }[] = [];
  if (selLoc) tags.push({ label: selLoc, key: 'loc' });
  if (selType) tags.push({ label: selType, key: 'type' });
  if (selBeds !== 'any') tags.push({ label: `${selBeds} Bed${selBeds === '1' ? '' : 's'}`, key: 'beds' });
  if (selBaths !== 'any') tags.push({ label: `${selBaths} Bath${selBaths === '1' ? '' : 's'}`, key: 'baths' });

  function removeTag(key: string) {
    if (key === 'loc') setSelLoc('');
    if (key === 'type') setSelType('');
    if (key === 'beds') setSelBeds('any');
    if (key === 'baths') setSelBaths('any');
  }

  function clearAll() {
    setSelLoc('');
    setSelType('');
    setSelBeds('any');
    setSelBaths('any');
    setSearchText('');
  }

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick() { setOpenDrop(null); }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function toggleDrop(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setOpenDrop((prev) => (prev === id ? null : id));
  }

  const bedValues = ['any', '1', '2', '3', '4', '5+'];
  const bathValues = ['any', '1', '2', '3', '4+'];

  return (
    <>
      <Nav />

      {/* ── PAGE HEADER ── */}
      <div className={styles.pageHdr}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span style={{ opacity: 0.35 }}>›</span>
          <span>{breadcrumb}</span>
        </div>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
        <div className={styles.pageCount}>{loading ? '…' : `${filtered.length} properties available`}</div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className={styles.searchSection}>
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="Search by location, property name, or area…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { /* trigger already reactive */ } }}
          />
          <button onClick={() => { /* search is reactive */ }}>Search</button>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className={styles.filterWrap}>
        <div className={styles.filterRow}>

          {/* Location — text input with Google Places autocomplete */}
          <div className={`${styles.ftrig} ${selLoc ? styles.ftrigHasVal : ''}`}
               style={{ padding: '0 4px 0 13px', cursor: 'text' }}>
            <LocationAutocomplete
              value={selLoc}
              onChange={setSelLoc}
              placeholder="Location"
              wrapperStyle={{ minWidth: 120, maxWidth: 200 }}
              inputStyle={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 400,
                color: selLoc ? 'var(--gold)' : 'rgba(244,237,224,.65)',
                letterSpacing: '.06em',
                width: '100%',
                padding: '7px 20px 7px 0',
                cursor: 'text',
              }}
            />
          </div>

          {/* Property Type */}
          <div
            className={`${styles.ftrig} ${openDrop === 'type' ? styles.ftrigOpen : ''} ${selType ? styles.ftrigHasVal : ''}`}
            onClick={(e) => toggleDrop('type', e)}
          >
            <span>{selType || 'Property Type'}</span>
            <span className={styles.ftrigArr}>▾</span>
            {openDrop === 'type' && (
              <div className={styles.drop} onClick={(e) => e.stopPropagation()}>
                <div className={styles.dropLbl}>Type</div>
                <select
                  value={selType}
                  onChange={(e) => { setSelType(e.target.value); setOpenDrop(null); }}
                >
                  <option value="">Any Type</option>
                  <option>Apartment</option>
                  <option>Semi-Detached</option>
                  <option>Fully Detached</option>
                  <option>Penthouse</option>
                  <option>Villa</option>
                  <option>Townhouse</option>
                  <option>Maisonette</option>
                </select>
              </div>
            )}
          </div>

          <div className={styles.fdiv}></div>

          <span className={styles.flbl}>Beds</span>
          <div className={styles.pillRow}>
            {bedValues.map((v) => (
              <button
                key={v}
                className={`${styles.pill} ${selBeds === v ? styles.pillOn : ''}`}
                onClick={() => setSelBeds(v)}
              >
                {v === 'any' ? 'Any' : v}
              </button>
            ))}
          </div>

          <div className={styles.fdiv}></div>

          <span className={styles.flbl}>Baths</span>
          <div className={styles.pillRow}>
            {bathValues.map((v) => (
              <button
                key={v}
                className={`${styles.pill} ${selBaths === v ? styles.pillOn : ''}`}
                onClick={() => setSelBaths(v)}
              >
                {v === 'any' ? 'Any' : v}
              </button>
            ))}
          </div>

          <div className={styles.fdiv}></div>

          {tags.length > 0 && (
            <button className={styles.clearAll} onClick={clearAll}>
              Clear All
            </button>
          )}
        </div>

        {/* Active filter tags */}
        {tags.length > 0 && (
          <div className={`${styles.tagsRow} ${styles.tagsRowOpen}`}>
            {tags.map((t) => (
              <div key={t.key} className={styles.tag} onClick={() => removeTag(t.key)}>
                {t.label}
                <span className={styles.tagX}>×</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RESULTS BAR ── */}
      <div className={styles.resultsBar}>
        <div className={styles.rcount}>
          {filtered.length > 0
            ? `Showing ${filtered.length} propert${filtered.length === 1 ? 'y' : 'ies'}`
            : 'No results found'}
        </div>
        <div className={styles.rright}>
          <div className={styles.sortSel}>
            <select defaultValue="Newest">
              <option>Sort: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Popular</option>
            </select>
          </div>
          <div className={styles.vtoggle}>
            <div
              className={`${styles.vbtn} ${!isListView ? styles.vbtnOn : ''}`}
              onClick={() => setIsListView(false)}
              title="Grid view"
            >
              <svg width="13" height="13" viewBox="0 0 13 13">
                <rect x="0" y="0" width="5.5" height="5.5" rx="0.5" />
                <rect x="7.5" y="0" width="5.5" height="5.5" rx="0.5" />
                <rect x="0" y="7.5" width="5.5" height="5.5" rx="0.5" />
                <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="0.5" />
              </svg>
            </div>
            <div
              className={`${styles.vbtn} ${isListView ? styles.vbtnOn : ''}`}
              onClick={() => setIsListView(true)}
              title="List view"
            >
              <svg width="13" height="9" viewBox="0 0 13 9">
                <rect x="0" y="0" width="13" height="2" rx="1" />
                <rect x="0" y="3.5" width="13" height="2" rx="1" />
                <rect x="0" y="7" width="13" height="2" rx="1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── PROPERTY GRID ── */}
      <div className={styles.gridSection}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(244,237,224,.35)', fontSize: '14px', letterSpacing: '0.15em' }}>
            LOADING PROPERTIES…
          </div>
        ) : filtered.length > 0 ? (
          <div className={`${styles.pgrid} ${isListView ? styles.pgridList : ''}`}>
            {filtered.map((p) => (
              <Link key={p.id} href={`/listings/${p.id}`} className="pcard" style={{ textDecoration: 'none' }}>
                <div className="cimg">
                  <img src={firstImage(p.images)} alt={p.title} loading="lazy" />
                  {p.badge && <div className="badge">{p.badge}</div>}
                </div>
                <div className="cbody">
                  <div className="cname">{p.title}</div>
                  <div className="cprice">{p.price}</div>
                  <div className="cloc">{p.location}</div>
                  <div className="cmeta">
                    <span>{p.bedrooms} Bed{p.bedrooms !== 1 ? 's' : ''}</span>
                    <span>{p.bathrooms} Bath{p.bathrooms !== 1 ? 's' : ''}</span>
                    {p.sqm && <span>{p.sqm.toLocaleString()} sqm</span>}
                  </div>
                  <span className={styles.clink}>View Property →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="24" height="24" fill="none" stroke="rgba(192,168,112,0.35)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                <path d="M9 21V12h6v9" />
              </svg>
            </div>
            <h3>No properties found</h3>
            <p>No properties match your current search criteria.</p>
            <button onClick={clearAll}>Clear All Filters</button>
          </div>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {filtered.length > 0 && (
        <div className={styles.pagination}>
          <div
            className={styles.pg}
            onClick={() => setActivePage((p) => Math.max(1, p - 1))}
          >
            ←
          </div>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`${styles.pg} ${activePage === n ? styles.pgOn : ''}`}
              onClick={() => setActivePage(n)}
            >
              {n}
            </div>
          ))}
          <div className={`${styles.pg} ${styles.pgDots}`}>…</div>
          <div
            className={`${styles.pg} ${activePage === 8 ? styles.pgOn : ''}`}
            onClick={() => setActivePage(8)}
          >
            8
          </div>
          <div
            className={styles.pg}
            onClick={() => setActivePage((p) => Math.min(8, p + 1))}
          >
            →
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0B1B35', minHeight: '100vh' }} />}>
      <ListingsContent />
    </Suspense>
  );
}
