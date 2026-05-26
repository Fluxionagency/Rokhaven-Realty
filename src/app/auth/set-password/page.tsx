'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setSubmitting(true);
    const res = await fetch('/api/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Something went wrong.'); setSubmitting(false); return; }
    setDone(true);
    setTimeout(() => router.push('/auth/client-login'), 2500);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060F1C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: '#C0A870', fontFamily: 'Georgia,serif' }}>ROKHAVEN</div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(192,168,112,.5)', fontFamily: 'Georgia,serif' }}>REALTY</div>
        </div>

        {!token ? (
          <p style={{ color: 'rgba(244,237,224,.5)', textAlign: 'center' }}>Invalid link. Please request a new one.</p>
        ) : done ? (
          <div style={{ textAlign: 'center', color: '#C0A870', fontFamily: 'Georgia,serif' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
            <p>Password set successfully. Redirecting to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 style={{ color: '#f4ede0', fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: 24, marginBottom: 8 }}>Set Your Password</h1>
            <p style={{ color: 'rgba(244,237,224,.5)', fontSize: 14, marginBottom: 28 }}>Choose a strong password for your RokHaven account.</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: 1, color: 'rgba(192,168,112,.7)', marginBottom: 6 }}>NEW PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(192,168,112,.2)', color: '#f4ede0', padding: '12px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: 1, color: 'rgba(192,168,112,.7)', marginBottom: 6 }}>CONFIRM PASSWORD</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(192,168,112,.2)', color: '#f4ede0', padding: '12px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {error && <p style={{ color: '#e57373', fontSize: 13, marginBottom: 16 }}>{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', background: '#C0A870', color: '#060F1C', border: 'none', padding: '14px', fontSize: 14, letterSpacing: 1, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Georgia,serif' }}
            >
              {submitting ? 'Saving…' : 'SET PASSWORD →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ background: '#060F1C', minHeight: '100vh' }} />}>
      <SetPasswordContent />
    </Suspense>
  );
}
