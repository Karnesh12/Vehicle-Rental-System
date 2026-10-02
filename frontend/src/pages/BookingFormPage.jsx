import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  CreditCard,
  Banknote,
  Building,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function BookingFormPage() {
  const { vehicleId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pickupDate, setPickupDate] = useState(
    searchParams.get('pickupDate') || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState(
    searchParams.get('returnDate') || new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');

  const [pricingQuote, setPricingQuote] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/booking/${vehicleId}`);
      return;
    }

    vehicleService.getVehicle(vehicleId)
      .then((res) => {
        const veh = res.data?.data || res.data || res;
        setVehicle(veh);
      })
      .catch((err) => error('Failed to load vehicle: ' + (err.message || 'Unknown error')))
      .finally(() => setLoading(false));
  }, [vehicleId, isAuthenticated]);

  // Recalculate price whenever dates change
  useEffect(() => {
    if (vehicle && pickupDate && returnDate) {
      vehicleService.checkAvailability({
        vehicleId: Number(vehicleId),
        pickupDate,
        returnDate
      })
        .then((res) => {
          const quote = res.data?.data || res.data || res;
          setPricingQuote(quote);
        })
        .catch(() => setPricingQuote(null));
    }
  }, [vehicle, pickupDate, returnDate]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    const storedToken = localStorage.getItem('rideflow_token');
    if (!storedToken || !isAuthenticated) {
      error('Please sign in to your RideFlow account to place a booking reservation.');
      navigate(`/login?redirect=/booking/${vehicleId}`);
      return;
    }

    const isAvail = pricingQuote?.isAvailable ?? pricingQuote?.available ?? true;
    if (!isAvail) {
      error(pricingQuote?.message || 'Vehicle is not available for selected dates.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await bookingService.createBooking({
        vehicleId: Number(vehicleId),
        pickupDate,
        returnDate,
        paymentMethod,
        notes
      });

      const created = res.data?.data || res.data || res;
      const targetId = created?.id || res.id;
      success('Booking request placed successfully!');
      navigate(`/booking/confirmation/${targetId}`);
    } catch (err) {
      error(err.message || 'Failed to place booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Preparing booking contract..." fullScreen />;
  if (!vehicle) return <div className="p-12 text-center text-slate-500">Vehicle not found.</div>;

  const formatLKR = (val) => Number(val).toLocaleString('en-LK');

  return (
    <div className="py-12 bg-slate-50">
      <div className="container" style={{ maxWidth: '980px' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-navy-900">Complete Your Vehicle Reservation</h1>
          <p className="text-sm text-slate-500 mt-1">Review rental dates, choose payment preference, and submit for verification</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Booking Form */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="card p-6">
              <h3 className="text-base font-bold text-navy-900 mb-4 pb-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                <Calendar size={18} className="text-blue-600" /> 1. Select Hire Dates
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label">Pickup Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={pickupDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Return Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={returnDate}
                    min={pickupDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Status banner */}
              {pricingQuote && (
                <div className={`p-3 rounded-md mb-4 flex items-center gap-2 text-xs font-semibold ${
                  pricingQuote.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {pricingQuote.isAvailable ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{pricingQuote.message}</span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="card p-6">
              <h3 className="text-base font-bold text-navy-900 mb-4 pb-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                <CreditCard size={18} className="text-blue-600" /> 2. Payment Settlement Preference
              </h3>

              <p className="text-xs text-slate-500 mb-4">
                Note: RideFlow records all transactions securely at vehicle handover. No online gateway transaction is charged right now.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <label style={{
                  border: paymentMethod === 'CASH' ? '2px solid var(--color-blue-600)' : '1px solid var(--color-slate-200)',
                  backgroundColor: paymentMethod === 'CASH' ? 'var(--color-blue-50)' : 'white',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div className="flex items-center justify-between">
                    <Banknote size={20} className="text-navy-900" />
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={paymentMethod === 'CASH'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                  </div>
                  <span className="text-sm font-bold text-navy-900">Cash on Pickup</span>
                  <span className="text-xs text-slate-500">Pay cash in LKR at depot</span>
                </label>

                <label style={{
                  border: paymentMethod === 'CARD' ? '2px solid var(--color-blue-600)' : '1px solid var(--color-slate-200)',
                  backgroundColor: paymentMethod === 'CARD' ? 'var(--color-blue-50)' : 'white',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div className="flex items-center justify-between">
                    <CreditCard size={20} className="text-navy-900" />
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={paymentMethod === 'CARD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                  </div>
                  <span className="text-sm font-bold text-navy-900">Card Terminal</span>
                  <span className="text-xs text-slate-500">Visa / Mastercard POS</span>
                </label>

                <label style={{
                  border: paymentMethod === 'BANK_TRANSFER' ? '2px solid var(--color-blue-600)' : '1px solid var(--color-slate-200)',
                  backgroundColor: paymentMethod === 'BANK_TRANSFER' ? 'var(--color-blue-50)' : 'white',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div className="flex items-center justify-between">
                    <Building size={20} className="text-navy-900" />
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                  </div>
                  <span className="text-sm font-bold text-navy-900">Bank Transfer</span>
                  <span className="text-xs text-slate-500">Direct deposit slip</span>
                </label>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Special Delivery / Handover Requests</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Airport delivery request at 10:00 AM, baby seat requirement..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleSubmitBooking}
              disabled={submitting || !pricingQuote?.isAvailable}
            >
              {submitting ? 'Confirming Booking with Backend...' : 'Submit Booking Request'}
            </button>
          </div>

          {/* Right: Vehicle & Price Summary Card */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="card p-6">
              <h3 className="text-base font-bold text-navy-900 mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                Rental Summary
              </h3>

              {/* Vehicle Mini Card */}
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                <img
                  src={vehicle.primaryImageUrl}
                  alt={vehicle.model}
                  style={{ width: '80px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
                <div>
                  <span className="badge badge-available mb-1" style={{ fontSize: '0.65rem' }}>{vehicle.categoryName}</span>
                  <h4 className="text-sm font-bold text-navy-900">{vehicle.make} {vehicle.model}</h4>
                  <span className="text-xs text-slate-500">{vehicle.registrationNumber} • {vehicle.year}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div className="flex justify-between text-slate-600">
                  <span>Pickup Date:</span>
                  <strong>{pickupDate}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Return Date:</span>
                  <strong>{returnDate}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Rental Days:</span>
                  <strong>{pricingQuote?.rentalDays || 1} Days</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Daily Rate:</span>
                  <span>LKR {formatLKR(vehicle.dailyRate)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Rental Subtotal:</span>
                  <span>LKR {formatLKR(pricingQuote?.rentalSubtotal || vehicle.dailyRate)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Additional Charges:</span>
                  <span>LKR 0.00</span>
                </div>

                <div className="flex justify-between items-baseline pt-3 mt-2" style={{ borderTop: '2px dashed var(--color-slate-200)' }}>
                  <span className="font-bold text-navy-900 text-base">Final Total:</span>
                  <strong className="text-navy-900 text-2xl font-extrabold">
                    LKR {formatLKR(pricingQuote?.finalTotal || vehicle.dailyRate)}
                  </strong>
                </div>
              </div>

              <div className="mt-6 p-3 bg-slate-50 rounded-md text-xs text-slate-500 flex items-start gap-2">
                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  Zero client-side trusted pricing: Every calculation is executed strictly on the RideFlow Java backend.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
