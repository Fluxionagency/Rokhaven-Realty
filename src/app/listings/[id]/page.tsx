'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import styles from './page.module.css';

interface DbProperty {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  neighbourhood: string | null;
  type: string;
  category: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number | null;
  features: string;
  images: string;
  video: string | null;
  badge: string | null;
  status: string;
}

interface SimilarProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number | null;
  badge: string | null;
  images: string;
}

function firstImage(images: string): string {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr[0] ? arr[0] : '';
  } catch { return ''; }
}

function getVideoEmbed(url: string): { type: 'iframe' | 'video'; src: string } | null {
  if (!url) return null;

  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` };

  // Vimeo
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return { type: 'iframe', src: `https://player.vimeo.com/video/${vi[1]}` };

  // Google Drive — convert to /preview embed
  const gd = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gd) return { type: 'iframe', src: `https://drive.google.com/file/d/${gd[1]}/preview` };

  // Direct video file (Supabase storage or any .mp4/.mov/etc)
  if (/\.(mp4|mov|webm|ogg|avi)(\?|$)/i.test(url) || url.includes('supabase')) {
    return { type: 'video', src: url };
  }

  return null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PageProps) {
  const [id, setId] = useState('');
  const [property, setProperty] = useState<DbProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);
  const [similar, setSimilar] = useState<SimilarProperty[]>([]);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((data: DbProperty) => {
        setProperty(data);
        try {
          const imgs = JSON.parse(data.images);
          setPhotos(Array.isArray(imgs) && imgs.length > 0 ? imgs : []);
        } catch {
          setPhotos([]);
        }
        // Fetch similar properties (same category, exclude current)
        fetch(`/api/properties?limit=3`)
          .then((r) => r.json())
          .then((res) => {
            const others = (res.properties || []).filter((p: SimilarProperty) => p.id !== id);
            setSimilar(others.slice(0, 3));
          })
          .catch(() => {});
      })
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Lightbox keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!lbOpen) return;
      if (e.key === 'ArrowLeft') setLbIdx((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') setLbIdx((i) => (i + 1) % photos.length);
      if (e.key === 'Escape') setLbOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [lbOpen, photos.length]);

  function openLb(i: number) {
    setLbIdx(i);
    setLbOpen(true);
  }

  if (loading) return (
    <div style={{ background: '#0B1B35', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(244,237,224,.35)', letterSpacing: '0.15em', fontSize: '13px' }}>
      LOADING…
    </div>
  );

  if (!property) return (
    <div style={{ background: '#0B1B35', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(244,237,224,.5)' }}>
      Property not found. <a href="/listings" style={{ color: '#C0A870', marginLeft: 8 }}>Back to listings</a>
    </div>
  );

  const features: string[] = (() => { try { return JSON.parse(property.features); } catch { return []; } })();

  return (
    <>
      <Nav />

      {/* ── GALLERY ── */}
      <div className={styles.gallery}>
        <div className={styles.galleryHero} onClick={() => openLb(heroIdx)}>
          <img src={photos[heroIdx] || ''} alt={property.title} />
          <button
            className={styles.viewAll}
            onClick={(e) => { e.stopPropagation(); openLb(heroIdx); }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            View All Photos <em>· {photos.length}</em>
          </button>
        </div>
        <div className={styles.galleryStrip}>
          {photos.map((src, i) => (
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
          onClick={() => setLbIdx((i) => (i - 1 + photos.length) % photos.length)}
        >
          ‹
        </div>
        <img className={styles.lbImg} src={photos[lbIdx] || ''} alt="" />
        <div
          className={`${styles.lbArr} ${styles.lbNext}`}
          onClick={() => setLbIdx((i) => (i + 1) % photos.length)}
        >
          ›
        </div>
        <div className={styles.lbCtr}>{lbIdx + 1} / {photos.length}</div>
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
            <span>{property.title}</span>
          </div>

          {/* Property Header */}
          <div className={styles.propHdr}>
            <h1 className={styles.propName}>{property.title}</h1>
            <div className={styles.propPrice}>
              {property.price}
            </div>
            <div className={styles.propLoc}>
              <svg width="12" height="15" viewBox="0 0 12 15" fill="none">
                <path d="M6 0C2.686 0 0 2.686 0 6c0 4.5 6 9 6 9s6-4.5 6-9c0-3.314-2.686-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="rgba(192,168,112,.55)" />
              </svg>
              {property.location}
            </div>
          </div>

          {/* Specs Strip */}
          <div className={styles.details}>
            <div className={styles.spec}>
              <span className={styles.specIcon}>🛏</span>
              <div className={styles.specLbl}>Bedrooms</div>
              <div className={styles.specVal}>{property.bedrooms}</div>
            </div>
            <div className={styles.spec}>
              <span className={styles.specIcon}>🚿</span>
              <div className={styles.specLbl}>Bathrooms</div>
              <div className={styles.specVal}>{property.bathrooms}</div>
            </div>
            {property.sqm && (
              <div className={styles.spec}>
                <span className={styles.specIcon}>📐</span>
                <div className={styles.specLbl}>Size</div>
                <div className={styles.specVal}>{property.sqm} sqm</div>
              </div>
            )}
            <div className={styles.spec}>
              <span className={styles.specIcon}>🏛</span>
              <div className={styles.specLbl}>Type</div>
              <div className={styles.specVal}>{property.type}</div>
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
            <p>{property.description}</p>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className={styles.features}>
              <h2 className={styles.secHeading}>Features &amp; Amenities</h2>
              <div className={styles.featPills}>
                {features.map((f: string) => (
                  <div key={f} className={styles.fp}>{f}</div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {property.video && (() => {
            const embed = getVideoEmbed(property.video);
            if (!embed) return null;
            return (
              <div className={styles.videoSection}>
                <h2 className={styles.secHeading}>Property Video</h2>
                <div className={styles.videoWrap}>
                  {embed.type === 'iframe' ? (
                    <iframe
                      src={embed.src}
                      allowFullScreen
                      allow="autoplay; encrypted-media; picture-in-picture"
                      frameBorder="0"
                    />
                  ) : (
                    <video controls playsInline>
                      <source src={embed.src} />
                    </video>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── STICKY CTA SIDEBAR ── */}
        <div className="right">
          <div className={styles.ctaCard}>
            <div className={styles.ctaThumb}>
              <img
                src={photos[0] || ''}
                alt={property.title}
              />
              <div className={styles.ctaThumbOv}></div>
            </div>
            <div className={styles.ctaBody}>
              <div className={styles.ctaName}>{property.title}</div>
              <div className={styles.ctaPrice}>{property.price}</div>
              <div className={styles.ctaRule}></div>
              <div className={styles.ctaHeading}>Interested in this property?</div>
              <div className={styles.ctaSub}>
                Schedule a professional inspection with our expert team. We&#39;ll handle every detail from start to finish.
              </div>
              <Link
                href={`/schedule-inspection?propertyId=${id}`}
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
                  +234 916 761 9009
                </div>
                <a
                  href={`https://wa.me/2349167619009?text=${encodeURIComponent(`Hello, I am interested in this property: https://rokhaven.com/listings/${id}`)}`}
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
      {similar.length > 0 && (
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
            {similar.map((p) => (
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
                    <span>{p.bedrooms} Beds</span>
                    <span>{p.bathrooms} Baths</span>
                    {p.sqm && <span>{p.sqm.toLocaleString()} sqm</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
