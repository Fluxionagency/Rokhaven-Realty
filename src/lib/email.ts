import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'RokHaven Realty <noreply@rokhaven.com>'
const ADMIN_EMAIL = 'info@rokhaven.com'

export async function sendAdminInspectionAlert(data: {
  name: string; email: string; phone: string;
  propertyName: string; date: string; time: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Inspection Booking — ${data.propertyName}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#060F1C;color:#f4ede0;padding:40px 32px;">
        <div style="margin-bottom:20px;">
          <span style="font-size:20px;font-weight:700;letter-spacing:2px;color:#C0A870;">ROKHAVEN</span>
          <span style="font-size:10px;letter-spacing:3px;color:rgba(192,168,112,.5);margin-left:8px;">REALTY</span>
        </div>
        <h2 style="font-size:20px;font-weight:400;margin:0 0 20px;color:#C0A870;">New Inspection Booking</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">PROPERTY</td><td style="padding:8px 0;color:#f4ede0;">${data.propertyName}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">NAME</td><td style="padding:8px 0;color:#f4ede0;">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">EMAIL</td><td style="padding:8px 0;color:#f4ede0;">${data.email}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">PHONE</td><td style="padding:8px 0;color:#f4ede0;">${data.phone}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">DATE</td><td style="padding:8px 0;color:#f4ede0;">${data.date}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">TIME</td><td style="padding:8px 0;color:#f4ede0;">${data.time || 'Any time'}</td></tr>
        </table>
        <div style="margin-top:24px;">
          <a href="https://rokhaven.com/admin" style="background:#C0A870;color:#060F1C;padding:10px 20px;text-decoration:none;font-size:13px;letter-spacing:1px;">VIEW IN ADMIN →</a>
        </div>
      </div>
    `,
  })
}

export async function sendAdminEnquiryAlert(data: {
  name: string; email: string; phone: string;
  subject?: string; message?: string; propertyName?: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Enquiry — ${data.subject || data.propertyName || 'General'}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#060F1C;color:#f4ede0;padding:40px 32px;">
        <div style="margin-bottom:20px;">
          <span style="font-size:20px;font-weight:700;letter-spacing:2px;color:#C0A870;">ROKHAVEN</span>
          <span style="font-size:10px;letter-spacing:3px;color:rgba(192,168,112,.5);margin-left:8px;">REALTY</span>
        </div>
        <h2 style="font-size:20px;font-weight:400;margin:0 0 20px;color:#C0A870;">New Enquiry Received</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">NAME</td><td style="padding:8px 0;color:#f4ede0;">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">EMAIL</td><td style="padding:8px 0;color:#f4ede0;">${data.email}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">PHONE</td><td style="padding:8px 0;color:#f4ede0;">${data.phone}</td></tr>
          ${data.subject ? `<tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">SUBJECT</td><td style="padding:8px 0;color:#f4ede0;">${data.subject}</td></tr>` : ''}
          ${data.propertyName ? `<tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">PROPERTY</td><td style="padding:8px 0;color:#f4ede0;">${data.propertyName}</td></tr>` : ''}
          ${data.message ? `<tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">MESSAGE</td><td style="padding:8px 0;color:#f4ede0;">${data.message}</td></tr>` : ''}
        </table>
        <div style="margin-top:24px;">
          <a href="https://rokhaven.com/admin" style="background:#C0A870;color:#060F1C;padding:10px 20px;text-decoration:none;font-size:13px;letter-spacing:1px;">VIEW IN ADMIN →</a>
        </div>
      </div>
    `,
  })
}

export async function sendAdminPropertyAlert(data: {
  name: string; email: string; phone: string;
  propertyType: string; location: string; listingType: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Property Listing Request — ${data.propertyType}, ${data.location}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#060F1C;color:#f4ede0;padding:40px 32px;">
        <div style="margin-bottom:20px;">
          <span style="font-size:20px;font-weight:700;letter-spacing:2px;color:#C0A870;">ROKHAVEN</span>
          <span style="font-size:10px;letter-spacing:3px;color:rgba(192,168,112,.5);margin-left:8px;">REALTY</span>
        </div>
        <h2 style="font-size:20px;font-weight:400;margin:0 0 20px;color:#C0A870;">New Property Listing Request</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">NAME</td><td style="padding:8px 0;color:#f4ede0;">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">EMAIL</td><td style="padding:8px 0;color:#f4ede0;">${data.email}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">PHONE</td><td style="padding:8px 0;color:#f4ede0;">${data.phone}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">PROPERTY</td><td style="padding:8px 0;color:#f4ede0;">${data.propertyType}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">LOCATION</td><td style="padding:8px 0;color:#f4ede0;">${data.location}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(244,237,224,.5);font-size:12px;letter-spacing:1px;">LISTING TYPE</td><td style="padding:8px 0;color:#f4ede0;">${data.listingType}</td></tr>
        </table>
        <div style="margin-top:24px;">
          <a href="https://rokhaven.com/admin" style="background:#C0A870;color:#060F1C;padding:10px 20px;text-decoration:none;font-size:13px;letter-spacing:1px;">VIEW IN ADMIN →</a>
        </div>
      </div>
    `,
  })
}

