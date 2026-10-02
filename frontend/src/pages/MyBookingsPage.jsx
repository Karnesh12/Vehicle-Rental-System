import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import { Car, Calendar, Eye, XCircle, AlertCircle } from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { success, error } = useToast();

  const loadBookings = () => {
    setLoading(true);
    bookingService.getMyBookings()
      .then((res) => setBookings(res.data || []))
      .catch((err) => error('Failed to load bookings: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancellation = async () => {
    if (!bookingToCancel) return;

    setActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingToCancel.id, cancelReason || 'Cancelled by customer');
      success(`Booking ${bookingToCancel.bookingReference} has been cancelled.`);
      setCancelModalOpen(false);
      loadBookings();
    } catch (err) {
      error(err.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (selectedStatus === 'ALL') return true;
    return b.status === selectedStatus;
  });

  const formatLKR = (val) => Number(val).toLocaleString('en-LK');

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">Review your reservation requests, approved rentals, and trip history</p>
        </div>
        <Link to="/catalogue" className="btn btn-primary btn-sm">
          <Car size={16} /> New Reservation
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {['ALL', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className="btn btn-sm"
            style={{
              backgroundColor: selectedStatus === st ? 'var(--color-navy-900)' : 'var(--color-white)',
              color: selectedStatus === st ? 'var(--color-white)' : 'var(--color-slate-600)',
              border: '1px solid var(--color-slate-200)'
            }}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Bookings Table / Cards */}
      {loading ? (
        <LoadingSpinner text="Retrieving booking ledger..." />
      ) : filteredBookings.length === 0 ? (
        <div className="card p-12 text-center">
          <Car size={36} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900 mb-1">No Bookings Found</h3>
          <p className="text-xs text-slate-500 mb-6">You don't have any bookings in {selectedStatus.toLowerCase()} status.</p>
          <Link to="/catalogue" className="btn btn-secondary btn-sm">
            Browse Vehicle Fleet
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Vehicle</th>
                <th>Period & Duration</th>
                <th>Daily Rate</th>
                <th>Total (LKR)</th>
                <th>Status</th>
                <th>Payment</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const canCancel = b.status === 'PENDING' || b.status === 'CONFIRMED';
                return (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-blue-600)' }}>
                        {b.bookingReference}
                      </strong>
                    </td>
                    <td>
                      <div>
                        <strong>{b.vehicleMake} {b.vehicleModel}</strong>
                        <span className="text-xs text-slate-400 block">{b.vehicleRegistration}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600 block">{b.pickupDate} to {b.returnDate}</span>
                      <span className="text-xs font-semibold text-navy-900">{b.rentalDays} Days</span>
                    </td>
                    <td>LKR {formatLKR(b.dailyRate)}</td>
                    <td>
                      <strong className="text-navy-900">LKR {formatLKR(b.finalTotal)}</strong>
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td>
                      <StatusBadge status={b.paymentStatus} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/customer/bookings/${b.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          <Eye size={14} /> View
                        </Link>

                        {canCancel && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.65rem' }}
                            onClick={() => handleCancelClick(b)}
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Booking Cancellation */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel Vehicle Booking"
        message={`Are you sure you want to cancel booking ${bookingToCancel?.bookingReference} for ${bookingToCancel?.vehicleMake} ${bookingToCancel?.vehicleModel}? Vehicle availability will be released back to the fleet.`}
        confirmText="Confirm Cancellation"
        confirmType="danger"
        loading={actionLoading}
        onConfirm={confirmCancellation}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
}
