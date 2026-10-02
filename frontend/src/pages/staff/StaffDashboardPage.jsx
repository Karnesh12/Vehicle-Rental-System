import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ClipboardCheck,
  Car,
  CheckCircle2,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  AlertCircle,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = () => {
    setRefreshing(true);
    dashboardService.getStaffMetrics()
      .then((res) => {
        const data = res.data?.data || res.data;
        setMetrics(data);
      })
      .catch((err) => console.error('Failed to load staff metrics', err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <LoadingSpinner text="Loading Staff Operations Desk..." />;

  const formatLKR = (val) => Number(val || 0).toLocaleString('en-LK');
  
  const pendingCount = metrics?.pendingApprovals ?? (metrics?.recentBookings?.filter(b => b.status === 'PENDING').length ?? 0);
  const activeVehicles = metrics?.availableVehicles ?? 0;
  // Dashboard only displays Approved (CONFIRMED/ACTIVE) and PENDING bookings (REJECTED and CANCELLED removed)
  const recentBookings = (metrics?.recentBookings || []).filter(
    b => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'ACTIVE'
  );
  const confirmedCount = recentBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'ACTIVE').length;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Hero Welcome & Operations Command Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #070d1d 0%, #0f1f42 50%, #1e3a8a 100%)',
        borderRadius: '16px',
        padding: '2rem 2.25rem',
        color: '#ffffff',
        boxShadow: '0 10px 30px -5px rgba(15, 31, 66, 0.3)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.03em'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                Operations Live
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                {todayStr}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 0.4rem 0',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-heading)'
            }}>
              Welcome, {user?.fullName || 'Fleet Operations Officer'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0, maxWidth: '650px', lineHeight: 1.5 }}>
              Centralized staff desk for monitoring fleet availability, verifying customer payments, and issuing reservation approvals.
            </p>
          </div>

          {/* Quick Hero Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchMetrics}
              disabled={refreshing}
              className="btn btn-secondary btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem'
              }}
              title="Refresh Live Data"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <Link
              to="/staff/fleet"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
              }}
            >
              <Plus size={16} /> Add Vehicle
            </Link>

            <Link
              to="/staff/bookings"
              className="btn btn-sm"
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}
            >
              <ClipboardCheck size={16} /> Check Bookings ({pendingCount})
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards (4 High-Impact Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: Pending Approvals */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.4rem 1.5rem',
          border: '1px solid #e2e8f0',
          borderTop: '4px solid #f59e0b',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Pending Approvals
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
                {pendingCount}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
              border: '1px solid #fde68a'
            }}>
              <ClipboardCheck size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Awaiting payment verification</span>
            {pendingCount > 0 ? (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                Action Needed
              </span>
            ) : (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                All Clear
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Active Fleet Vehicles */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.4rem 1.5rem',
          border: '1px solid #e2e8f0',
          borderTop: '4px solid #2563eb',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Active Vehicles
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
                {activeVehicles}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
              border: '1px solid #bfdbfe'
            }}>
              <Car size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>In catalogue & ready to hire</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Operational
            </span>
          </div>
        </div>

        {/* Card 3: Approved / Active Bookings */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.4rem 1.5rem',
          border: '1px solid #e2e8f0',
          borderTop: '4px solid #10b981',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Confirmed Bookings
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
                {confirmedCount}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              border: '1px solid #a7f3d0'
            }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Approved by staff desk</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Confirmed
            </span>
          </div>
        </div>

        {/* Card 4: Total Reservations Logged */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.4rem 1.5rem',
          border: '1px solid #e2e8f0',
          borderTop: '4px solid #8b5cf6',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Total Reservations
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
                {recentBookings.length}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b5cf6',
              border: '1px solid #ddd6fe'
            }}>
              <Calendar size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Recorded in database</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              All Time
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Operational Modules (High-Converting Dual Feature Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Module 1: Fleet Inventory Hub */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Car size={26} />
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid #dbeafe'
              }}>
                Fleet Catalogue
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>
              Fleet Vehicles & Inventory
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Manage rental fleet cars, vans, and bikes. Add new vehicles with specifications, edit rental pricing, upload vehicle images, and decommission inactive cars.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
                <CheckCircle2 size={16} color="#10b981" /> Add, update, and manage vehicle specs & daily rates
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
                <CheckCircle2 size={16} color="#10b981" /> Automatic removal of inactive vehicles from public catalogue
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
                <CheckCircle2 size={16} color="#10b981" /> Real-time tracking of Available vs Rented vehicles
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link
              to="/staff/fleet"
              className="btn btn-primary"
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              Open Fleet Manager <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Module 2: Booking Review & Payment Desk */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClipboardCheck size={26} />
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#b45309',
                backgroundColor: '#fef3c7',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid #fde68a'
              }}>
                Payment Verification
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>
              Review Bookings & Payments
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Inspect customer reservations, review Cash and Bank Transfer payment proofs, calculate hire fees, and issue formal confirmation vouchers or rejections.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
                <CheckCircle2 size={16} color="#10b981" /> Verify payment method (Bank Transfer slip or Cash upon pickup)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
                <CheckCircle2 size={16} color="#10b981" /> Instant approval unlocks customer reservation voucher
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
                <CheckCircle2 size={16} color="#10b981" /> Rejection modal with custom reason logged for customer
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link
              to="/staff/bookings"
              className="btn btn-primary"
              style={{
                flex: 1,
                backgroundColor: '#10b981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              Review & Approve Bookings <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Live Recent Customer Bookings Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Recent Customer Bookings
              </h3>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px'
              }}>
                Latest {recentBookings.length}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', margin: 0 }}>
              Live reservations submitted by customers awaiting payment inspection or status update.
            </p>
          </div>

          <Link
            to="/staff/bookings"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
          >
            Open Full Approvals Desk <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Booking Ref</th>
                <th style={{ whiteSpace: 'nowrap' }}>Customer</th>
                <th style={{ whiteSpace: 'nowrap' }}>Vehicle</th>
                <th style={{ whiteSpace: 'nowrap' }}>Hire Dates</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Total Fee</th>
                <th style={{ whiteSpace: 'nowrap' }}>Payment</th>
                <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <Calendar size={36} style={{ margin: '0 auto 0.5rem auto', color: '#cbd5e1' }} />
                    <div style={{ fontWeight: 600, color: '#64748b' }}>No recent customer bookings found.</div>
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: 'var(--color-blue-600)',
                        backgroundColor: '#eff6ff',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #dbeafe',
                        fontSize: '0.82rem'
                      }}>
                        {b.bookingReference}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.customerPhone}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.vehicleMake} {b.vehicleModel}</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-blue-600)', marginTop: '0.1rem' }}>
                        {b.vehicleRegistration}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                        {b.pickupDate} &rarr; {b.returnDate}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {b.rentalDays} {b.rentalDays === 1 ? 'day' : 'days'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                        LKR {formatLKR(b.finalTotal)}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
                          {b.paymentMethod || 'CASH'}
                        </span>
                        <StatusBadge status={b.paymentStatus || 'PENDING'} />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={b.status} />
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {b.status === 'PENDING' ? (
                          <Link
                            to="/staff/bookings"
                            className="btn btn-sm"
                            style={{
                              backgroundColor: '#10b981',
                              color: '#fff',
                              fontSize: '0.75rem',
                              padding: '0.3rem 0.65rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <ClipboardCheck size={14} /> Check & Approve
                          </Link>
                        ) : (
                          <Link
                            to={`/customer/bookings/${b.id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.55rem', display: 'inline-flex', alignItems: 'center' }}
                            title="View Voucher"
                          >
                            <Eye size={14} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
