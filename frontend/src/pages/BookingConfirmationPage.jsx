import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle2, ArrowRight, Printer, Calendar, Car, ShieldCheck } from 'lucide-react';

export default function BookingConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId || params.id;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      bookingService.getBookingById(bookingId)
        .then((res) => {
          const b = res.data?.data || res.data || res;
          setBooking(b);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [bookingId]);

  if (loading) return <LoadingSpinner text="Fetching reservation confirmation..." fullScreen />;
  if (!booking) return <div className="p-12 text-center text-slate-500">Booking record not found.</div>;

  const formatLKR = (val) => Number(val).toLocaleString('en-LK');

  return (
    <div className="py-12 bg-slate-50">
      <div className="container max-w-2xl">
        <div className="card p-8 text-center mb-6">
          {/* Success Icon */}
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            borderRadius: '50%',
            backgroundColor: 'var(--color-emerald-50)',
            color: 'var(--color-emerald-600)',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={48} />
          </div>

          <span className="badge badge-pending mb-2">Awaiting Staff Verification</span>
          <h1 className="text-2xl font-extrabold text-navy-900 mb-2">Booking Request Received!</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Your vehicle reservation has been registered on the RideFlow central server and queued for staff verification.
          </p>

          {/* Reference Badge */}
          <div style={{
            background: 'var(--color-slate-100)',
            border: '1px dashed var(--color-slate-300)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'inline-block'
          }}>
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Booking Reference Number</span>
            <strong className="text-xl font-extrabold text-blue-600" style={{ fontFamily: 'monospace' }}>
              {booking.bookingReference}
            </strong>
          </div>

          {/* Booking Breakdown Table */}
          <div className="table-container text-left mb-6">
            <table className="table">
              <tbody>
                <tr>
                  <th style={{ width: '40%' }}>Vehicle Reserved</th>
                  <td><strong>{booking.vehicleMake} {booking.vehicleModel}</strong> ({booking.vehicleRegistration})</td>
                </tr>
                <tr>
                  <th>Rental Period</th>
                  <td>{booking.pickupDate} to {booking.returnDate} ({booking.rentalDays} Days)</td>
                </tr>
                <tr>
                  <th>Daily Rate</th>
                  <td>LKR {formatLKR(booking.dailyRate)}</td>
                </tr>
                <tr>
                  <th>Calculated Total</th>
                  <td className="text-lg font-bold text-navy-900">LKR {formatLKR(booking.finalTotal)}</td>
                </tr>
                <tr>
                  <th>Payment Method</th>
                  <td>{booking.paymentMethod} (Status: <StatusBadge status={booking.paymentStatus} />)</td>
                </tr>
                <tr>
                  <th>Customer Name</th>
                  <td>{booking.customerName} ({booking.customerEmail})</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print Confirmation
            </button>
            <Link to="/customer/bookings" className="btn btn-primary btn-sm">
              View In My Bookings <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
