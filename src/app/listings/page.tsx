'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import styles from './page.module.css';

interface Property {
  id: string;
  slug: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  sqm: number;
  category: 'SALE' | 'RENT' | 'SHORTLET';
  type: string;
  badge: string | null;
  img: string;
}

const ALL_PROPERTIES: Property[] = [
  { id: '1', slug: 'arch-residences', title: 'The Arch Residences', price: '₦850,000,000', location: 'Banana Island, Lagos', beds: 5, baths: 6, sqm: 850, category: 'SALE', type: 'Fully Detached', badge: 'Featured', img: 'photo-1613490493576-7fde63acd811' },
  { id: '2', slug: 'prestige-towers', title: 'Prestige Towers, Ikoyi', price: '₦420,000,000', location: 'Ikoyi, Lagos', beds: 4, baths: 5, sqm: 560, category: 'SALE', type: 'Penthouse', badge: 'New', img: 'photo-1600596542815-ffad4c1539a9' },
  { id: '3', slug: 'lekki-ocean-heights', title: 'Lekki Ocean Heights', price: '₦680,000,000', location: 'Victoria Island, Lagos', beds: 6, baths: 7, sqm: 1200, category: 'SALE', type: 'Villa', badge: 'Featured', img: 'photo-1600585154340-be6161a56a0c' },
  { id: '4', slug: 'eko-atlantic-pearl', title: 'Eko Atlantic Pearl', price: '₦250,000,000', location: 'Eko Atlantic, Lagos', beds: 3, baths: 4, sqm: 320, category: 'SALE', type: 'Apartment', badge: 'New', img: 'photo-1512917774080-9991f1c4c750' },
  { id: '5', slug: 'maitama-heritage', title: 'Maitama Heritage Estate', price: '₦18,000,000/yr', location: 'Lekki Phase 1, Lagos', beds: 4, baths: 4, sqm: 380, category: 'RENT', type: 'Apartment', badge: 'Featured', img: 'photo-1560448204-e02f11c3d0e2' },
  { id: '6', slug: 'victoria-crown', title: 'Victoria Crown Shortlet', price: '₦450,000/night', location: 'Victoria Island, Lagos', beds: 2, baths: 2, sqm: 180, category: 'SHORTLET', type: 'Apartment', badge: 'New', img: 'photo-1564013799919-ab600027ffc6' },
  { id: '7', slug: 'ikoyi-ridge', title: 'Ikoyi Ridge Duplex', price: '₦520,000,000', location: 'Ikoyi, Lagos', beds: 5, baths: 5, sqm: 680, category: 'SALE', type: 'Semi-Detached', badge: null, img: 'photo-1613490493576-7fde63acd811' },
  { id: '8', slug: 'island-terrace', title: 'Island Terrace Apartments', price: '₦12,500,000/yr', location: 'Victoria Island, Lagos', beds: 3, baths: 3, sqm: 290, category: 'RENT', type: 'Apartment', badge: 'New', img: 'photo-1600596542815-ffad4c1539a9' },
  { id: '9', slug: 'banana-island-suite', title: 'Banana Island Suite', price: '₦280,000/night', location: 'Banana Island, Lagos', beds: 1, baths: 1, sqm: 95, category: 'SHORTLET', type: 'Apartment', badge: 'New', img: 'photo-1600585154340-be6161a56a0c' },
];

function imgUrl(photo: string) {
  return `https://images.unsplash.com/${photo}?w=800&q=80&auto=format&fit=crop`;
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cat = searchParams.get('cat') || '';

  const [searchText, setSearchText] = useState('');
  const [selLoc, setSelLoc] = useState('');
  const [selType, setSelType] = useState('');
  const [selBeds, setSelBeds] = useState('any');
  const [selBaths, setSelBaths] = useState('any');
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [isListView, setIsListView] = useState(false);
  const [activePage, setActivePage] = useState(1);

  // Determine title and breadcrumb from ?cat
  const catConfig: Record<string, { title: string; breadcrumb: string }> = {
    rent: { title: 'Properties for Rent', breadcrumb: 'Rent' },
    shortlet: { title: 'Short-let Properties', breadcrumb: 'Shortlets' },
    '': { title: 'Properties for Sale', breadcrumb: 'Sales' },
  };
  const { title: pageTitle, breadcrumb } = catConfig[cat] || catConfig[''];

  // Filter properties client-side
  const filtered = ALL_PROPERTIES.filter((p) => {
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
      if (selBeds === '5+') { if (p.beds < 5) return false; }
      else { if (p.beds !== parseInt(selBeds)) return false; }
    }

    // Baths filter
    if (selBaths !== 'any') {
      if (selBaths === '4+') { if (p.baths < 4) return false; }
      else { if (p.baths !== parseInt(selBaths)) return false; }
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
        <div className={styles.pageCount}>{filtered.length} properties available</div>
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

          {/* Location */}
          <div
            className={`${styles.ftrig} ${openDrop === 'loc' ? styles.ftrigOpen : ''} ${selLoc ? styles.ftrigHasVal : ''}`}
            onClick={(e) => toggleDrop('loc', e)}
          >
            <span>{selLoc || 'Location'}</span>
            <span className={styles.ftrigArr}>▾</span>
            {openDrop === 'loc' && (
              <div className={styles.drop} onClick={(e) => e.stopPropagation()}>
                <div className={styles.dropLbl}>Neighbourhood</div>
                <select
                  value={selLoc}
                  onChange={(e) => { setSelLoc(e.target.value); setOpenDrop(null); }}
                >
                  <option value="">Any Location</option>
                  <option>Banana Island</option>
                  <option>Ikoyi</option>
                  <option>Victoria Island</option>
                  <option>Eko Atlantic</option>
                  <option>Lekki Phase 1</option>
                  <option>Lekki Phase 2</option>
                  <option>Ajah</option>
                  <option>Ikeja GRA</option>
                  <option>Magodo</option>
                </select>
              </div>
            )}
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
        {filtered.length > 0 ? (
          <div className={`${styles.pgrid} ${isListView ? styles.pgridList : ''}`}>
            {filtered.map((p) => (
              <Link key={p.id} href={`/listings/${p.slug}`} className="pcard" style={{ textDecoration: 'none' }}>
                <div className="cimg">
                  <img src={imgUrl(p.img)} alt={p.title} loading="lazy" />
                  {p.badge && <div className="badge">{p.badge}</div>}
                </div>
                <div className="cbody">
                  <div className="cname">{p.title}</div>
                  <div className="cprice">{p.price}</div>
                  <div className="cloc">{p.location}</div>
                  <div className="cmeta">
                    <span>{p.beds} Bed{p.beds !== 1 ? 's' : ''}</span>
                    <span>{p.baths} Bath{p.baths !== 1 ? 's' : ''}</span>
                    <span>{p.sqm.toLocaleString()} sqm</span>
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
