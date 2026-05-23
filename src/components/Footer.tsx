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
              <a href="#" className="sicon" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="sicon" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" className="sicon" aria-label="X / Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(244,237,224,.42)"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              </a>
              <a href="#" className="sicon" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
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
            </ul>
          </div>
          <div>
            <div className="fcol-title">Contact</div>
            <ul className="flinks">
              <li><a href="tel:+2348001234567">+234 800 123 4567</a></li>
              <li><a href="mailto:hello@rokhaven.ng">hello@rokhaven.ng</a></li>
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
