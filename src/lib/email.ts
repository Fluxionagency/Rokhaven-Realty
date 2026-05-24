import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'RokHaven Realty <noreply@rokhaven.com>'

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
