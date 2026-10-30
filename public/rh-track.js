// Meta pixel + GA4 for the static 3D pages (same IDs as the Next.js funnel pages).
(function () {
  var META = '27169428639340836', GA4 = 'G-ZWX72RMLW4';
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', META); fbq('track', 'PageView');
  var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4; document.head.appendChild(g);
  window.dataLayer = window.dataLayer || []; window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  gtag('js', new Date()); gtag('config', GA4);
  // "₦232M" → 232000000, "$2.6m" → 2600000 (first number in the string)
  function amount(p) {
    var m = String(p || '').replace(/,/g, '').match(/([\d.]+)\s*([kmb])?/i); if (!m) return undefined;
    var n = parseFloat(m[1]), k = (m[2] || '').toLowerCase();
    return n * (k === 'b' ? 1e9 : k === 'm' ? 1e6 : k === 'k' ? 1e3 : 1);
  }
  window.rhTrack = {
    lead: function (name, price) {
      var p = { content_name: name };
      var v = amount(price); if (v) { p.value = v; p.currency = /\$/.test(price) ? 'USD' : 'NGN'; }
      fbq('track', 'Lead', p); gtag('event', 'generate_lead', p);
    },
    contact: function () { fbq('track', 'Contact'); gtag('event', 'whatsapp_click'); }
  };
})();
