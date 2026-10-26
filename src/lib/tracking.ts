// Thin wrappers over the Meta, TikTok and GA4 browser globals. Each call is a
// no-op when the matching pixel is not loaded (see components/funnel/FunnelPixels).
type Win = Window & {
  fbq?: (...a: unknown[]) => void;
  ttq?: { track: (e: string, p?: Record<string, unknown>) => void };
  gtag?: (...a: unknown[]) => void;
};

const w = () => (typeof window === 'undefined' ? undefined : (window as Win));

export function trackLead(productName: string, value: number) {
  const win = w();
  if (!win) return;
  const params = { content_name: productName, value, currency: 'NGN' };
  win.fbq?.('track', 'Lead', params);
  win.ttq?.track('SubmitForm', params);
  win.gtag?.('event', 'generate_lead', params);
}

export function trackWhatsAppClick() {
  const win = w();
  if (!win) return;
  win.fbq?.('track', 'Contact');
  win.ttq?.track('Contact');
  win.gtag?.('event', 'whatsapp_click');
}

export function trackVideoStart() {
  const win = w();
  if (!win) return;
  win.fbq?.('track', 'ViewContent', { video: 'ground_up' });
  win.gtag?.('event', 'video_start', { video: 'ground_up' });
}
