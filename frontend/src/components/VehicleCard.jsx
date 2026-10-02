import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Users, Fuel, Gauge, ArrowRight } from 'lucide-react';

export default function VehicleCard({ vehicle, onSelectDates }) {
  const navigate = useNavigate();

  if (!vehicle) return null;

  const isAvailable = vehicle.status === 'AVAILABLE';

  const formatPrice = (val) => {
    return Number(val).toLocaleString('en-LK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="card card-hoverable flex flex-col" style={{ height: '100%' }}>
      {/* Image & Badges Container */}
      <div style={{ position: 'relative', width: '100%', height: '210px', overflow: 'hidden', backgroundColor: 'var(--color-slate-100)' }}>
        <img
          src={vehicle.primaryImageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={`${vehicle.make} ${vehicle.model}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
          <span style={{
            background: 'rgba(7, 13, 29, 0.75)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            {vehicle.categoryName || 'VEHICLE'}
          </span>
        </div>

        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
          <StatusBadge status={vehicle.status} />
        </div>

        {/* Plate / Year Pill */}
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '0.75rem',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(4px)',
          padding: '0.15rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.725rem',
          fontWeight: 700,
          color: 'var(--color-navy-900)'
        }}>
          {vehicle.registrationNumber} • {vehicle.year}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-navy-900 mb-1">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mb-4">
            {vehicle.description || 'Reliable and fully maintained vehicle available for rental across Sri Lanka.'}
          </p>

          {/* Key Specs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            backgroundColor: 'var(--color-slate-50)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <div className="flex flex-col items-center">
              <Users size={16} className="text-slate-500 mb-1" />
              <span className="text-xs font-semibold text-navy-900">{vehicle.seats} Seats</span>
            </div>
            <div className="flex flex-col items-center">
              <Gauge size={16} className="text-slate-500 mb-1" />
              <span className="text-xs font-semibold text-navy-900">{vehicle.transmission}</span>
            </div>
            <div className="flex flex-col items-center">
              <Fuel size={16} className="text-slate-500 mb-1" />
              <span className="text-xs font-semibold text-navy-900">{vehicle.fuelType}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Daily Rate</span>
              <span className="text-2xl font-extrabold text-navy-900">
                LKR {formatPrice(vehicle.dailyRate)}
              </span>
              <span className="text-xs text-slate-500"> / day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="btn btn-secondary btn-sm flex-1"
            >
              Details
            </Link>

            {isAvailable ? (
              <button
                type="button"
                className="btn btn-primary btn-sm flex-1"
                onClick={() => {
                  if (onSelectDates) {
                    onSelectDates(vehicle);
                  } else {
                    navigate(`/booking/${vehicle.id}`);
                  }
                }}
              >
                Book Now <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-sm flex-1"
                disabled
              >
                Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
