import api from './api';

export const inspectionService = {
  performHandover: (data) => api.post('/inspections/handover', data),
  performReturn: (data) => api.post('/inspections/return', data),
  getBookingInspections: (bookingId) => api.get(`/inspections/booking/${bookingId}`)
};
