import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword });
      success('Password successfully reset! You can now log in.');
      setCompleted(true);
    } catch (err) {
      error(err.message || 'Failed to reset password. The token may be expired or invalid.');
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
            backgroundColor: 'var(--color-blue-50)',
            color: 'var(--color-blue-600)',
            marginBottom: '1rem'
          }}>
            <Lock size={26} />
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Set New Password</h2>
          <p className="text-xs text-slate-500 mt-1">Provide your token and choose a strong password</p>
        </div>

        <div className="card p-8">
          {completed ? (
            <div className="text-center">
              <CheckCircle2 size={40} className="text-emerald-600 mb-3" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 className="text-lg font-bold text-navy-900 mb-2">Password Updated!</h3>
              <p className="text-xs text-slate-500 mb-6">
                Your password has been changed securely. You can now access your account.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Reset Token</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste token here"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (Min 8 chars)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
