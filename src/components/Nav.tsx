'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavProps {
  backHref?: string;
  backLabel?: string;
}

export default function Nav({ backHref, backLabel }: NavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const nav = document.getElementById('nav');
    const handleScroll = () => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 64);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (loginOpen || drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [loginOpen, drawerOpen]);

  function openLoginFromDrawer() {
    setDrawerOpen(false);
    // wait for drawer slide-out to finish, then scroll top and open overlay
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setLoginOpen(true);
    }, 260);
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLoginOpen(false); setDrawerOpen(false); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <nav id="nav">
        <Link href="/" className="nav-logo">
          <svg width="48" height="48" viewBox="0 0 60 60" fill="#C0A870">
            <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z"/>
          </svg>
          <div>
            <div className="wm">ROKHAVEN</div>
            <div className="sm">REALTY</div>
          </div>
        </Link>

        <button className="nav-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Menu">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div className="nav-links">
          <Link href="/listings" className={pathname === '/listings' ? 'active' : ''}>Sales</Link>
          <Link href="/listings?cat=rent">Rent</Link>
          <Link href="/listings?cat=shortlet">Shortlets</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>Contact</Link>
          <Link href="/list-your-property" className={`nav-list${pathname === '/list-your-property' ? ' active' : ''}`}>List a Property</Link>
        </div>

        <button className="nav-login-btn" onClick={() => setLoginOpen(true)}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Login
        </button>

        <Link href="/enquiry" className="nav-cta">Schedule a Viewing</Link>
      </nav>

      {/* Login Overlay */}
      <div
        className={`login-overlay${loginOpen ? ' open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) setLoginOpen(false); }}
      >
        <button
          onClick={() => setLoginOpen(false)}
          style={{ position: 'absolute', top: 28, right: 36, background: 'none', border: 'none', color: 'rgba(244,237,224,.3)', fontSize: 28, cursor: 'pointer', lineHeight: 1, transition: 'color .2s' }}
          onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(244,237,224,.8)')}
          onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(244,237,224,.3)')}
        >×</button>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(26px,3vw,36px)', color: '#F4EDE0', marginBottom: 8, lineHeight: 1.1 }}>Welcome to RokHaven</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 300, color: 'rgba(244,237,224,.38)' }}>Select your portal to continue</div>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: '0 24px' }}>
          <div
            onClick={() => { window.location.href = '/auth/client-login'; }}
            style={{ width: 300, background: '#2A3F5C', border: '1px solid rgba(192,168,112,.14)', borderTop: '3px solid #C0A870', borderRadius: 4, padding: '36px 28px 32px', cursor: 'pointer', transition: 'transform .28s cubic-bezier(.2,.7,.3,1),box-shadow .28s', textAlign: 'center' }}
            onMouseOver={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 20px 50px rgba(0,0,0,.5),0 0 0 1px rgba(192,168,112,.2)'; }}
            onMouseOut={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1.5px solid rgba(244,237,224,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
              <svg width="24" height="24" fill="none" stroke="rgba(244,237,224,0.65)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#F4EDE0', marginBottom: 10 }}>{"I'm a Client"}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, fontWeight: 300, color: 'rgba(244,237,224,.42)', lineHeight: 1.75, marginBottom: 26 }}>Search properties, track your inspections, and manage your enquiries.</div>
            <div style={{ background: '#C0A870', color: '#060F1C', fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', padding: 13, borderRadius: 2 }}>Enter Client Portal</div>
          </div>
          <div
            onClick={() => { window.location.href = '/auth/principal-login'; }}
            style={{ width: 300, background: '#2A3F5C', border: '1px solid rgba(192,168,112,.14)', borderTop: '3px solid #C0A870', borderRadius: 4, padding: '36px 28px 32px', cursor: 'pointer', transition: 'transform .28s cubic-bezier(.2,.7,.3,1),box-shadow .28s', textAlign: 'center' }}
            onMouseOver={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 20px 50px rgba(0,0,0,.5),0 0 0 1px rgba(192,168,112,.2)'; }}
            onMouseOut={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1.5px solid rgba(244,237,224,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
              <svg width="24" height="24" fill="none" stroke="rgba(244,237,224,0.65)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#F4EDE0', marginBottom: 10 }}>{"I'm a Principal"}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, fontWeight: 300, color: 'rgba(244,237,224,.42)', lineHeight: 1.75, marginBottom: 26 }}>View your listed properties, track inspections, and manage your portfolio.</div>
            <div style={{ background: 'transparent', color: '#C0A870', fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 400, letterSpacing: '.2em', textTransform: 'uppercase', padding: 12, borderRadius: 2, border: '1px solid rgba(192,168,112,.45)' }}>Enter Principal Portal</div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div id="mobDrawer" className={drawerOpen ? 'open' : ''}>
        <div onClick={() => setDrawerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(6,15,28,.5)' }}></div>
        <aside style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '84%', maxWidth: 340, background: '#060F1C', borderLeft: '1px solid rgba(192,168,112,.15)', padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: 8, animation: 'slideIn .25s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <svg width="22" height="22" viewBox="0 0 60 60" fill="#C0A870"><path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z"/></svg>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 14, color: '#C0A870', letterSpacing: '.22em' }}>ROKHAVEN</div>
                <div style={{ fontSize: 7, color: '#C0A870', letterSpacing: '.46em', opacity: .55, fontWeight: 200, marginTop: 2 }}>REALTY</div>
              </div>
            </div>
            <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(244,237,224,.4)', fontSize: 28, cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}>×</button>
          </div>
          <Link href="/listings" onClick={() => setDrawerOpen(false)} style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#F4EDE0', padding: '14px 0', borderBottom: '1px solid rgba(192,168,112,.08)' }}>Sales</Link>
          <Link href="/listings?cat=rent" onClick={() => setDrawerOpen(false)} style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#F4EDE0', padding: '14px 0', borderBottom: '1px solid rgba(192,168,112,.08)' }}>Rent</Link>
          <Link href="/listings?cat=shortlet" onClick={() => setDrawerOpen(false)} style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#F4EDE0', padding: '14px 0', borderBottom: '1px solid rgba(192,168,112,.08)' }}>Shortlets</Link>
          <Link href="/contact" onClick={() => setDrawerOpen(false)} style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#F4EDE0', padding: '14px 0', borderBottom: '1px solid rgba(192,168,112,.08)' }}>Contact</Link>
          <Link href="/list-your-property" onClick={() => setDrawerOpen(false)} style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#C0A870', padding: '14px 0' }}>List a Property</Link>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 24, borderTop: '1px solid rgba(192,168,112,.1)' }}>
            <button
              onClick={openLoginFromDrawer}
              style={{ background: 'transparent', border: '1px solid rgba(192,168,112,.35)', color: '#C0A870', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400, letterSpacing: '.16em', textTransform: 'uppercase', padding: 14, borderRadius: 2, cursor: 'pointer', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Login
            </button>
            <Link href="/enquiry" onClick={() => setDrawerOpen(false)} style={{ background: '#C0A870', color: '#060F1C', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: '.16em', textTransform: 'uppercase', padding: 14, borderRadius: 2, textAlign: 'center', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Schedule a Viewing</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
