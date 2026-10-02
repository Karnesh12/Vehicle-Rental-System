import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { CalendarCheck, Search, Car, Calendar, Filter, Sparkles } from 'lucide-react';

export default function AvailabilitySearchPage() {
  const [pickupDate, setPickupDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showError } = useToast();

  useEffect(() => {
    vehicleService.getCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await vehicleService.searchVehicles({
        pickupDate,
        returnDate,
        categoryId: categoryId || undefined,
        status: 'AVAILABLE'
      });
      const data = res.data?.data || res.data;
      const list = data?.content || (Array.isArray(data) ? data : []);
      setAvailableVehicles(list.filter(v => v.status !== 'INACTIVE'));
    } catch (err) {
      showError(err.message || 'Failed to query vehicle availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#070d1d', minHeight: '100vh', padding: '3.5rem 0 5rem 0', color: '#ffffff' }}>
      <div className="container" style={{ maxWidth: '1240px' }}>
        {/* Top Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3rem)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Check Vehicle Availability
          </h1>
        </div>

        {/* Date Selector Box */}
        <div style={{
          maxWidth: '960px',
          margin: '0 auto 3.5rem auto',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
        }}>
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pickup Date */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#94a3b8',
                  marginBottom: '0.5rem'
                }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: '-2px', color: '#60a5fa' }} />
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#0b1329',
                    border: '1px solid #1e293b',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Return Date */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#94a3b8',
                  marginBottom: '0.5rem'
                }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: '-2px', color: '#60a5fa' }} />
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#0b1329',
                    border: '1px solid #1e293b',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#94a3b8',
                  marginBottom: '0.5rem'
                }}>
                  <Car size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: '-2px', color: '#60a5fa' }} />
                  Vehicle Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#0b1329',
                    border: '1px solid #1e293b',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Categories (Cars, Vans, Bikes)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
                }}
              >
                {loading ? 'Verifying Calendar Availabilities...' : (
                  <>
                    <Search size={18} /> Search Available Vehicles
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner text="Querying database for collision-free vehicles..." />
          </div>
        ) : hasSearched ? (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
                <span style={{ color: '#60a5fa' }}>{availableVehicles.length} Vehicles</span> Available ({pickupDate} to {returnDate})
              </h3>
            </div>

            {availableVehicles.length === 0 ? (
              <div style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                backgroundColor: '#0b1329',
                borderRadius: '1.25rem',
                border: '1px solid #1e293b'
              }}>
                <Car size={42} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No Vehicles Available for These Dates
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                  All units in this selection have confirmed bookings or scheduled maintenance. Try choosing a different date range.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableVehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
