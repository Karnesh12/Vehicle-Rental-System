import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LicenceManagementPage() {
  const [profile, setProfile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const { success, error } = useToast();

  const loadProfile = () => {
    setLoading(true);
    dashboardService.getProfile()
      .then((res) => {
        setProfile(res.data);
        if (res.data?.licenceImageUrl) {
          setPreviewUrl(res.data.licenceImageUrl);
        }
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      error('Please select an image or document file to upload.');
      return;
    }

    setUploading(true);
    try {
      await dashboardService.uploadLicence(selectedFile);
      success('Driving licence image uploaded successfully!');
      loadProfile();
    } catch (err) {
      error(err.message || 'Failed to upload licence.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading licence records..." />;

  const isExpired = profile?.licenceExpiryDate && new Date(profile.licenceExpiryDate) < new Date();

  return (
    <div style={{ maxWidth: '680px' }}>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/customer/profile" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Driving Licence Verification</h1>
          <p className="text-xs text-slate-500 mt-0.5">Upload a clear photo or scan of your official driving licence</p>
        </div>
      </div>

      {/* Verification Status Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className={profile?.licenceImageUrl ? 'text-emerald-600' : 'text-amber-500'} />
            <h3 className="text-base font-bold text-navy-900">Verification Ledger</h3>
          </div>
          {profile?.licenceImageUrl ? (
            <span className="badge badge-available">Document Uploaded</span>
          ) : (
            <span className="badge badge-pending">Document Pending</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs mb-6">
          <div className="p-3 bg-slate-50 rounded-md">
            <span className="text-slate-400 block mb-1">Licence Number</span>
            <strong className="text-navy-900 text-sm">{profile?.licenceNumber || 'Not Specified'}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-md">
            <span className="text-slate-400 block mb-1">Expiry Date</span>
            <strong className={`text-sm ${isExpired ? 'text-rose-600' : 'text-navy-900'}`}>
              {profile?.licenceExpiryDate || 'Not Specified'}
            </strong>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUpload}>
          <div className="form-group mb-4">
            <label className="form-label">Select Licence Image (JPG, PNG, WEBP, PDF)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="form-input"
              onChange={handleFileChange}
            />
          </div>

          {previewUrl && (
            <div className="mb-4">
              <span className="text-xs font-semibold text-slate-600 block mb-2">Document Preview:</span>
              <div style={{
                maxHeight: '260px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--color-slate-200)',
                backgroundColor: 'var(--color-slate-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={previewUrl}
                  alt="Licence Preview"
                  style={{ maxHeight: '260px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={uploading || !selectedFile}
          >
            <Upload size={16} /> {uploading ? 'Uploading Document...' : 'Upload & Verify Licence'}
          </button>
        </form>
      </div>
    </div>
  );
}
