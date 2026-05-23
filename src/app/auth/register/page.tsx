'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import styles from './page.module.css';

function getPasswordStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: 'Enter a password' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[0-9!@#$]/.test(password)) score++;
  if (score === 1) return { score: 1, label: 'Weak' };
  if (score === 2) return { score: 2, label: 'Fair' };
  if (score >= 3) return { score: 3, label: 'Strong' };
  return { score: 0, label: 'Enter a password' };
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const strength = getPasswordStrength(password);

  const getBarClass = (barIndex: number) => {
    if (strength.score === 0) return styles.pwBar;
    if (strength.score === 1 && barIndex === 0) return `${styles.pwBar} ${styles.weak}`;
    if (strength.score === 2 && barIndex <= 1) return `${styles.pwBar} ${styles.fair}`;
    if (strength.score === 3) return `${styles.pwBar} ${styles.strong}`;
    return styles.pwBar;
  };

  const handleCreateAccount = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          phone: `+234${phone.replace(/^0/, '')}`,
          password,
          role: 'CLIENT',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => {
        router.push('/auth/client-login');
      }, 1500);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
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

          <div className={styles.cardLbl}>New Client</div>
          <h1 className={styles.cardH}>Create Your Profile</h1>
          <p className={styles.cardSub}>Join RokHaven and start your property journey.</p>

          {error && <div className={styles.errorMsg}>{error}</div>}
          {success && <div className={styles.successMsg}>{success}</div>}

          {/* Full Name */}
          <div className={styles.fRow}>
            <label className={styles.fLbl}>Full Name</label>
            <div className={styles.fWrap}>
              <input
                className={styles.fIn}
                type="text"
                placeholder="Adaeze Okonkwo"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.fRow}>
            <label className={styles.fLbl}>Email Address</label>
            <div className={styles.fWrap}>
              <input
                className={styles.fIn}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Phone */}
          <div className={styles.fRow}>
            <label className={styles.fLbl}>Phone Number</label>
            <div className={styles.phRow}>
              <span className={styles.phFlag}>🇳🇬 +234</span>
              <input
                className={styles.fIn}
                type="tel"
                placeholder="080 — — — — —"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.fRow}>
            <label className={styles.fLbl}>Password</label>
            <div className={styles.fWrap}>
              <input
                className={styles.fIn}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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
            <div className={styles.pwStr}>
              <div className={getBarClass(0)} />
              <div className={getBarClass(1)} />
              <div className={getBarClass(2)} />
            </div>
            <div className={styles.pwTxt}>{strength.label}</div>
          </div>

          {/* Confirm Password */}
          <div className={styles.fRow}>
            <label className={styles.fLbl}>Confirm Password</label>
            <div className={styles.fWrap}>
              <input
                className={styles.fIn}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                className={styles.fEye}
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            className={styles.btnGold}
            onClick={handleCreateAccount}
            disabled={loading}
          >
            {loading ? 'Creating Account…' : 'Create Account →'}
          </button>

          <p className={styles.terms}>
            By creating an account, you agree to our{' '}
            <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </p>

          <div className={styles.cardRule} />
          <div className={styles.cardFoot}>
            Already have an account?{' '}
            <Link href="/auth/client-login">Sign In →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
