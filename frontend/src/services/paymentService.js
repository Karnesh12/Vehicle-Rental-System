import api from './api';

export const paymentService = {
  recordPayment: (data) => api.post('/payments', data),
  getBookingPayments: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  getAllPayments: (params) => api.get('/payments', { params })
};
