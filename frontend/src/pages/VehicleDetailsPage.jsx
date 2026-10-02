import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  Users,
  Gauge,
  Fuel,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  // Date availability checker state
  const [dates, setDates] = useState({
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]
  });

  const [checking, setChecking] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);

  const { error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    vehicleService.getVehicle(id)
      .then((res) => {
        const v = res.data;
        setVehicle(v);
        setActiveImage(v.primaryImageUrl);
      })
      .catch((err) => error('Could not load vehicle details: ' + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setChecking(true);
    try {
      const res = await vehicleService.checkAvailability({
        vehicleId: id,
        pickupDate: dates.pickupDate,
        returnDate: dates.returnDate
      });
      setAvailabilityResult(res.data);
    } catch (err) {
      error(err.message || 'Availability check failed.');
      setAvailabilityResult(null);
    } finally {
      setChecking(false);
    }
  };

  const handleProceedBooking = () => {
    navigate(`/booking/${id}?pickupDate=${dates.pickupDate}&returnDate=${dates.returnDate}`);
  };

  if (loading) return <LoadingSpinner text="Loading vehicle profile..." fullScreen />;
  if (!vehicle) return <div className="p-12 text-center text-slate-500">Vehicle not found.</div>;

  const formatLKR = (val) => Number(val).toLocaleString('en-LK');

  const allImages = [
    vehicle.primaryImageUrl,
    ...(vehicle.additionalImages || [])
  ].filter(Boolean);

  return (
    <div className="py-12">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link to="/" style={{ color: 'var(--color-blue-600)' }}>Home</Link>
          <span>/</span>
          <Link to="/catalogue" style={{ color: 'var(--color-blue-600)' }}>Catalogue</Link>
          <span>/</span>
          <span className="text-navy-900">{vehicle.make} {vehicle.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery & Full Description */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Primary Large Image */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '380px', width: '100%', position: 'relative', backgroundColor: 'var(--color-slate-100)' }}>
                <img
                  src={activeImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
                  alt={vehicle.model}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <StatusBadge status={vehicle.status} />
                </div>
              </div>

              {/* Thumbnails if available */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 overflow-x-auto">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      style={{
                        width: '72px',
                        height: '52px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: activeImage === img ? '2px solid var(--color-blue-600)' : '2px solid transparent',
                        padding: 0,
                        cursor: 'pointer',
                        background: 'transparent'
                      }}
                    >
                      <img src={img} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Overview Card */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-navy-900 mb-3">Vehicle Overview</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {vehicle.description || 'This vehicle is thoroughly inspected, fully insured, and maintained to the highest standards. Available for both Colombo and outstation journeys.'}
              </p>

              <h4 className="text-sm font-bold text-navy-900 mb-3 uppercase tracking-wider">Specifications</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-md">
                  <span className="text-xs text-slate-400 block">Registration</span>
                  <span className="text-sm font-bold text-navy-900">{vehicle.registrationNumber}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <span className="text-xs text-slate-400 block">Year</span>
                  <span className="text-sm font-bold text-navy-900">{vehicle.year}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <span className="text-xs text-slate-400 block">Colour</span>
                  <span className="text-sm font-bold text-navy-900">{vehicle.colour}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <span className="text-xs text-slate-400 block">Current Mileage</span>
                  <span className="text-sm font-bold text-navy-900">{vehicle.currentMileage?.toLocaleString()} km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Specs and Real-Time Availability Engine */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {vehicle.categoryName}
                </span>
                <StatusBadge status={vehicle.status} />
              </div>

              <h1 className="text-2xl font-extrabold text-navy-900 mb-4">
                {vehicle.make} {vehicle.model}
              </h1>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 mb-6 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Daily Hire Rate</span>
                  <span className="text-3xl font-extrabold text-navy-900">
                    LKR {formatLKR(vehicle.dailyRate)}
                  </span>
                </div>
                <span className="text-xs text-slate-600 font-semibold">Per 24h cycle</span>
              </div>

              {/* Spec Badges Row */}
              <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                <div className="p-3 border rounded-md">
                  <Users size={18} className="text-blue-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-navy-900 block">{vehicle.seats} Seats</span>
                </div>
                <div className="p-3 border rounded-md">
                  <Gauge size={18} className="text-blue-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-navy-900 block">{vehicle.transmission}</span>
                </div>
                <div className="p-3 border rounded-md">
                  <Fuel size={18} className="text-blue-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-navy-900 block">{vehicle.fuelType}</span>
                </div>
              </div>

              {/* Real-time Date Availability Checker */}
              <div style={{ borderTop: '1px solid var(--color-slate-100)', paddingTop: '1.5rem' }}>
                <h4 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" /> Check Availability & Calculate Total
                </h4>

                <form onSubmit={handleCheckAvailability}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="form-group mb-0">
                      <label className="form-label">Pickup Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={dates.pickupDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDates({ ...dates, pickupDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label className="form-label">Return Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={dates.returnDate}
                        min={dates.pickupDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDates({ ...dates, returnDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', marginBottom: '1rem' }}
                    disabled={checking}
                  >
                    {checking ? 'Verifying with Backend...' : 'Verify Availability & Calculate Rate'}
                  </button>
                </form>

                {/* Calculation Quote Breakdown */}
                {availabilityResult && (
                  <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: availabilityResult.isAvailable ? 'var(--color-emerald-50)' : 'var(--color-rose-50)',
                    border: `1px solid ${availabilityResult.isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`,
                    marginBottom: '1rem'
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      {availabilityResult.isAvailable ? (
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={18} className="text-rose-600" />
                      )}
                      <span className={`text-xs font-bold ${availabilityResult.isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {availabilityResult.message}
                      </span>
                    </div>

                    {availabilityResult.isAvailable && (
                      <div style={{ fontSize: '0.825rem', color: 'var(--color-slate-700)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div className="flex justify-between">
                          <span>Rental Duration:</span>
                          <strong>{availabilityResult.rentalDays} Days</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Daily Rate:</span>
                          <span>LKR {formatLKR(availabilityResult.dailyRate)}</span>
                        </div>
                        <div className="flex justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.35rem' }}>
                          <span className="font-bold text-navy-900">Total Rental Quote:</span>
                          <strong className="text-navy-900 text-base">LKR {formatLKR(availabilityResult.finalTotal)}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {vehicle.status === 'AVAILABLE' ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={handleProceedBooking}
                  >
                    Proceed to Booking <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    style={{ width: '100%' }}
                    disabled
                  >
                    Vehicle Currently Unavailable ({vehicle.status})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
