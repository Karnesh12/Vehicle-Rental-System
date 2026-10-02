import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Calendar, Search, Filter, CheckCircle2, 
  XCircle, Clock, Eye, AlertTriangle, Info, CreditCard, DollarSign, RefreshCw,
  Check, Receipt
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export default function StaffBookingsPage() {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Default filter is ACTIVE_DESK so that rejected and cancelled bookings are removed from active view
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ACTIVE_DESK');
  
  // Review modal state (Approve / Reject)
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewAction, setReviewAction] = useState(null); // 'CONFIRMED' or 'REJECTED'
  const [rejectionReason, setRejectionReason] = useState('');
  const [markPaymentReceived, setMarkPaymentReceived] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Dedicated Payment Confirmation Modal State
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState('CASH');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRefNumber, setPaymentRefNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAllBookings({ size: 100 });
      const raw = res?.data;
      const list = Array.isArray(raw) ? raw : (raw?.content || []);
      setBookings(list);
    } catch (err) {
      showError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (booking, action) => {
    setSelectedBooking(booking);
    setReviewAction(action);
    setRejectionReason('');
    setMarkPaymentReceived(booking.paymentStatus !== 'PAID');
    setShowReviewModal(true);
  };

  const handleConfirmReview = async () => {
    if (reviewAction === 'REJECTED' && !rejectionReason.trim()) {
      showError('Please provide a reason for rejection');
      return;
    }

    setReviewing(true);
    try {
      // 1. If staff approves and confirms payment receipt simultaneously
      if (reviewAction === 'CONFIRMED' && markPaymentReceived && selectedBooking.paymentStatus !== 'PAID') {
        try {
          await paymentService.recordPayment({
            bookingId: selectedBooking.id,
            amount: selectedBooking.finalTotal,
            paymentMethod: selectedBooking.paymentMethod || 'CASH',
            paymentStatus: 'PAID',
            referenceNumber: `REC-${Date.now().toString().slice(-6)}`,
            notes: 'Payment verified and marked received by Staff upon approval.'
          });
        } catch (payErr) {
          console.error('Payment record notice:', payErr);
          showError('Failed to record payment: ' + (payErr.response?.data?.message || payErr.message));
          setReviewing(false);
          return;
        }
      }

      // 2. Review Booking (CONFIRMED or REJECTED)
      const payload = {
        approved: reviewAction === 'CONFIRMED',
        reason: reviewAction === 'REJECTED' ? rejectionReason : null
      };

      const res = await bookingService.reviewBooking(selectedBooking.id, payload);

      if (res?.success || res?.data) {
        showSuccess(
          `Booking #${selectedBooking.bookingReference} has been ${reviewAction === 'CONFIRMED' ? 'APPROVED & CONFIRMED' : 'REJECTED (Removed from Active Desk)'}!`
        );
        setShowReviewModal(false);
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to review booking');
    } finally {
      setReviewing(false);
    }
  };

  // Open dedicated payment confirmation modal
  const handleOpenPaymentModal = (booking) => {
    setPaymentModalBooking(booking);
    setPaymentMethodChoice(booking.paymentMethod || 'CASH');
    setPaymentAmount(booking.finalTotal || '');
    setPaymentRefNumber(`PAY-${Date.now().toString().slice(-6)}`);
    setPaymentNotes(`Payment verified and received by Staff for booking #${booking.bookingReference}`);
  };

  // Submit direct payment confirmation
  const handleConfirmDirectPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalBooking) return;
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      showError('Please enter a valid payment amount');
      return;
    }

    setRecordingPayment(true);
    try {
      await paymentService.recordPayment({
        bookingId: paymentModalBooking.id,
        amount: Number(paymentAmount),
        paymentMethod: paymentMethodChoice,
        paymentStatus: 'PAID',
        referenceNumber: paymentRefNumber || `PAY-${Date.now().toString().slice(-6)}`,
        notes: paymentNotes
      });
      showSuccess(`Payment of LKR ${Number(paymentAmount).toLocaleString()} confirmed as PAID!`);
      setPaymentModalBooking(null);
      fetchBookings();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to record payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  const filteredBookings = (bookings || []).filter(b => {
    const vehicleFull = `${b.vehicleMake || ''} ${b.vehicleModel || ''}`.toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = 
      b.bookingReference?.toLowerCase().includes(query) ||
      b.customerName?.toLowerCase().includes(query) ||
      b.customerEmail?.toLowerCase().includes(query) ||
      vehicleFull.includes(query) ||
      b.vehicleRegistration?.toLowerCase().includes(query);
      
    let matchesStatus = false;
    if (statusFilter === 'ACTIVE_DESK') {
      // Show ONLY pending and approved bookings (exclude REJECTED and CANCELLED)
      matchesStatus = b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'ACTIVE';
    } else if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else {
      matchesStatus = b.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const statusTabs = [
    { id: 'ACTIVE_DESK', label: 'Active Desk (Pending & Approved)' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'ACTIVE', label: 'Active Rentals' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'REJECTED', label: 'Rejected History' },
    { id: 'ALL', label: 'All History' }
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#b45309',
              backgroundColor: '#fef3c7',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)'
            }}>
              Booking & Payment Approvals
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-900)', margin: 0 }}>
            Customer Bookings & Payment Review Desk
          </h1>
        </div>

        <button
          onClick={fetchBookings}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          title="Refresh List"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search reference, customer name, email, or vehicle plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <Filter size={16} color="#64748b" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status:</span>
            {statusTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`btn btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="Loading bookings..." />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <Calendar size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>No Bookings Match Selected Filters</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>
            {statusFilter === 'ACTIVE_DESK' 
              ? 'There are no pending or approved bookings right now.' 
              : 'Try resetting your search query or selecting another filter.'}
          </p>
        </div>
      ) : (
        <div className="table-container" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
          <table className="table" style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap', width: '150px' }}>Booking Ref</th>
                <th style={{ whiteSpace: 'nowrap', width: '180px' }}>Customer</th>
                <th style={{ whiteSpace: 'nowrap', width: '170px' }}>Vehicle</th>
                <th style={{ whiteSpace: 'nowrap', width: '160px' }}>Hire Schedule</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap', width: '130px' }}>Total Fee (LKR)</th>
                <th style={{ whiteSpace: 'nowrap', width: '180px' }}>Payment Method & Status</th>
                <th style={{ textAlign: 'center', whiteSpace: 'nowrap', width: '110px' }}>Rental Status</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap', width: '200px' }}>Staff Decision</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
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
                      fontSize: '0.85rem',
                      display: 'inline-block'
                    }}>
                      {b.bookingReference}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy-900)' }}>{b.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>{b.customerEmail}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>{b.customerPhone}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy-900)' }}>{b.vehicleMake} {b.vehicleModel}</div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontFamily: 'monospace', 
                      color: 'var(--color-blue-600)',
                      marginTop: '0.15rem'
                    }}>
                      {b.vehicleRegistration}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
                      {b.pickupDate} &rarr; {b.returnDate}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '0.15rem' }}>
                      {b.rentalDays} {b.rentalDays === 1 ? 'day' : 'days'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-navy-900)', fontSize: '0.95rem' }}>
                      LKR {Number(b.finalTotal || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Daily: LKR {Number(b.dailyRate || 0).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                          {b.paymentMethod || 'CASH'}
                        </span>
                        <StatusBadge status={b.paymentStatus || 'PENDING'} />
                      </div>

                      {/* Direct Confirm Payment Button if payment is not yet marked as PAID */}
                      {b.paymentStatus !== 'PAID' && b.status !== 'REJECTED' && b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleOpenPaymentModal(b)}
                          className="btn btn-sm"
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.55rem',
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          title="Verify and record payment as PAID"
                        >
                          <DollarSign size={12} /> Confirm Payment
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <StatusBadge status={b.status} />
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                      {/* PENDING: Check Payment & Approve or Reject */}
                      {b.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleOpenReview(b, 'CONFIRMED')}
                            className="btn btn-sm"
                            style={{ 
                              backgroundColor: '#10b981', 
                              color: '#fff', 
                              fontSize: '0.75rem', 
                              padding: '0.35rem 0.7rem', 
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontWeight: 600
                            }}
                            title="Check Payment and Approve Booking"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleOpenReview(b, 'REJECTED')}
                            className="btn btn-sm btn-danger"
                            style={{ 
                              fontSize: '0.75rem', 
                              padding: '0.35rem 0.7rem', 
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontWeight: 600
                            }}
                            title="Reject Booking (Removes from desk)"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}

                      {/* ALREADY APPROVED */}
                      {b.status === 'CONFIRMED' && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#10b981', 
                          fontWeight: 700, 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.25rem',
                          padding: '0.3rem 0.6rem',
                          backgroundColor: '#ecfdf5',
                          borderRadius: '4px',
                          border: '1px solid #a7f3d0'
                        }}>
                          <CheckCircle2 size={14} /> Approved
                        </span>
                      )}

                      {/* View Booking Details */}
                      <Link
                        to={`/customer/bookings/${b.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.55rem', display: 'inline-flex', alignItems: 'center' }}
                        title="View Full Booking Voucher"
                      >
                        <Eye size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. Review Modal (Approve / Reject) */}
      {showReviewModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--color-navy-900)',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {reviewAction === 'CONFIRMED' ? (
                <>
                  <CheckCircle2 size={22} color="#10b981" />
                  Verify Payment & Approve Booking
                </>
              ) : (
                <>
                  <AlertTriangle size={22} color="#e11d48" />
                  Reject Customer Booking
                </>
              )}
            </h3>

            {/* Booking & Payment Summary Card */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e2e8f0',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Booking Reference:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--color-blue-600)' }}>{selectedBooking.bookingReference}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <strong>{selectedBooking.customerName} ({selectedBooking.customerPhone})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Vehicle:</span>
                <strong>{selectedBooking.vehicleMake} {selectedBooking.vehicleModel} [{selectedBooking.vehicleRegistration}]</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Hire Period:</span>
                <span>{selectedBooking.pickupDate} &rarr; {selectedBooking.returnDate} ({selectedBooking.rentalDays} days)</span>
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.25rem 0' }} />

              {/* Payment Details Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Total Rental Fee:</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--color-navy-900)' }}>
                  LKR {Number(selectedBooking.finalTotal || 0).toLocaleString()}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Payment Method:</span>
                <strong style={{ color: '#2563eb' }}>{selectedBooking.paymentMethod || 'CASH'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Current Payment Status:</span>
                <StatusBadge status={selectedBooking.paymentStatus || 'PENDING'} />
              </div>
              {selectedBooking.notes && (
                <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <strong>Customer Note:</strong> {selectedBooking.notes}
                </div>
              )}
            </div>

            {/* Checkbox for simultaneously marking payment as received upon confirmation */}
            {reviewAction === 'CONFIRMED' && selectedBooking.paymentStatus !== 'PAID' && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-sm)'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={markPaymentReceived}
                    onChange={(e) => setMarkPaymentReceived(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ color: '#166534', fontWeight: 600 }}>
                    Confirm & Mark Payment of LKR {Number(selectedBooking.finalTotal || 0).toLocaleString()} as Received (PAID)
                  </span>
                </label>
              </div>
            )}

            {reviewAction === 'REJECTED' && (
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Reason for Rejection <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <textarea
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Payment proof invalid, driving licence issue, or vehicle scheduled for urgent maintenance..."
                  className="form-textarea"
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Once rejected, this booking will be removed from your active desk and logged in Rejected History.
                </p>
              </div>
            )}

            {reviewAction === 'CONFIRMED' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '1rem' }}>
                Approving this booking locks the reservation and creates the confirmed booking contract for the customer.
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewing}
                onClick={handleConfirmReview}
                className={`btn ${reviewAction === 'CONFIRMED' ? 'btn-primary' : 'btn-danger'}`}
                style={{ backgroundColor: reviewAction === 'CONFIRMED' ? '#10b981' : undefined }}
              >
                {reviewing ? 'Processing...' : reviewAction === 'CONFIRMED' ? 'Approve & Confirm' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Dedicated Payment Confirmation Modal (Direct Action) */}
      {paymentModalBooking && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Receipt size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-navy-900)', margin: 0 }}>
                  Confirm Customer Payment
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Booking #{paymentModalBooking.bookingReference}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmDirectPayment}>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '0.85rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Customer:</span>
                  <strong>{paymentModalBooking.customerName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Vehicle:</span>
                  <strong>{paymentModalBooking.vehicleMake} {paymentModalBooking.vehicleModel}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Hire Period:</span>
                  <span>{paymentModalBooking.pickupDate} &rarr; {paymentModalBooking.returnDate} ({paymentModalBooking.rentalDays} days)</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Settlement Method</label>
                <select
                  value={paymentMethodChoice}
                  onChange={(e) => setPaymentMethodChoice(e.target.value)}
                  className="form-select"
                >
                  <option value="CASH">CASH (Physical Cash at Desk)</option>
                  <option value="CARD">CARD (POS Credit / Debit Card Terminal)</option>
                  <option value="BANK_TRANSFER">BANK_TRANSFER (Direct Bank Slip / Wire)</option>
                </select>
              </div>

              {/* Amount Input */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Payment Amount (LKR)</label>
                <input
                  type="number"
                  step="any"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Reference Number Input */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Receipt / Transaction Reference Number</label>
                <input
                  type="text"
                  value={paymentRefNumber}
                  onChange={(e) => setPaymentRefNumber(e.target.value)}
                  className="form-input"
                  placeholder="e.g. PAY-123456 or Bank Slip No"
                  required
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Payment Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="form-input"
                  placeholder="Optional verification note..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentModalBooking(null)}
                  className="btn btn-secondary"
                  disabled={recordingPayment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                >
                  {recordingPayment ? 'Recording Payment...' : 'Confirm as PAID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
