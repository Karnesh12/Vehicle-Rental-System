import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { KeyRound, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      const generatedToken = res.data?.token;
      setToken(generatedToken);
      success('Password reset token generated successfully.');
    } catch (err) {
      error(err.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div className="text-center mb-8">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-amber-50)',
            color: 'var(--color-amber-600)',
            marginBottom: '1rem'
          }}>
            <KeyRound size={26} />
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your registered email address to receive a secure token</p>
        </div>

        <div className="card p-8">
          {token ? (
            <div className="text-center">
              <div style={{
                display: 'inline-flex',
                padding: '0.75rem',
                backgroundColor: 'var(--color-emerald-50)',
                color: 'var(--color-emerald-600)',
                borderRadius: '50%',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">Reset Token Generated</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                For security demonstration, here is your one-time password reset token:
              </p>

              <div style={{
                background: 'var(--color-slate-100)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                wordBreak: 'break-all',
                color: 'var(--color-navy-900)',
                marginBottom: '1.5rem',
                userSelect: 'all'
              }}>
                {token}
              </div>

              <Link
                to={`/reset-password?token=${token}`}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Proceed to Set New Password <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-6">
                <label className="form-label">Account Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. customer@rideflow.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Generate Reset Token'}
              </button>

              <div className="mt-4 text-center">
                <Link to="/login" style={{ fontSize: '0.8rem', color: 'var(--color-blue-600)', fontWeight: 600 }}>
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