export async function sendClientWelcome(to: string, name: string, password: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to RokHaven — Your Client Portal Access',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#060F1C;color:#f4ede0;padding:40px 32px;">
        <div style="margin-bottom:28px;">
          <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#C0A870;">ROKHAVEN</span>
          <span style="font-size:11px;letter-spacing:3px;color:rgba(192,168,112,.5);margin-left:8px;">REALTY</span>
        </div>
        <h1 style="font-size:24px;font-weight:400;margin:0 0 12px;">Welcome, ${name.split(' ')[0]}.</h1>
        <p style="color:rgba(244,237,224,.7);line-height:1.7;margin:0 0 24px;">
          We've received your enquiry and created a secure client portal for you to track your inspections and enquiries with RokHaven Realty.
        </p>
        <div style="background:rgba(192,168,112,.08);border:1px solid rgba(192,168,112,.2);border-radius:8px;padding:20px 24px;margin-bottom:24px;">
          <div style="margin-bottom:12px;">
            <span style="font-size:11px;letter-spacing:1px;color:rgba(192,168,112,.6);">LOGIN URL</span><br/>
            <a href="https://rokhaven.com/auth/client-login" style="color:#C0A870;">rokhaven.com/auth/client-login</a>
          </div>
          <div style="margin-bottom:12px;">
            <span style="font-size:11px;letter-spacing:1px;color:rgba(192,168,112,.6);">EMAIL</span><br/>
            <span style="color:#f4ede0;">${to}</span>
          </div>
          <div>
            <span style="font-size:11px;letter-spacing:1px;color:rgba(192,168,112,.6);">TEMPORARY PASSWORD</span><br/>
            <span style="color:#f4ede0;font-family:monospace;font-size:16px;">${password}</span>
          </div>
        </div>
        <p style="color:rgba(244,237,224,.5);font-size:13px;line-height:1.6;margin:0 0 24px;">
          Please change your password after your first login. If you did not make this enquiry or would like your account removed, reply to this email and we will take care of it immediately.
        </p>
        <p style="color:rgba(244,237,224,.4);font-size:12px;margin:0;">
          © ${new Date().getFullYear()} RokHaven Realty Ltd. · <a href="https://rokhaven.com/contact" style="color:rgba(192,168,112,.5);">Contact Us</a>
        </p>
      </div>
    `,
  })
}

export async function sendDownloadNotification(to: string[], data: {
  title: string; description?: string | null; category?: string | null;
}) {
  if (!to.length) return;
  const from = 'RokHaven Realty <info@rokhaven.com>';
  const subject = `New Resource Available — ${data.title}`;
  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#060F1C;color:#f4ede0;padding:40px 32px;">
      <div style="margin-bottom:28px;">
        <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#C0A870;">ROKHAVEN</span>
        <span style="font-size:11px;letter-spacing:3px;color:rgba(192,168,112,.5);margin-left:8px;">REALTY</span>
      </div>
      <h1 style="font-size:22px;font-weight:400;margin:0 0 12px;">New Resource Available</h1>
      <p style="color:rgba(244,237,224,.65);line-height:1.7;margin:0 0 24px;">
        A new resource has just been added to your RokHaven client portal.
      </p>
      <div style="background:rgba(192,168,112,.08);border:1px solid rgba(192,168,112,.2);border-radius:4px;padding:20px 24px;margin-bottom:28px;">
        ${data.category ? `<div style="font-size:10px;letter-spacing:0.15em;color:rgba(192,168,112,.6);text-transform:uppercase;margin-bottom:8px;">${data.category}</div>` : ''}
        <div style="font-size:17px;font-weight:500;color:#f4ede0;margin-bottom:8px;">${data.title}</div>
        ${data.description ? `<div style="font-size:13px;color:rgba(244,237,224,.55);line-height:1.6;">${data.description}</div>` : ''}
      </div>
      <a href="https://rokhaven.com/client-portal" style="display:inline-block;background:#C0A870;color:#060F1C;padding:12px 24px;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border-radius:3px;">
        Download Now →
      </a>
      <p style="color:rgba(244,237,224,.3);font-size:11px;margin-top:32px;line-height:1.6;">
        Log in to your client portal and navigate to the <strong style="color:rgba(244,237,224,.5);">Downloads</strong> section to access this resource.<br/>
        © ${new Date().getFullYear()} RokHaven Realty Ltd. · <a href="https://rokhaven.com/contact" style="color:rgba(192,168,112,.4);">Contact Us</a>
      </p>
    </div>
  `;
  // Send individually so each client sees their own email in the To: field
  await resend.batch.send(to.map(email => ({ from, to: email, subject, html })));
}

