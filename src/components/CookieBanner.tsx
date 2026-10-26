'use client';
import { useState, useEffect } from 'react';
import styles from './CookieBanner.module.css';
import { META_PIXEL_ID, TIKTOK_PIXEL_ID, isMetaPixelConfigured, isTikTokPixelConfigured } from '@/lib/pixel-config';

function loadMetaPixel(id: string) {
  if (typeof window === 'undefined') return;
  (function (f: Window, b: Document, e: string, v: string) {
    if ((f as any).fbq) return;
    const n: any = (f as any).fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!(f as any)._fbq) (f as any)._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true; t.src = v;
    b.getElementsByTagName(e)[0].parentNode!.insertBefore(t, b.getElementsByTagName(e)[0]);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  (window as any).fbq('init', id);
  (window as any).fbq('track', 'PageView');
}

function loadTikTokPixel(id: string) {
  if (typeof window === 'undefined') return;
  (function (w: any, d: Document, t: string) {
    w.TiktokAnalyticsObject = t;
    const ttq = (w[t] = w[t] || []);
    ttq.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
    ttq.setAndDefer = function (obj: any, method: string) { obj[method] = function () { obj.push([method].concat(Array.prototype.slice.call(arguments, 0))); }; };
    ttq.methods.forEach((m: string) => ttq.setAndDefer(ttq, m));
    ttq.instance = function (t: string) { const i = ttq._i[t] || []; i._u = ttq._u; return i; };
    ttq.load = function (e: string, n: any) {
      const i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i;
      ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
      ttq._o = ttq._o || {}; ttq._o[e] = n || {};
      const s = d.createElement('script') as HTMLScriptElement;
      s.type = 'text/javascript'; s.async = true; s.src = i + '?sdkid=' + e + '&lib=' + t;
      d.getElementsByTagName('script')[0].parentNode!.insertBefore(s, d.getElementsByTagName('script')[0]);
    };
    ttq.load(id); ttq.page();
  })(window, document, 'ttq');
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('rh_cookie_consent');
      if (!consent) {
        setVisible(true);
      } else if (consent === 'accepted') {
        if (isMetaPixelConfigured()) loadMetaPixel(META_PIXEL_ID);
        if (isTikTokPixelConfigured()) loadTikTokPixel(TIKTOK_PIXEL_ID);
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  function accept() {
    try { localStorage.setItem('rh_cookie_consent', 'accepted'); } catch {}
    if (isMetaPixelConfigured()) loadMetaPixel(META_PIXEL_ID);
    if (isTikTokPixelConfigured()) loadTikTokPixel(TIKTOK_PIXEL_ID);
    setVisible(false);
  }

  function reject() {
    try { localStorage.setItem('rh_cookie_consent', 'rejected'); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie consent">
      <p className={styles.text}>
        We use cookies and tracking pixels to improve your experience and measure the reach of our listings.
        Read our <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.
      </p>
      <div className={styles.btns}>
        <button className={styles.accept} onClick={accept}>Accept</button>
        <button className={styles.reject} onClick={reject}>Reject</button>
      </div>
    </div>
  );
}
