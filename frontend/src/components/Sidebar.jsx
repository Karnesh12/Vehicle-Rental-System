import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  ClipboardCheck,
  Search,
  Globe,
  User,
  LogOut,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { isAdmin, isStaff, isCustomer, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 0.85rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? '#1d4ed8' : '#475569',
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
    transition: 'all 0.15s ease',
    textDecoration: 'none'
  });

  const getInitials = (name) => {
    if (!name) return 'RF';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <aside style={{
      width: '270px',
      flexShrink: 0,
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      minHeight: 'calc(100vh - 70px)',
      padding: '1.5rem 1rem 1.25rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 8px rgba(0,0,0,0.015)'
    }}>
      {/* Navigation Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
        {(isStaff || isAdmin) && (
          <div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94a3b8',
              padding: '0 0.85rem',
              marginBottom: '0.4rem'
            }}>
              Core Operations
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <NavLink to="/staff/dashboard" style={linkStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <LayoutDashboard size={18} />
                  <span>Operations Desk</span>
                </div>
              </NavLink>

              <NavLink to="/staff/fleet" style={linkStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Car size={18} />
                  <span>Fleet & Inventory</span>
                </div>
              </NavLink>

              <NavLink to="/staff/bookings" style={linkStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <ClipboardCheck size={18} />
                  <span>Bookings & Review</span>
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#b45309',
                  backgroundColor: '#fef3c7',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '9999px',
                  border: '1px solid #fde68a'
                }}>
                  Desk
                </span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Shortcuts for Staff */}
        {(isStaff || isAdmin) && (
          <div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94a3b8',
              padding: '0 0.85rem',
              marginBottom: '0.4rem'
            }}>
              System Shortcuts
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <NavLink to="/catalogue" style={linkStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Globe size={18} />
                  <span>Public Catalogue</span>
                </div>
                <ArrowUpRight size={14} color="#94a3b8" />
              </NavLink>

              <NavLink to="/availability" style={linkStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Search size={18} />
                  <span>Availability Engine</span>
                </div>
              </NavLink>
            </div>
          </div>
        )}

        {/* Customer Section */}
        {isCustomer && (
          <div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94a3b8',
              padding: '0 0.85rem',
              marginBottom: '0.4rem'
            }}>
              My Account
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <NavLink to="/customer/dashboard" style={linkStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <LayoutDashboard size={18} />
                  <span>Overview</span>
                </div>
              </NavLink>

              <NavLink to="/customer/bookings" style={linkStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Car size={18} />
                  <span>My Bookings</span>
                </div>
              </NavLink>

              <NavLink to="/customer/profile" style={linkStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <User size={18} />
                  <span>Profile & Licence</span>
                </div>
              </NavLink>

              <NavLink to="/catalogue" style={linkStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Globe size={18} />
                  <span>Browse Fleet</span>
                </div>
              </NavLink>
            </div>
          </div>
        )}
      </div>

      {/* 3. Docked Staff Profile & Quick Logout Footer */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '1rem',
        borderTop: '1px solid #f1f5f9'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.75rem',
          borderRadius: '12px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 800,
              flexShrink: 0
            }}>
              {getInitials(user?.fullName)}
            </div>

            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.fullName || 'Staff Officer'}
              </div>
              <div style={{
                fontSize: '0.68rem',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {(isStaff || isAdmin) ? 'Fleet Officer' : 'Customer'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
            title="Sign Out"
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e11d48'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