export async function sendPrincipalWelcome(to: string, name: string, password: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to RokHaven — Your Principal Portal Access',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#060F1C;color:#f4ede0;padding:40px 32px;">
        <div style="margin-bottom:28px;">
          <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#C0A870;">ROKHAVEN</span>
          <span style="font-size:11px;letter-spacing:3px;color:rgba(192,168,112,.5);margin-left:8px;">REALTY</span>
        </div>
        <h1 style="font-size:24px;font-weight:400;margin:0 0 12px;">Welcome, ${name.split(' ')[0]}.</h1>
        <p style="color:rgba(244,237,224,.7);line-height:1.7;margin:0 0 24px;">
          We've received your property listing request. A principal portal has been created for you to track your submissions and communicate directly with our team.
        </p>
        <div style="background:rgba(192,168,112,.08);border:1px solid rgba(192,168,112,.2);border-radius:8px;padding:20px 24px;margin-bottom:24px;">
          <div style="margin-bottom:12px;">
            <span style="font-size:11px;letter-spacing:1px;color:rgba(192,168,112,.6);">LOGIN URL</span><br/>
            <a href="https://rokhaven.com/auth/client-login" style="color:#C0A870;">rokhaven.com/auth/client-login</a>
          </div>
          <div style="margin-bottom:12px;">
            <span style="font-size:11px;letter-spacing:1px;color:rgba(192,168,112,.6);">EMAIL</span><br/>
            <span style="color:#f4ede0;">${to}</span>
          </div>
          <div>
            <span style="font-size:11px;letter-spacing:1px;color:rgba(192,168,112,.6);">TEMPORARY PASSWORD</span><br/>
            <span style="color:#f4ede0;font-family:monospace;font-size:16px;">${password}</span>
          </div>
        </div>
        <p style="color:rgba(244,237,224,.5);font-size:13px;line-height:1.6;margin:0 0 24px;">
          Please change your password after your first login. If you did not submit this request or would like your account removed, reply to this email and we will take care of it immediately.
        </p>
        <p style="color:rgba(244,237,224,.4);font-size:12px;margin:0;">
          © ${new Date().getFullYear()} RokHaven Realty Ltd. · <a href="https://rokhaven.com/contact" style="color:rgba(192,168,112,.5);">Contact Us</a>
        </p>
      </div>
    `,
  })
}
