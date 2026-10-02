import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { inspectionService } from '../services/inspectionService';
import { paymentService } from '../services/paymentService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Car,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  CornerUpRight,
  CornerDownLeft,
  ArrowLeft
} from 'lucide-react';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingService.getBookingById(id),
      inspectionService.getBookingInspections(id),
      paymentService.getBookingPayments(id)
    ])
      .then(([bRes, inspRes, payRes]) => {
        setBooking(bRes.data);
        setInspections(inspRes.data || []);
        setPayments(payRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Retrieving comprehensive trip file..." fullScreen />;
  if (!booking) return <div className="p-12 text-center text-slate-500">Booking record not found.</div>;

  const handoverInsp = inspections.find((i) => i.inspectionType === 'HANDOVER');
  const returnInsp = inspections.find((i) => i.inspectionType === 'RETURN');

  const formatLKR = (val) => Number(val).toLocaleString('en-LK');

  return (
    <div className="py-8">
      <div className="container max-w-4xl">
        {/* Back Link & Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/customer/bookings" className="btn btn-secondary btn-sm">
              <ArrowLeft size={16} /> Back to Bookings
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">
                Reservation: <span style={{ fontFamily: 'monospace', color: 'var(--color-blue-600)' }}>{booking.bookingReference}</span>
              </h1>
              <span className="text-xs text-slate-500">Created on {new Date(booking.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Vehicle Card */}
          <div className="card p-6 md:col-span-2">
            <h3 className="text-base font-bold text-navy-900 mb-4 pb-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
              <Car size={18} className="text-blue-600" /> Vehicle Information
            </h3>
            <div className="flex items-start gap-4">
              <img
                src={booking.vehiclePrimaryImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
                alt={booking.vehicleModel}
                style={{ width: '130px', height: '90px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <h4 className="text-lg font-bold text-navy-900">{booking.vehicleMake} {booking.vehicleModel}</h4>
                <p className="text-xs text-slate-500 mb-2">
                  Plate: <strong>{booking.vehicleRegistration}</strong> • Category: <strong>{booking.vehicleCategoryName}</strong>
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Calendar size={14} className="text-blue-600" />
                  <span>{booking.pickupDate} &rarr; {booking.returnDate} ({booking.rentalDays} Days)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-navy-900 mb-3 pb-2" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
              Financial Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
              <div className="flex justify-between text-slate-600">
                <span>Daily Rate:</span>
                <span>LKR {formatLKR(booking.dailyRate)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Base Subtotal:</span>
                <span>LKR {formatLKR(booking.rentalSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Late Charges:</span>
                <span>LKR {formatLKR(booking.lateCharges)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Damage Charges:</span>
                <span>LKR {formatLKR(booking.damageCharges)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Additional/Fuel:</span>
                <span>LKR {formatLKR(booking.additionalCharges)}</span>
              </div>
              <div className="flex justify-between font-bold text-navy-900 pt-2" style={{ borderTop: '2px dashed var(--color-slate-200)' }}>
                <span>Final Total:</span>
                <span className="text-lg text-blue-600">LKR {formatLKR(booking.finalTotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500">Payment Status:</span>
                <StatusBadge status={booking.paymentStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* Inspections Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Handover Inspection */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
              <h4 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <CornerUpRight size={18} className="text-emerald-600" /> Handover Inspection
              </h4>
              {handoverInsp ? (
                <span className="badge badge-completed">Recorded</span>
              ) : (
                <span className="badge badge-pending">Pending Handover</span>
              )}
            </div>

            {handoverInsp ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div className="flex justify-between">
                  <span className="text-slate-500">Handover Datetime:</span>
                  <strong>{new Date(handoverInsp.inspectionDatetime).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Start Mileage:</span>
                  <strong>{handoverInsp.mileage?.toLocaleString()} km</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fuel Level:</span>
                  <strong>{handoverInsp.fuelLevel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inspected By:</span>
                  <span>{handoverInsp.inspectedByUserName || 'Staff Officer'}</span>
                </div>
                {handoverInsp.damageNotes && (
                  <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600">
                    <strong>Initial Damage Notes:</strong> {handoverInsp.damageNotes}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 p-4 text-center">
                Vehicle handover inspection will take place when you arrive at the fleet station.
              </p>
            )}
          </div>

          {/* Return Inspection */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
              <h4 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <CornerDownLeft size={18} className="text-blue-600" /> Return Inspection
              </h4>
              {returnInsp ? (
                <span className="badge badge-completed">Completed</span>
              ) : (
                <span className="badge badge-pending">Pending Return</span>
              )}
            </div>

            {returnInsp ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div className="flex justify-between">
                  <span className="text-slate-500">Return Datetime:</span>
                  <strong>{new Date(returnInsp.inspectionDatetime).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Return Mileage:</span>
                  <strong>{returnInsp.mileage?.toLocaleString()} km</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fuel Level:</span>
                  <strong>{returnInsp.fuelLevel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Extra Charges:</span>
                  <strong className="text-rose-600">LKR {formatLKR(returnInsp.totalCharges)}</strong>
                </div>
                {returnInsp.damageNotes && (
                  <div className="mt-2 p-2 bg-rose-50 rounded text-xs text-rose-700">
                    <strong>Return Assessment Notes:</strong> {returnInsp.damageNotes}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 p-4 text-center">
                Return inspection will be conducted and finalized at the end of the rental period.
              </p>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-navy-900 mb-4 pb-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
            <CreditCard size={18} className="text-blue-600" /> Recorded Payments Ledger
          </h3>

          {payments.length === 0 ? (
            <p className="text-xs text-slate-500 p-4 text-center">No payment transactions recorded yet.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Method</th>
                    <th>Amount (LKR)</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace' }}>{p.referenceNumber}</td>
                      <td>{p.paymentMethod}</td>
                      <td><strong>LKR {formatLKR(p.amount)}</strong></td>
                      <td><StatusBadge status={p.paymentStatus} /></td>
                      <td>{new Date(p.paymentDate).toLocaleString()}</td>
                      <td>{p.recordedByUserName || 'Staff'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
