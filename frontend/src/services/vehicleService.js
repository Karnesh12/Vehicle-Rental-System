import api from './api';

export const vehicleService = {
  searchVehicles: (params) => api.get('/vehicles', { params }),
  getVehicle: (id) => api.get(`/vehicles/${id}`),
  createVehicle: (data) => api.post('/vehicles', data),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data),
  updateStatus: (id, status) => api.patch(`/vehicles/${id}/status?status=${status}`),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),
  uploadImage: (id, file, isPrimary = false) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/vehicles/${id}/images?isPrimary=${isPrimary}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadStandaloneImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/vehicles/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  checkAvailability: (data) => api.post('/availability/check', data)
};
