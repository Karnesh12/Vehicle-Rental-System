import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, Car, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    nicOrPassport: '',
    licenceNumber: '',
    licenceExpiryDate: '',
    address: '',
    city: 'Colombo'
  });

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      await register(payload);
      success('Account created successfully! Welcome to RideFlow.');
      navigate('/customer/dashboard');
    } catch (err) {
      error(err.message || 'Registration failed. Please check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: 'var(--color-slate-50)'
    }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div className="text-center mb-8">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-blue-600)',
            color: 'white',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Car size={28} />
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Create Customer Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join RideFlow for fast vehicle reservations across Sri Lanka</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit}>
            {/* Account Details Section */}
            <div className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
              <h4 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" /> Account & Contact Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    placeholder="e.g. Kasun Jayasuriya"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="kasun@example.lk"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password * (Min 8 chars)</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group md:col-span-2">
                  <label className="form-label">Mobile Phone Number *</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className="form-input"
                    placeholder="+94 77 123 4567"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Verification Details */}
            <div className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
              <h4 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" /> Driving Licence & Identification
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">NIC or Passport Number *</label>
                  <input
                    type="text"
                    name="nicOrPassport"
                    className="form-input"
                    placeholder="199423401234 / N1234567"
                    value={formData.nicOrPassport}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Driving Licence Number *</label>
                  <input
                    type="text"
                    name="licenceNumber"
                    className="form-input"
                    placeholder="e.g. B4592031"
                    value={formData.licenceNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Licence Expiry Date *</label>
                  <input
                    type="date"
                    name="licenceExpiryDate"
                    className="form-input"
                    value={formData.licenceExpiryDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                    Driving licence expiry date (must be a future date, not birthday)
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    placeholder="Colombo, Kandy, Galle..."
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group md:col-span-2">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="Street address, apartment, or suite"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : (
                <>
                  <UserPlus size={18} /> Register & Continue
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--color-blue-600)', fontWeight: 700 }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
