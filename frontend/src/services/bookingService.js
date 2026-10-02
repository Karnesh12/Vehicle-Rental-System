import api from './api';

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getAllBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getBookingByRef: (ref) => api.get(`/bookings/ref/${ref}`),
  reviewBooking: (id, data) => api.post(`/bookings/${id}/review`, data),
  cancelBooking: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason })
};
