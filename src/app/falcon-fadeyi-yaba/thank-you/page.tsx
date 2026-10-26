import type { Metadata } from 'next';
import Image from 'next/image';
import { falcon, whatsappHref } from '@/lib/falcon';
import FunnelHeader from '@/components/funnel/FunnelHeader';
import FunnelFooter from '@/components/funnel/FunnelFooter';
import FunnelPixels from '@/components/funnel/FunnelPixels';
import WhatsAppButton from '@/components/funnel/WhatsAppButton';
import s from '@/components/funnel/funnel.module.css';

export const metadata: Metadata = {
  title: 'Thank you | Falcon, Fadeyi, Yaba | RokHaven Realty',
  robots: { index: false, follow: false },
};

const steps = [
  ['Your documents', 'An advisor sends the Falcon brochure and the title documents on WhatsApp.'],
  ['Your questions', 'We go through the numbers and the title with you, by chat or on a call, whichever suits you. Your lawyer is welcome to review the documents.'],
  ['Your site visit', 'Visit Fadeyi in person, or join a live video walk of the site from wherever you are.'],
];

const recap = [
  ['₦232M', 'Two unfurnished one-bedroom units. Part-furnished is ₦278M.'],
  ['₦9–11M', 'Estimated rent per unit, per year, let monthly to professionals.'],
  ['30%', 'Deposit, with the balance over 6 or 8 months.'],
  ['Title', 'Registered Conveyance and survey plan, with a clean land registry search.'],
  ['12.27', 'Completion, with handover in March 2028. Fadeyi, Yaba, Lagos.'],
];

export default function FalconThankYou() {
  return (
    <div className={s.page}>
      <FunnelPixels />
      <FunnelHeader backTo={{ label: '← Back to Falcon', href: `/${falcon.slug}` }} />
      <main>
        <section className={s['ty-hero']}>
          <div className={s.tick} aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#C0A870" strokeWidth="1.5" /></svg>
          </div>
          <div className={s.label}>Request received</div>
          <h1 className={s['h1-sm']}>Thank you. Your brochure and title documents are <em className={s.gold}>one message away.</em></h1>
          <p className={s.lede} style={{ maxWidth: 620 }}>Your details are with our team. Tap below to send us a WhatsApp message, and an advisor will reply with the Falcon brochure, the title documents, the payment schedule and answers to your questions.</p>
          <WhatsAppButton href={whatsappHref()} label={falcon.cta.primary} />
          <span className={s.small}>WhatsApp opens with your message ready. Just tap send.</span>
        </section>

        <section className={s.ivory}>
          <div className={`${s.wrap} ${s['stack-md']}`}>
            <div className={s['stack-sm']}>
              <div className={s.label}>What happens next</div>
              <h2 className={s.h2}>From documents to portfolio.</h2>
            </div>
            <ol className={`${s.steps} ${s['grid-240']}`}>
              {steps.map(([t, d], i) => (
                <li key={t} className={s.step}><i>{String(i + 1).padStart(2, '0')}</i><strong>{t}</strong><span>{d}</span></li>
              ))}
            </ol>
          </div>
        </section>

        <section className={s.recap}>
          <div className={s['video-col']}>
            <div className={s['recap-img']}>
              <Image src={falcon.images.exteriorFront} alt="Artist’s impression of the Falcon building" fill sizes="340px" loading="lazy" />
            </div>
          </div>
          <div className={s['recap-copy']}>
            <div className={s.label}>Falcon at a glance</div>
            <div className={s.col}>
              {recap.map(([b, d], i) => (
                <div key={b} className={`${s['line-row']} ${i === recap.length - 1 ? s.last : ''}`}><b>{b}</b><span>{d}</span></div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FunnelFooter disclaimer="Prices are early-phase and subject to review. Rent figures are estimates, not guarantees. Images are artist’s impressions." />
    </div>
  );
}
