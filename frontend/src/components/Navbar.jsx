import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  CalendarCheck,
  User,
  LogOut,
  ShieldAlert,
  Sliders,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isStaff, isCustomer, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isStaff || isAdmin) return '/staff/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header style={{
      backgroundColor: 'var(--color-navy-950)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container flex items-center justify-between" style={{ height: '70px' }}>
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div style={{
            background: 'linear-gradient(135deg, var(--color-blue-600), var(--color-blue-400))',
            color: 'var(--color-white)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Car size={22} />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: '800',
              color: 'var(--color-white)',
              letterSpacing: '-0.03em'
            }}>
              Ride<span style={{ color: 'var(--color-blue-400)' }}>Flow</span>
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.65rem',
              color: 'var(--color-slate-400)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              lineHeight: 1
            }}>
              Vehicle Rentals
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="flex items-center gap-6" style={{ display: 'none' }}>
          {/* Will be overridden by media query */}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link
            to="/catalogue"
            style={{
              color: location.pathname === '/catalogue' ? 'var(--color-blue-400)' : 'var(--color-slate-200)',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            Vehicle Catalogue
          </Link>
          <Link
            to="/availability"
            style={{
              color: location.pathname === '/availability' ? 'var(--color-blue-400)' : 'var(--color-slate-200)',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <CalendarCheck size={16} /> Check Availability
          </Link>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.35rem 0.85rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--color-blue-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem'
                  }}>
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span>{user?.fullName?.split(' ')[0]}</span>
                  <span className={`badge badge-${user?.role?.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {user?.role}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {dropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '220px',
                      background: 'var(--color-navy-900)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: '0.5rem 0',
                      zIndex: 100
                    }}
                  >
                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)' }}>Signed in as</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', wordBreak: 'break-all' }}>{user?.email}</p>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1rem',
                        color: 'var(--color-slate-200)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <Sliders size={16} />
                      {(isStaff || isAdmin) ? 'Staff Portal' : 'Customer Dashboard'}
                    </Link>

                    {isCustomer && (
                      <>
                        <Link
                          to="/customer/bookings"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1rem',
                            color: 'var(--color-slate-200)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <Car size={16} /> My Bookings
                        </Link>
                        <Link
                          to="/customer/profile"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1rem',
                            color: 'var(--color-slate-200)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <User size={16} /> Profile & Licence
                        </Link>
                      </>
                    )}

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '0.3rem 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.6rem 1rem',
                        color: 'var(--color-rose-500)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ color: 'var(--color-navy-950)' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
