import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bell, CheckCheck, CheckCircle2, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { success, error } = useToast();

  const loadNotifications = () => {
    setLoading(true);
    dashboardService.getNotifications()
      .then((res) => setNotifications(res.data || []))
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await dashboardService.markNotifRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      error(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dashboardService.markAllNotifsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      success('All notifications marked as read.');
    } catch (err) {
      error(err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 size={18} className="text-emerald-600" />;
      case 'ERROR': case 'WARNING': return <AlertCircle size={18} className="text-rose-600" />;
      case 'MAINTENANCE': return <ShieldAlert size={18} className="text-amber-600" />;
      default: return <Info size={18} className="text-blue-600" />;
    }
  };

  return (
    <div style={{ maxWidth: '760px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">In-System Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">Operational updates regarding bookings, payments, and fleet alerts</p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck size={16} /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={36} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900 mb-1">No Notifications</h3>
          <p className="text-xs text-slate-500">You are all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card p-4 flex items-start gap-4"
              style={{
                backgroundColor: n.isRead ? 'var(--color-white)' : 'var(--color-blue-50)',
                borderLeft: n.isRead ? '1px solid var(--color-slate-200)' : '4px solid var(--color-blue-600)'
              }}
            >
              <div style={{ marginTop: '0.2rem' }}>
                {getIcon(n.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div className="flex items-baseline justify-between mb-1">
                  <h4 className="text-sm font-bold text-navy-900">{n.title}</h4>
                  <span className="text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
