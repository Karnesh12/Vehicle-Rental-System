import React from 'react';
import { Car } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#070d1d',
      color: '#94a3b8',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.25rem 0',
      marginTop: 'auto',
      fontSize: '0.85rem'
    }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Brand Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: '#2563eb',
              color: '#ffffff',
              padding: '0.35rem',
              borderRadius: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(37, 99, 235, 0.35)'
            }}>
              <Car size={16} />
            </div>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}>
              Ride<span style={{ color: '#60a5fa' }}>Flow</span>
            </span>
            <span style={{ color: '#475569', margin: '0 0.25rem' }}>|</span>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
              Vehicle Rental Management System
            </span>
          </div>

          {/* Copyright & Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>© {new Date().getFullYear()} RideFlow. All rights reserved.</span>
            <span>•</span>
            <span>Sri Lanka (LKR)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

