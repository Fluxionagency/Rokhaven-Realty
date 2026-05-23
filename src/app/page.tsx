'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [category, setCategory] = useState('');

  // Hero zoom effect
  useEffect(() => {
    const heroBg = document.getElementById('heroBg');
    if (heroBg) {
      heroBg.style.backgroundImage =
        "url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=90&auto=format&fit=crop')";
      requestAnimationFrame(() => setTimeout(() => heroBg.classList.add('ready'), 80));
    }
  }, []);

  // Intersection observer for fade-in
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('vis');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();
    if (location) params.set('loc', location);
    if (propertyType) params.set('type', propertyType);
    if (category) {
      const catMap: Record<string, string> = { Sales: '', Rent: 'rent', Shortlets: 'shortlet' };
      const catVal = catMap[category];
      if (catVal) params.set('cat', catVal);
    }
    const qs = params.toString();
    router.push('/listings' + (qs ? '?' + qs : ''));
  }

  return (
    <>
      <Nav />

      {/* ── HERO ── */}
      <section className="hero">
        <div id="heroBg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="eyebrow">Nigeria&#39;s Premier Luxury Real Estate</span>
          <h1>
            Where Your Legacy
            <br />
            <em>Begins</em>
          </h1>
          <p className="hero-sub">
            Discover Nigeria&#39;s most exclusive curated properties, for those who accept nothing but the finest.
          </p>
          <div className="search-bar">
            <div className="sf">
              <label htmlFor="heroLoc">Location</label>
              <select
                id="heroLoc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Any Location</option>
                <option>Banana Island</option>
                <option>Ikoyi</option>
                <option>Victoria Island</option>
                <option>Eko Atlantic</option>
                <option>Lekki Phase 1</option>
                <option>Lekki Phase 2</option>
                <option>Ikeja GRA</option>
                <option>Magodo</option>
              </select>
            </div>
            <div className="sf">
              <label htmlFor="heroPType">Property Type</label>
              <select
                id="heroPType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
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
            <div className="sf">
              <label htmlFor="heroCat">Category</label>
              <select
                id="heroCat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option>Sales</option>
                <option>Rent</option>
                <option>Shortlets</option>
              </select>
            </div>
            <button className="btn-gold" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
        <div className="scroll-ind">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* ── BRAND STRIP ── */}
      <div className="strip">
        <span>Exclusivity</span>
        <div className="strip-dot"></div>
        <span>Integrity</span>
        <div className="strip-dot"></div>
        <span>Excellence</span>
        <div className="strip-dot"></div>
        <span>Discretion</span>
        <div className="strip-dot"></div>
        <span>Legacy</span>
      </div>

      {/* ── FEATURED PROPERTIES ── */}
      <section className="featured">
        <div className="container">
          <div className="feat-hdr fade">
            <div>
              <div className="slbl">Curated Properties</div>
              <h2 className="sec-h">Featured Listings</h2>
            </div>
            <Link href="/listings" className="link-gold">
              View All Properties →
            </Link>
          </div>

          <div className="pgrid fade" style={{ transitionDelay: '.1s' }}>
            <Link href="/listings/arch-residences" className="pcard" style={{ textDecoration: 'none' }}>
              <div className="cimg">
                <img
                  src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop"
                  alt="The Arch Residences"
                  loading="lazy"
                />
                <div className="badge">Featured</div>
              </div>
              <div className="cbody">
                <div className="cname">The Arch Residences</div>
                <div className="cprice">₦850,000,000</div>
                <div className="cloc">Banana Island, Lagos</div>
                <div className="cmeta">
                  <span>5 Beds</span>
                  <span>6 Baths</span>
                  <span>850 sqm</span>
                </div>
              </div>
            </Link>

            <Link href="/listings/prestige-towers" className="pcard" style={{ textDecoration: 'none' }}>
              <div className="cimg">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop"
                  alt="Prestige Towers"
                  loading="lazy"
                />
                <div className="badge">New</div>
              </div>
              <div className="cbody">
                <div className="cname">Prestige Towers, Ikoyi</div>
                <div className="cprice">₦420,000,000</div>
                <div className="cloc">Ikoyi, Lagos</div>
                <div className="cmeta">
                  <span>4 Beds</span>
                  <span>5 Baths</span>
                  <span>560 sqm</span>
                </div>
              </div>
            </Link>

            <Link href="/listings/lekki-ocean-heights" className="pcard" style={{ textDecoration: 'none' }}>
              <div className="cimg">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop"
                  alt="Lekki Ocean Heights"
                  loading="lazy"
                />
                <div className="badge">Featured</div>
              </div>
              <div className="cbody">
                <div className="cname">Lekki Ocean Heights</div>
                <div className="cprice">₦680,000,000</div>
                <div className="cloc">Victoria Island, Lagos</div>
                <div className="cmeta">
                  <span>6 Beds</span>
                  <span>7 Baths</span>
                  <span>1,200 sqm</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="feat-cta fade" style={{ transitionDelay: '.22s' }}>
            <Link href="/listings" className="link-gold">
              Explore All Listings →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="categories">
        <Link href="/listings" className="ctile" style={{ textDecoration: 'none' }}>
          <div
            className="ctile-bg"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80&auto=format&fit=crop')",
            }}
          ></div>
          <div className="ctile-ov"></div>
          <div className="ctile-bar"></div>
          <span className="ctile-arrow">→</span>
          <div className="ctile-c">
            <div className="ctile-eyebrow">Ownership</div>
            <div className="ctile-name">Sales</div>
            <div className="ctile-desc">Acquire a premium property to call your own.</div>
          </div>
        </Link>

        <Link href="/listings?cat=rent" className="ctile" style={{ textDecoration: 'none' }}>
          <div
            className="ctile-bg"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&auto=format&fit=crop')",
            }}
          ></div>
          <div className="ctile-ov"></div>
          <div className="ctile-bar"></div>
          <span className="ctile-arrow">→</span>
          <div className="ctile-c">
            <div className="ctile-eyebrow">Tenancy</div>
            <div className="ctile-name">Rent</div>
            <div className="ctile-desc">Luxury living, entirely on your terms.</div>
          </div>
        </Link>

        <Link href="/listings?cat=shortlet" className="ctile" style={{ textDecoration: 'none' }}>
          <div
            className="ctile-bg"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&q=80&auto=format&fit=crop')",
            }}
          ></div>
          <div className="ctile-ov"></div>
          <div className="ctile-bar"></div>
          <span className="ctile-arrow">→</span>
          <div className="ctile-c">
            <div className="ctile-eyebrow">Short Stay</div>
            <div className="ctile-name">Shortlets</div>
            <div className="ctile-desc">Premium stays for the discerning traveller.</div>
          </div>
        </Link>
      </section>

      {/* ── WHY ROKHAVEN ── */}
      <section className="why">
        <div className="container">
          <div className="why-hdr fade">
            <div className="slbl">Our Promise</div>
            <h2 className="sec-h">The RokHaven Difference</h2>
          </div>
          <div className="pillars">
            <div className="pillar fade" style={{ transitionDelay: '0s' }}>
              <div className="pline"></div>
              <div className="ptitle">Verified Listings</div>
              <div className="pdesc">
                Every property is personally verified by our expert team. You will never encounter a ghost listing or an
                unvetted claim.
              </div>
            </div>
            <div className="pillar fade" style={{ transitionDelay: '.14s' }}>
              <div className="pline"></div>
              <div className="ptitle">Seamless Process</div>
              <div className="pdesc">
                From search to inspection to keys, we handle every step with precision, ensuring a frictionless experience
                throughout.
              </div>
            </div>
            <div className="pillar fade" style={{ transitionDelay: '.28s' }}>
              <div className="pline"></div>
              <div className="ptitle">Professional Service</div>
              <div className="pdesc">
                We are your trusted real estate advisors, not just a directory. Your interests are protected at every stage
                of the transaction.
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
