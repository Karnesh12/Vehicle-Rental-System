import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Calendar,
  ShieldCheck,
  Zap,
  Award,
  Headphones,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Car,
  Fuel,
  MapPin,
  Clock,
  Star
} from 'lucide-react';

export default function HomePage() {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('ALL');

  const [searchDates, setSearchDates] = useState({
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    categoryId: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      vehicleService.searchVehicles({ size: 9, status: 'AVAILABLE' }),
      vehicleService.getCategories()
    ])
      .then(([vehRes, catRes]) => {
        const vehData = vehRes.data?.data || vehRes.data;
        const list = vehData?.content || (Array.isArray(vehData) ? vehData : []);
        setFeaturedVehicles(list.filter(v => v.status !== 'INACTIVE'));

        const catData = catRes.data?.data || catRes.data;
        setCategories(Array.isArray(catData) ? catData : (catData?.content || []));
      })
      .catch((err) => console.error('Failed to load home data', err))
      .finally(() => setLoading(false));
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchDates.pickupDate) query.set('pickupDate', searchDates.pickupDate);
    if (searchDates.returnDate) query.set('returnDate', searchDates.returnDate);
    if (searchDates.categoryId) query.set('categoryId', searchDates.categoryId);
    navigate(`/catalogue?${query.toString()}`);
  };

  const filteredVehicles = featuredVehicles.filter(v => {
    if (selectedCategoryTab === 'ALL') return true;
    return v.categoryName?.toUpperCase() === selectedCategoryTab;
  });

  return (
    <div style={{ backgroundColor: '#070d1d', color: '#f8fafc', minHeight: '100vh' }}>
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        padding: '4.5rem 0 5rem 0',
        background: 'radial-gradient(ellipse at top, #132247 0%, #070d1d 70%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '750px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0) 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1240px' }}>
          {/* Header Tag */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.1rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#60a5fa',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 0 15px rgba(37, 99, 235, 0.2)'
            }}>
              <Sparkles size={14} /> Premier Vehicle Rental Management Platform in Sri Lanka
            </span>
          </div>

          {/* Hero Headline */}
          <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 1.5rem auto' }}>
            <h1 style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.18,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              marginBottom: '1rem'
            }}>
              Drive Your Sri Lankan Journey with{' '}
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                RideFlow Premium Fleet
              </span>
            </h1>
          </div>

          {/* 2. GLASSMORPHIC INSTANT SEARCH BOX (FULL WIDTH / BEAUTIFULLY CENTERED) */}
          <div style={{
            maxWidth: '1000px',
            margin: '2.5rem auto 0 auto',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}>
            <form onSubmit={handleHeroSearch}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Vehicle Category */}
                <div className="col-span-1">
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
                    value={searchDates.categoryId}
                    onChange={(e) => setSearchDates({ ...searchDates, categoryId: e.target.value })}
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
                      <option key={c.id} value={c.id}>
                        {c.name} (Deposit: LKR {c.baseDeposit?.toLocaleString() || '15,000'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pickup Date */}
                <div className="col-span-1">
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
                    value={searchDates.pickupDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSearchDates({ ...searchDates, pickupDate: e.target.value })}
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
                <div className="col-span-1">
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
                    value={searchDates.returnDate}
                    min={searchDates.pickupDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSearchDates({ ...searchDates, returnDate: e.target.value })}
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

                {/* Submit Search Button */}
                <div className="col-span-1">
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1.25rem',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      border: 'none',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Search size={18} />
                    <span>Search Fleet</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Micro badges below form */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.8rem',
              color: '#94a3b8'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} color="#10b981" /> Overlap-Free Guaranteed Booking
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} color="#10b981" /> No Hidden Mileage or Airport Fees
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} color="#10b981" /> Free Cancellation Before Handover
              </span>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginTop: '3.5rem', maxWidth: '980px', margin: '3.5rem auto 0 auto' }}>
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Verified Vehicle Handover</div>
            </div>

            <div style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>4.9 / 5</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Customer Viva Satisfaction</div>
            </div>

            <div style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>LKR 0</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Hidden Platform Charges</div>
            </div>

            <div style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa' }}>24 / 7</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Islandwide Roadside Help</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED FLEET SHOWCASE */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#070d1d' }}>
        <div className="container" style={{ maxWidth: '1240px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '2.5rem'
          }}>
            <span style={{
              color: '#3b82f6',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem'
            }}>
              Explore Our Collection
            </span>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem'
            }}>
              Available Rental Fleet in Sri Lanka
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '540px', fontSize: '0.95rem' }}>
              Every car, van, and bike is meticulously inspected, cleaned, valeted, and ready for immediate booking.
            </p>

            {/* Category Filter Tabs */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1.5rem'
            }}>
              {['ALL', 'CAR', 'SUV', 'VAN', 'BIKE'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedCategoryTab(tab)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: selectedCategoryTab === tab ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: selectedCategoryTab === tab ? '#2563eb' : 'rgba(15, 23, 42, 0.6)',
                    color: selectedCategoryTab === tab ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab === 'ALL' ? 'All Vehicles' : tab === 'CAR' ? 'Sedans & Hatches' : tab === 'VAN' ? 'Passenger Vans' : tab === 'BIKE' ? 'Motorbikes' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          {loading ? (
            <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
              <LoadingSpinner />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: '#0b1329',
              borderRadius: '1rem',
              border: '1px solid #1e293b'
            }}>
              <Car size={36} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ color: '#ffffff', fontWeight: 600 }}>No vehicles found in this category</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Please select another category or visit the full catalogue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link
              to="/catalogue"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 2rem',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                borderRadius: '0.75rem',
                color: '#60a5fa',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Browse Complete Fleet (7+ Vehicles) <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section style={{
        padding: '5rem 0',
        backgroundColor: '#0b1329',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div className="container" style={{ maxWidth: '1240px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{
              color: '#3b82f6',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              Simple & Transparent Lifecycle
            </span>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem'
            }}>
              How RideFlow Works in 4 Steps
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
              From initial reservation to final return inspection, our full-stack system coordinates every touchpoint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '1.25rem',
              padding: '1.75rem',
              position: 'relative'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                marginBottom: '1rem'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Select & Calculate Quote
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Choose your car, specify pickup and return dates, and view a transparent calculation of rental days and refundable deposit.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '1.25rem',
              padding: '1.75rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                marginBottom: '1rem'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Staff Approval & Review
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Branch staff verify customer NIC and driving licence credentials, checking collision-free calendar availability.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '1.25rem',
              padding: '1.75rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                marginBottom: '1rem'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Handover & Key Release
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Baseline odometer mileage and fuel levels are captured digitally. Keys and insurance documents are released to the driver.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '1.25rem',
              padding: '1.75rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                color: '#c084fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                marginBottom: '1rem'
              }}>
                4
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Return & Final Settlement
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Return inspection calculates distance driven, assesses optional incidentals, closes reservation, and unlocks vehicle back into fleet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section style={{
        padding: '5rem 0',
        background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.2) 0%, rgba(7, 13, 29, 0.95) 75%)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '1rem'
          }}>
            Ready to Experience RideFlow?
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.05rem',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            Explore our curated fleet of luxury sedans, family SUVs, passenger vans, and motorbikes for your next Sri Lankan journey.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/catalogue"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 2rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                borderRadius: '0.75rem',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
              }}
            >
              Browse All Vehicles <ArrowRight size={18} />
            </Link>
            <Link
              to="/search"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '0.75rem',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none'
              }}
            >
              <Calendar size={18} /> Check Availability
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
