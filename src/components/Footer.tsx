import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
              <svg width="38" height="38" viewBox="0 0 60 60" fill="#C0A870">
                <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z"/>
              </svg>
              <div>
                <div className="wm" style={{ fontSize: 18 }}>ROKHAVEN</div>
                <div className="sm" style={{ fontSize: 8 }}>REALTY</div>
              </div>
            </div>
            <p className="foot-tagline">Where Legacy Lives.</p>
            <div className="sicons" style={{ marginTop: 28 }}>
              <a href="https://www.instagram.com/rokhavenrealtyng/" className="sicon" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://www.tiktok.com/@rokhaven" className="sicon" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.93a8.19 8.19 0 004.79 1.52V7.01a4.85 4.85 0 01-1.02-.32z"/></svg>
              </a>
              <a href="https://www.youtube.com/@RokHaven" className="sicon" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1a1209"/></svg>
              </a>
            </div>
          </div>
          <div>
            <div className="fcol-title">Properties</div>
            <ul className="flinks">
              <li><Link href="/listings">Properties for Sale</Link></li>
              <li><Link href="/listings?cat=rent">Properties for Rent</Link></li>
              <li><Link href="/listings?cat=shortlet">Short-let Properties</Link></li>
              <li><Link href="/listings">New Developments</Link></li>
              <li><Link href="/listings">Featured Listings</Link></li>
            </ul>
          </div>
          <div>
            <div className="fcol-title">Company</div>
            <ul className="flinks">
              <li><Link href="/about">About RokHaven</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/list-your-property">List Your Property</Link></li>
              <li><Link href="/enquiry">Schedule a Viewing</Link></li>
              <li><Link href="/admin">Admin Portal</Link></li>
            </ul>
          </div>
          <div>
            <div className="fcol-title">Contact</div>
            <ul className="flinks">
              <li><a href="tel:+2349167619009">+234 916 761 9009</a></li>
              <li><a href="mailto:info@rokhaven.com">info@rokhaven.com</a></li>
              <li style={{ color: 'rgba(244,237,224,.4)', fontSize: 13, fontWeight: 300, lineHeight: 1.8 }}>
                3 Banana Island Road,<br/>
                Ikoyi, Lagos, Nigeria.
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-btm">
          <p>© {new Date().getFullYear()} RokHaven Realty. All rights reserved.</p>
          <p style={{ display: 'flex', gap: 24 }}>
            <Link href="#" style={{ color: 'rgba(244,237,224,.3)', fontSize: 11, transition: 'color .2s' }}>Privacy Policy</Link>
            <Link href="#" style={{ color: 'rgba(244,237,224,.3)', fontSize: 11, transition: 'color .2s' }}>Terms of Use</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
