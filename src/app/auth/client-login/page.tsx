'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Nav from '@/components/Nav';
import styles from './page.module.css';

export default function ClientLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await signIn('client-credentials', {
      email,
      password,
      role: 'CLIENT',
      callbackUrl: '/client-portal',
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  const handleOtpInput = (value: string, index: number) => {
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <Nav backHref="/" backLabel="← Back to Homepage" />
      <div className={styles.page}>
        <div className={styles.card}>
          {/* Card Logo */}
          <div className={styles.cardLogo}>
            <svg width="22" height="22" viewBox="0 0 60 60" fill="#C0A870">
              <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
            </svg>
            <div>
              <div className={styles.cardLogoWm}>ROKHAVEN</div>
              <div className={styles.cardLogoSm}>REALTY</div>
            </div>
          </div>

          <div className={styles.cardLbl}>Client Portal</div>
          <h1 className={styles.cardH}>Welcome Back</h1>
          <p className={styles.cardSub}>
            Sign in to access your saved properties and track your inspections.
          </p>

          {/* Email/Password Form */}
          {!showOtp && (
            <div>
              {error && <div className={styles.errorMsg}>{error}</div>}

              <div className={styles.fRow}>
                <label className={styles.fLbl}>Email Address</label>
                <div className={styles.fWrap}>
                  <input
                    className={styles.fIn}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.fRow}>
                <label className={styles.fLbl}>Password</label>
                <div className={styles.fWrap}>
                  <input
                    className={styles.fIn}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                    autoComplete="current-password"
                  />
                  <button
                    className={styles.fEye}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button
                className={styles.btnGold}
                onClick={handleSignIn}
                disabled={loading}
              >
                {loading ? 'Signing In…' : 'Sign In →'}
              </button>

              <a className={styles.forgot} href="#">
                Forgot your password?
              </a>

              <div className={styles.divOr}>
                <span>or</span>
              </div>

              <button
                className={styles.btnOtp}
                type="button"
                onClick={() => {
                  setShowOtp(true);
                  setTimeout(() => otpRefs.current[0]?.focus(), 50);
                }}
              >
                Login with OTP →
              </button>
            </div>
          )}

          {/* OTP Panel */}
          {showOtp && (
            <div className={`${styles.otpPanel} ${styles.show}`}>
              <p className={styles.otpPanelSub}>
                We sent a 6-digit code to your registered phone number.
              </p>
              <div className={styles.otpGrid}>
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    className={styles.otpBox}
                    maxLength={1}
                    type="text"
                    inputMode="numeric"
                    value={val}
                    onChange={(e) => handleOtpInput(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  />
                ))}
              </div>
              <button className={styles.btnGold} type="button">
                Verify &amp; Sign In →
              </button>
              <div className={styles.otpResend}>
                Didn&apos;t receive it?{' '}
                <span onClick={() => alert('OTP resent to your registered phone number.')}>
                  Resend code
                </span>
              </div>
              <div>
                <button
                  className={styles.backToEmail}
                  type="button"
                  onClick={() => setShowOtp(false)}
                >
                  ← Use email &amp; password instead
                </button>
              </div>
            </div>
          )}

          <div className={styles.cardRule} />
          <div className={styles.cardFoot}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register">Create your profile →</Link>
          </div>
        </div>

        <div className={styles.belowCard}>
          Are you a Principal?{' '}
          <Link href="/auth/principal-login">Principal Login →</Link>
        </div>
      </div>
    </>
  );
}
