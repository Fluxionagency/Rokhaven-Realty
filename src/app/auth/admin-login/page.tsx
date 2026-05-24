'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Nav from '@/components/Nav';
import styles from '../principal-login/page.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      role: 'ADMIN',
      callbackUrl: '/admin',
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError('Invalid credentials. Admin access only.');
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <>
      <Nav backHref="/" backLabel="← Back to Homepage" />
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.cardLogo}>
            <svg width="22" height="22" viewBox="0 0 60 60" fill="#C0A870">
              <path d="M 5,60 L 5,35 A 25,25 0 0,1 55,35 L 55,60 L 44,60 L 44,35 A 14,14 0 0,0 16,35 L 16,60 Z" />
            </svg>
            <div>
              <div className={styles.cardLogoWm}>ROKHAVEN</div>
              <div className={styles.cardLogoSm}>REALTY</div>
            </div>
          </div>

          <div className={styles.cardLbl}>Admin Dashboard</div>
          <h1 className={styles.cardH}>Admin Sign In</h1>
          <p className={styles.cardSub}>Restricted access. Authorised personnel only.</p>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.fRow}>
            <label className={styles.fLbl}>Email Address</label>
            <div className={styles.fWrap}>
              <input
                className={styles.fIn}
                type="email"
                placeholder="admin@rokhaven.com"
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

          <button className={styles.btnGold} onClick={handleSignIn} disabled={loading}>
            {loading ? 'Signing In…' : 'Sign In →'}
          </button>

          <div className={styles.cardRule} />
          <div className={styles.cardFoot}>
            Not an admin?{' '}
            <a href="/">Return to homepage →</a>
          </div>
        </div>
      </div>
    </>
  );
}
