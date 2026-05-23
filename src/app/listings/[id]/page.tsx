'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const PHOTOS = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=90&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=90&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=90&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=90&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=90&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1600&q=90&auto=format&fit=crop',
];

const THUMB_PHOTOS = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&q=70&auto=format&fit=crop',
];

const SIMILAR = [
  { slug: 'prestige-towers', title: 'Prestige Towers, Ikoyi', price: '₦420,000,000', location: 'Ikoyi, Lagos', beds: 4, baths: 5, sqm: 560, badge: 'New', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop' },
  { slug: 'lekki-ocean-heights', title: 'Lekki Ocean Heights', price: '₦680,000,000', location: 'Victoria Island, Lagos', beds: 6, baths: 7, sqm: 1200, badge: 'Featured', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop' },
  { slug: 'eko-atlantic-pearl', title: 'Eko Atlantic Pearl', price: '₦250,000,000', location: 'Eko Atlantic, Lagos', beds: 3, baths: 4, sqm: 320, badge: 'New', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop' },
];

interface PageProps {
  params: { id: string };
}

export default function PropertyDetailPage({ params }: PageProps) {
  const slug = params.id;

  const [heroIdx, setHeroIdx] = useState(0);
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  // Lightbox keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!lbOpen) return;
      if (e.key === 'ArrowLeft') setLbIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length);
      if (e.key === 'ArrowRight') setLbIdx((i) => (i + 1) % PHOTOS.length);
      if (e.key === 'Escape') setLbOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [lbOpen]);

  function openLb(i: number) {
    setLbIdx(i);
    setLbOpen(true);
  }

  return (
    <>
      <Nav />

      {/* ── GALLERY ── */}
      <div className={styles.gallery}>
        <div className={styles.galleryHero} onClick={() => openLb(heroIdx)}>
          <img src={PHOTOS[heroIdx]} alt="The Arch Residences" />
          <button
            className={styles.viewAll}
            onClick={(e) => { e.stopPropagation(); openLb(heroIdx); }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            View All Photos <em>· {PHOTOS.length}</em>
          </button>
        </div>
        <div className={styles.galleryStrip}>
          {THUMB_PHOTOS.map((src, i) => (
            <div
              key={i}
              className={`${styles.gthumb} ${heroIdx === i ? styles.gthumbOn : ''}`}
              onClick={() => setHeroIdx(i)}
            >
              <img src={src} alt={`Photo ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      <div
        className={`${styles.lightbox} ${lbOpen ? styles.lightboxOpen : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) setLbOpen(false); }}
      >
        <button className={styles.lbX} onClick={() => setLbOpen(false)}>×</button>
        <div
          className={`${styles.lbArr} ${styles.lbPrev}`}
          onClick={() => setLbIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length)}
        >
          ‹
        </div>
        <img className={styles.lbImg} src={PHOTOS[lbIdx]} alt="" />
        <div
          className={`${styles.lbArr} ${styles.lbNext}`}
          onClick={() => setLbIdx((i) => (i + 1) % PHOTOS.length)}
        >
          ›
        </div>
        <div className={styles.lbCtr}>{lbIdx + 1} / {PHOTOS.length}</div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className={styles.page}>
        <div className="left">

          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span style={{ opacity: 0.35 }}>›</span>
            <Link href="/listings">Listings</Link>
            <span style={{ opacity: 0.35 }}>›</span>
            <span>The Arch Residences</span>
          </div>

          {/* Property Header */}
          <div className={styles.propHdr}>
            <h1 className={styles.propName}>The Arch Residences</h1>
            <div className={styles.propPrice}>
              ₦850,000,000
              <span className={styles.propPriceSub}>· ₦1,000,000/sqm</span>
            </div>
            <div className={styles.propLoc}>
              <svg width="12" height="15" viewBox="0 0 12 15" fill="none">
                <path d="M6 0C2.686 0 0 2.686 0 6c0 4.5 6 9 6 9s6-4.5 6-9c0-3.314-2.686-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="rgba(192,168,112,.55)" />
              </svg>
              Banana Island, Lagos Island, Lagos
            </div>
          </div>

          {/* Specs Strip */}
          <div className={styles.details}>
            <div className={styles.spec}>
              <span className={styles.specIcon}>🛏</span>
              <div className={styles.specLbl}>Bedrooms</div>
              <div className={styles.specVal}>5</div>
            </div>
            <div className={styles.spec}>
              <span className={styles.specIcon}>🚿</span>
              <div className={styles.specLbl}>Bathrooms</div>
              <div className={styles.specVal}>6</div>
            </div>
            <div className={styles.spec}>
              <span className={styles.specIcon}>📐</span>
              <div className={styles.specLbl}>Size</div>
              <div className={styles.specVal}>850 sqm</div>
            </div>
            <div className={styles.spec}>
              <span className={styles.specIcon}>🏛</span>
              <div className={styles.specLbl}>Type</div>
              <div className={styles.specVal}>Fully Detached</div>
            </div>
            <div className={styles.spec}>
              <span className={styles.specIcon}>✅</span>
              <div className={styles.specLbl}>Status</div>
              <div className={styles.specVal}>Available</div>
            </div>
          </div>

          {/* Description */}
          <h2 className={styles.secHeading}>About This Property</h2>
          <div className={styles.propDesc}>
            <p>The Arch Residences is a masterpiece of contemporary Nigerian luxury — a fully detached mansion set on a prime 850 sqm plot on the prestigious Banana Island, Lagos. Designed by award-winning architects and finished to the highest international standards, every detail speaks of quiet, enduring sophistication.</p>
            <p>The residence features five en-suite bedrooms across three floors, each with floor-to-ceiling windows that draw in sweeping views of the Lagos Lagoon. The double-height living area opens onto a landscaped courtyard and infinity pool, creating a seamless flow between interior elegance and outdoor serenity.</p>
            <p>A full BQ with private access, a home theatre, Gaggenau-appointed kitchen, and a dedicated home office complete the offering. The estate is fully gated, with 24/7 biometric security and generator backup. This is not just a home — it is a legacy asset.</p>
          </div>

          {/* Features */}
          <div className={styles.features}>
            <h2 className={styles.secHeading}>Features &amp; Amenities</h2>
            <div className={styles.featPills}>
              {['Infinity Pool', 'Generator', 'BQ / Staff Quarters', 'Smart Home System', 'Gated Estate', 'Home Theatre', 'Gym', '24/7 Security', 'Parking — 4 Cars', 'Lagoon View', 'Biometric Access', 'Landscaped Garden'].map((f) => (
                <div key={f} className={styles.fp}>{f}</div>
              ))}
            </div>
          </div>

          {/* Location Note */}
          <div className={styles.locationNote}>
            <strong style={{ color: 'rgba(244,237,224,.65)', fontWeight: 400 }}>Location:</strong> Banana Island is Lagos&#39; most prestigious address, a man-made island with ultra-high-end residential development, excellent infrastructure, and 24/7 estate security. Minutes from Ikoyi, Victoria Island, and the Lekki-Epe Expressway.
          </div>
        </div>

        {/* ── STICKY CTA SIDEBAR ── */}
        <div className="right">
          <div className={styles.ctaCard}>
            <div className={styles.ctaThumb}>
              <img
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=700&q=80&auto=format&fit=crop"
                alt="The Arch Residences"
              />
              <div className={styles.ctaThumbOv}></div>
            </div>
            <div className={styles.ctaBody}>
              <div className={styles.ctaName}>The Arch Residences</div>
              <div className={styles.ctaPrice}>₦850,000,000</div>
              <div className={styles.ctaRule}></div>
              <div className={styles.ctaHeading}>Interested in this property?</div>
              <div className={styles.ctaSub}>
                Schedule a professional inspection with our expert team. We&#39;ll handle every detail from start to finish.
              </div>
              <Link
                href={`/schedule-inspection?propertyId=${slug}`}
                className={styles.ctaBtn}
              >
                Arrange an Inspection →
              </Link>
              <Link href="/enquiry" className={styles.ctaBtnOutline}>
                Submit an Enquiry →
              </Link>
              <div className={styles.ctaContact}>
                <div className={styles.ctaPhone}>
                  <svg width="14" height="14" fill="none" stroke="rgba(192,168,112,.5)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 10.8 19.79 19.79 0 01.43 2.18 2 2 0 012.4 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.22 6.22l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  +234 800 123 4567
                </div>
                <a
                  href="https://wa.me/2348001234567?text=Hello%2C%20I%20am%20interested%20in%20The%20Arch%20Residences"
                  className={styles.ctaWa}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Us
                </a>
              </div>
              <div className={styles.ctaReassure}>
                No commitment required.<br />We&#39;ll guide you through every step.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIMILAR PROPERTIES ── */}
      <section className={styles.similar}>
        <div className={styles.similarHdr}>
          <div>
            <div className="slbl">More Like This</div>
            <h2 className="sec-h">You May Also Like</h2>
          </div>
          <Link href="/listings" className="link-gold">
            View All →
          </Link>
        </div>
        <div className={styles.similarGrid}>
          {SIMILAR.map((p) => (
            <Link key={p.slug} href={`/listings/${p.slug}`} className="pcard" style={{ textDecoration: 'none' }}>
              <div className="cimg">
                <img src={p.img} alt={p.title} loading="lazy" />
                {p.badge && <div className="badge">{p.badge}</div>}
              </div>
              <div className="cbody">
                <div className="cname">{p.title}</div>
                <div className="cprice">{p.price}</div>
                <div className="cloc">{p.location}</div>
                <div className="cmeta">
                  <span>{p.beds} Beds</span>
                  <span>{p.baths} Baths</span>
                  <span>{p.sqm.toLocaleString()} sqm</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
