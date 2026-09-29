import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
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
          backgroundColor: 'var(--color-rose-50)',
          color: 'var(--color-rose-600)',
          marginBottom: '1rem'
        }}>
          <ShieldAlert size={44} />
        </div>
        <h1 className="text-2xl font-bold text-navy-900 mb-2">Access Denied (403)</h1>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          You do not have permission to view or manipulate this resource. Please make sure you are signed in with an authorized Staff or Administrator account.
        </p>
        <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
          <ArrowLeft size={16} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
