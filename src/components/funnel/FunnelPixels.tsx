const META = process.env.NEXT_PUBLIC_META_PIXEL_ID || '27169428639340836'; // public Falcon funnel pixel; env var overrides
const TIKTOK = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
const GA4 = process.env.NEXT_PUBLIC_GA4_ID || 'G-ZWX72RMLW4'; // public measurement ID; env var overrides

// Loads whichever pixels have an ID configured and fires the page-view event
// for each. Plain <script> tags (not next/script) so the snippets are in the
// server-rendered HTML, which is what Meta's setup tool and crawlers look for. Plain <script> tags (not
// next/script) so the snippets are in the server-rendered HTML, which is what
// Meta's setup tool and crawlers look for.
export default function FunnelPixels() {
  return (
    <>
      {META && (
        <script dangerouslySetInnerHTML={{ __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META}');fbq('track','PageView');` }} />
      )}
      {TIKTOK && (
        <script dangerouslySetInnerHTML={{ __html: `
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var n="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=n+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${TIKTOK}');ttq.page();ttq.track('ViewContent')}(window,document,'ttq');` }} />
      )}
      {GA4 && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4}`} />
          <script dangerouslySetInnerHTML={{ __html: `
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
gtag('js',new Date());gtag('config','${GA4}');` }} />
        </>
      )}
    </>
  );
}
