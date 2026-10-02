import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Phone, MapPin, Save, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerProfilePage() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    nicOrPassport: '',
    licenceNumber: '',
    licenceExpiryDate: '',
    address: '',
    city: ''
  });

  const [licenceImage, setLicenceImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dashboardService.getProfile()
      .then((res) => {
        const p = res.data;
        setFormData({
          fullName: p.fullName || '',
          email: p.email || '',
          phoneNumber: p.phoneNumber || '',
          nicOrPassport: p.nicOrPassport || '',
          licenceNumber: p.licenceNumber || '',
          licenceExpiryDate: p.licenceExpiryDate || '',
          address: p.address || '',
          city: p.city || ''
        });
        setLicenceImage(p.licenceImageUrl);
      })
      .catch((err) => error('Failed to load profile: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await dashboardService.updateProfile(formData);
      updateUser({ fullName: formData.fullName, phoneNumber: formData.phoneNumber });
      success('Profile details updated successfully.');
    } catch (err) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving profile records..." />;

  return (
    <div style={{ maxWidth: '780px' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Personal Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your customer contact details and identity information</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-blue-600)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.1rem'
            }}>
              {formData.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">{formData.fullName}</h3>
              <span className="text-xs text-slate-500">{formData.email}</span>
            </div>
          </div>

          <Link to="/customer/licence" className="btn btn-secondary btn-sm">
            <ShieldCheck size={16} className="text-emerald-600" /> Manage Driving Licence
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                disabled
                style={{ backgroundColor: 'var(--color-slate-100)', color: 'var(--color-slate-500)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                className="form-input"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">NIC / Passport</label>
              <input
                type="text"
                name="nicOrPassport"
                className="form-input"
                value={formData.nicOrPassport}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Driving Licence Number</label>
              <input
                type="text"
                name="licenceNumber"
                className="form-input"
                value={formData.licenceNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Licence Expiry Date</label>
              <input
                type="date"
                name="licenceExpiryDate"
                className="form-input"
                value={formData.licenceExpiryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group sm:col-span-2">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group sm:col-span-2">
              <label className="form-label">Residential Address</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
