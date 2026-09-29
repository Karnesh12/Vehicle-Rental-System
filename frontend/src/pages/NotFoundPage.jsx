import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="card p-8 text-center max-w-md">
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          borderRadius: '50%',
          backgroundColor: 'var(--color-blue-50)',
          color: 'var(--color-blue-600)',
          marginBottom: '1rem'
        }}>
          <FileQuestion size={44} />
        </div>
        <h1 className="text-2xl font-bold text-navy-900 mb-2">Page Not Found (404)</h1>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          The requested route does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
          <ArrowLeft size={16} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
