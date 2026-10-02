import api from './api';

export const dashboardService = {
  getAdminMetrics: () => api.get('/reports/admin'),
  getStaffMetrics: () => api.get('/dashboards/staff'),
  getCustomerMetrics: () => api.get('/dashboards/customer'),
  getAuditLogs: (params) => api.get('/audit-logs', { params }),
  getNotifications: () => api.get('/notifications'),
  getUnreadNotifCount: () => api.get('/notifications/unread-count'),
  markNotifRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllNotifsRead: () => api.patch('/notifications/read-all'),

  // Profile & Users
  getProfile: () => api.get('/customers/profile'),
  updateProfile: (data) => api.put('/customers/profile', data),
  uploadLicence: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/customers/licence', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getStaff: (params) => api.get('/admin/staff', { params }),
  createStaff: (data) => api.post('/admin/staff', data),
  toggleUserStatus: (userId) => api.patch(`/admin/users/${userId}/status`)
};
