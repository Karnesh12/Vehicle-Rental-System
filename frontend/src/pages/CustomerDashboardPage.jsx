import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Car,
  CalendarCheck,
  Clock,
  Bell,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getCustomerMetrics(),
      dashboardService.getNotifications()
    ])
      .then(([metricsRes, notifsRes]) => {
        setMetrics(metricsRes.data);
        setNotifications(notifsRes.data?.slice(0, 5) || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading customer dashboard..." />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Customer Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your active rentals, upcoming trips, and account verification</p>
        </div>
        <Link to="/catalogue" className="btn btn-primary btn-sm">
          <Car size={16} /> Browse Fleet & Book
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Bookings"
          value={metrics?.customerTotalBookings || 0}
          icon={Car}
          color="blue"
        />
        <MetricCard
          title="Completed Rentals"
          value={metrics?.customerCompletedBookings || 0}
          icon={CalendarCheck}
          color="emerald"
        />
        <MetricCard
          title="Pending Requests"
          value={metrics?.customerPendingRequests || 0}
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Unread Alerts"
          value={metrics?.unreadNotificationsCount || 0}
          icon={Bell}
          color="navy"
        />
      </div>

      {/* Active or Upcoming Alert Cards */}
      {metrics?.activeBooking && (
        <div className="card p-6 mb-8" style={{ borderLeft: '4px solid var(--color-blue-600)', backgroundColor: 'var(--color-blue-50)' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="badge badge-active mb-2">Active Rental In Progress</span>
              <h3 className="text-lg font-bold text-navy-900">
                You are currently driving: {metrics.activeBooking.vehicleMake} {metrics.activeBooking.vehicleModel}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Ref: <strong>{metrics.activeBooking.bookingReference}</strong> • Scheduled Return: <strong>{metrics.activeBooking.returnDate}</strong>
              </p>
            </div>
            <Link to={`/customer/bookings/${metrics.activeBooking.id}`} className="btn btn-primary btn-sm">
              View Rental Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {metrics?.upcomingBooking && (
        <div className="card p-6 mb-8" style={{ borderLeft: '4px solid var(--color-amber-500)', backgroundColor: 'var(--color-amber-50)' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="badge badge-confirmed mb-2">Upcoming Trip Scheduled</span>
              <h3 className="text-lg font-bold text-navy-900">
                Vehicle: {metrics.upcomingBooking.vehicleMake} {metrics.upcomingBooking.vehicleModel}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Pickup Date: <strong>{metrics.upcomingBooking.pickupDate}</strong> • Reference: <strong>{metrics.upcomingBooking.bookingReference}</strong>
              </p>
            </div>
            <Link to={`/customer/bookings/${metrics.upcomingBooking.id}`} className="btn btn-secondary btn-sm">
              Trip Contract <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity & Notifications */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
          <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" /> Recent System Notifications
          </h3>
          <Link to="/notifications" style={{ fontSize: '0.8rem', color: 'var(--color-blue-600)', fontWeight: 600 }}>
            View All
          </Link>
        </div>

        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500 p-4 text-center">No notifications at this time.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div key={n.id} className="p-3 rounded-md bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-navy-900">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
