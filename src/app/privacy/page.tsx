import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — RokHaven Realty',
  description: 'How RokHaven Realty collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px 80px' }}>
        <p className="slbl">Legal</p>
        <h1 className="sec-h" style={{ marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(244,237,224,.45)', marginBottom: 56, fontFamily: 'var(--fb)', fontSize: 14 }}>Last updated: May 2025</p>

        <Section title="1. Who We Are">
          <p>
            RokHaven Realty (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a luxury real estate company based in Lagos, Nigeria.
            Our website is <a href="https://www.rokhaven.com" className="link-gold">www.rokhaven.com</a>.
            This Privacy Policy explains how we collect, use, and safeguard your personal information when you interact
            with our website, contact us, or message us on social media.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect information you voluntarily provide, including:</p>
          <ul>
            <li><strong style={{ color: 'var(--ivory)' }}>Contact details</strong> — name, email address, phone number</li>
            <li><strong style={{ color: 'var(--ivory)' }}>Enquiry information</strong> — property preferences, budget, intended use</li>
            <li><strong style={{ color: 'var(--ivory)' }}>Inspection bookings</strong> — preferred dates, times, and property of interest</li>
            <li><strong style={{ color: 'var(--ivory)' }}>Social media messages</strong> — if you send us a Direct Message on Instagram, we receive and store the message content and your public profile name in order to respond to you</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            We do not collect sensitive personal data such as financial account details, national identification
            numbers, or health information through this website.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use collected information to:</p>
          <ul>
            <li>Respond to your property enquiries and schedule property viewings</li>
            <li>Send you property listings or updates that match your stated preferences (only with your consent)</li>
            <li>Notify our agents about new leads so they can follow up promptly</li>
            <li>Improve our services and website experience</li>
            <li>Comply with applicable Nigerian law and regulatory obligations</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            We do not sell, rent, or trade your personal information to third parties.
          </p>
        </Section>

        <Section title="4. Social Media Integrations (Instagram & WhatsApp)">
          <p>
            Our website and internal tools integrate with Meta&rsquo;s platforms (Instagram and WhatsApp Business API)
            to receive and respond to messages from clients. When you message us on Instagram Direct:
          </p>
          <ul>
            <li>Your Instagram display name and message text are received via Meta&rsquo;s Messenger API</li>
            <li>This information is stored securely in our internal CRM as a lead record</li>
            <li>An agent will use this information to respond to your enquiry</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Our use of information received from Meta APIs complies with{' '}
            <a href="https://developers.facebook.com/policy/" className="link-gold" target="_blank" rel="noopener noreferrer">
              Meta&rsquo;s Platform Terms
            </a>{' '}
            and{' '}
            <a href="https://developers.facebook.com/docs/messenger-platform/policy/policy-overview" className="link-gold" target="_blank" rel="noopener noreferrer">
              Messenger Platform Policies
            </a>.
            We only use message data to respond to your enquiry and do not use it for advertising profiling.
          </p>
        </Section>

        <Section title="5. Data Storage and Security">
          <p>
            Your data is stored on secure cloud infrastructure. We implement reasonable technical and organisational
            measures to protect your personal information from unauthorised access, disclosure, or loss.
            Access to client data is restricted to authorised RokHaven Realty agents only.
          </p>
          <p style={{ marginTop: 12 }}>
            We retain enquiry and lead data for up to 2 years from the date of last contact, after which it is
            deleted unless we have an ongoing business relationship with you.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>You have the right to:</p>
          <ul>
            <li>Request a copy of the personal information we hold about you</li>
            <li>Ask us to correct inaccurate information</li>
            <li>Ask us to delete your information (subject to any legal obligations)</li>
            <li>Withdraw consent for marketing communications at any time</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:info@rokhaven.com" className="link-gold">info@rokhaven.com</a>.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            Our website may use essential cookies required for authentication and session management.
            We do not use tracking or advertising cookies. You can disable cookies in your browser settings,
            though this may affect your ability to use certain features of the site.
          </p>
        </Section>

        <Section title="8. Third-Party Services">
          <p>We use the following third-party services to operate our website and business:</p>
          <ul>
            <li><strong style={{ color: 'var(--ivory)' }}>Meta (Facebook / Instagram / WhatsApp)</strong> — messaging and social integrations</li>
            <li><strong style={{ color: 'var(--ivory)' }}>Google</strong> — calendar integrations for scheduling</li>
            <li><strong style={{ color: 'var(--ivory)' }}>Vercel</strong> — website hosting and deployment</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Each of these services has its own privacy policy. We encourage you to review them.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this page
            reflects the most recent revision. Continued use of our website after changes constitutes acceptance
            of the updated policy.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p>
            If you have any questions about this Privacy Policy or how we handle your data, please contact us:
          </p>
          <ul>
            <li><strong style={{ color: 'var(--ivory)' }}>Email:</strong>{' '}<a href="mailto:info@rokhaven.com" className="link-gold">info@rokhaven.com</a></li>
            <li><strong style={{ color: 'var(--ivory)' }}>Website:</strong>{' '}<a href="https://www.rokhaven.com/contact" className="link-gold">www.rokhaven.com/contact</a></li>
            <li><strong style={{ color: 'var(--ivory)' }}>Address:</strong> Lagos, Nigeria</li>
          </ul>
        </Section>
      </main>
      <style>{`
        main p, main li {
          font-family: var(--fb);
          font-size: 15px;
          font-weight: 300;
          color: rgba(244,237,224,.72);
          line-height: 1.8;
        }
        main ul {
          padding-left: 20px;
          margin-top: 8px;
        }
        main li {
          margin-bottom: 6px;
        }
      `}</style>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid rgba(192,168,112,.08)' }}>
      <h2 style={{
        fontFamily: 'var(--fd)',
        fontSize: '1.25rem',
        color: 'var(--ivory)',
        marginBottom: 16,
        fontWeight: 400,
      }}>{title}</h2>
      {children}
    </section>
  )
}
