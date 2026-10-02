import React, { useState, useEffect } from 'react';
import { 
  Car, Plus, Search, Filter, Edit3, Trash2, 
  CheckCircle2, AlertTriangle, Eye, Info, X
} from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

export default function StaffFleetPage() {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    categoryId: '',
    registrationNumber: '',
    colour: 'White',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    seats: 5,
    dailyRate: 12000,
    currentMileage: 10000,
    status: 'AVAILABLE',
    description: 'Air Conditioning, Bluetooth, Reverse Camera, ABS',
    primaryImageUrl: ''
  });

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehRes, catRes] = await Promise.all([
        vehicleService.searchVehicles({ limit: 100 }),
        vehicleService.getCategories()
      ]);

      const vehData = vehRes?.data?.data || vehRes?.data;
      setVehicles(vehData?.content || (Array.isArray(vehData) ? vehData : []));

      const catData = catRes?.data?.data || catRes?.data;
      setCategories(Array.isArray(catData) ? catData : (catData?.content || []));
    } catch (err) {
      showError(err.message || 'Failed to load fleet catalogue');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      categoryId: categories[0]?.id || '',
      registrationNumber: '',
      colour: 'White',
      transmission: 'AUTOMATIC',
      fuelType: 'PETROL',
      seats: 5,
      dailyRate: 12000,
      currentMileage: 10000,
      status: 'AVAILABLE',
      description: 'Air Conditioning, Bluetooth, Reverse Camera, ABS',
      primaryImageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      make: v.make || v.brand || '',
      model: v.model || '',
      year: v.year || 2023,
      categoryId: v.categoryId || categories[0]?.id || '',
      registrationNumber: v.registrationNumber || v.licensePlate || '',
      colour: v.colour || v.color || 'White',
      transmission: v.transmission || 'AUTOMATIC',
      fuelType: v.fuelType || 'PETROL',
      seats: v.seats || v.seatingCapacity || 5,
      dailyRate: v.dailyRate || 10000,
      currentMileage: v.currentMileage || v.mileage || 0,
      status: v.status || 'AVAILABLE',
      description: v.description || (Array.isArray(v.features) ? v.features.join(', ') : (v.features || '')),
      primaryImageUrl: v.primaryImageUrl || (v.images && v.images[0]?.imageUrl) || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        categoryId: Number(formData.categoryId),
        registrationNumber: (formData.registrationNumber || '').trim(),
        make: (formData.make || '').trim(),
        model: (formData.model || '').trim(),
        year: Number(formData.year),
        colour: (formData.colour || 'White').trim(),
        seats: Number(formData.seats),
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        dailyRate: Number(formData.dailyRate),
        currentMileage: Number(formData.currentMileage || 0),
        status: formData.status || 'AVAILABLE',
        description: formData.description || '',
        primaryImageUrl: formData.primaryImageUrl || ''
      };

      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, payload);
        showSuccess(`Vehicle ${payload.make} ${payload.model} updated successfully!`);
      } else {
        await vehicleService.createVehicle(payload);
        showSuccess(`New vehicle ${payload.make} ${payload.model} added to fleet!`);
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;
    const targetId = vehicleToDelete.id;
    try {
      try {
        await vehicleService.deleteVehicle(targetId);
      } catch (delErr) {
        // Fallback to updateStatus INACTIVE if DELETE HTTP endpoint is restricted
        await vehicleService.updateStatus(targetId, 'INACTIVE');
      }
      const plate = vehicleToDelete.registrationNumber || vehicleToDelete.licensePlate || `#${targetId}`;
      showSuccess(`Vehicle ${plate} removed from active fleet`);
      setDeleteModalOpen(false);
      // Remove from list immediately in UI
      setVehicles(prev => prev.filter(v => v.id !== targetId));
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to remove vehicle');
    }
  };

  const handleStatusQuickChange = async (vehicleId, newStatus) => {
    try {
      await vehicleService.updateStatus(vehicleId, newStatus);
      showSuccess(`Vehicle status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      showError('Failed to change vehicle status');
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const make = v.make || v.brand || '';
    const model = v.model || '';
    const plate = v.registrationNumber || v.licensePlate || '';
    const matchesSearch = 
      make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'ALL' || v.categoryName?.toLowerCase() === categoryFilter.toLowerCase();
    
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') {
      matchesStatus = v.status !== 'INACTIVE';
    } else if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else {
      matchesStatus = v.status === statusFilter;
    }

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-blue-600)',
              backgroundColor: 'var(--color-blue-50)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)'
            }}>
              Staff Fleet Management
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-900)', margin: 0 }}>
            Fleet Vehicles & Inventory
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> Add New Vehicle
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by brand, model, or license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <option value="ACTIVE">Active Fleet</option>
              <option value="AVAILABLE">Available</option>
              <option value="RENTED">Rented</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Deactivated / Inactive</option>
              <option value="ALL">Show All (Including Deactivated)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      {loading ? (
        <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}><LoadingSpinner text="Loading fleet catalogue..." /></div>
      ) : filteredVehicles.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <Car size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>No Vehicles Found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>
            Try resetting your search query or click "Add New Vehicle".
          </p>
        </div>
      ) : (
        <div className="table-container" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', minWidth: '950px' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Vehicle</th>
                <th style={{ whiteSpace: 'nowrap' }}>Category</th>
                <th style={{ whiteSpace: 'nowrap' }}>Plate & Specs</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Daily Rate</th>
                <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map(v => {
                const img = v.primaryImageUrl || (v.images && v.images[0]?.imageUrl) || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80';
                const make = v.make || v.brand || '';
                const plate = v.registrationNumber || v.licensePlate || `#${v.id}`;
                const colour = v.colour || v.color || 'White';
                const seats = v.seats || v.seatingCapacity || 5;
                return (
                  <tr key={v.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={img}
                          alt={v.model}
                          style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80'; }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-navy-900)' }}>
                            {make} {v.model}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                            {v.year} • {colour}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#475569' }}>
                        {v.categoryName || 'Standard'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-blue-600)', fontSize: '0.8rem' }}>
                        {plate}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                        {v.transmission} • {v.fuelType} • {seats} seats
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                      LKR {Number(v.dailyRate || 0).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <select
                        value={v.status}
                        onChange={(e) => handleStatusQuickChange(v.id, e.target.value)}
                        className="form-select"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.5rem',
                          width: 'auto',
                          display: 'inline-block',
                          color: v.status === 'AVAILABLE' ? '#16a34a' : v.status === 'RENTED' ? '#2563eb' : '#d97706'
                        }}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="RENTED">RENTED</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.5rem' }}
                          title="Edit Vehicle Specifications & Rate"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setVehicleToDelete(v);
                            setDeleteModalOpen(true);
                          }}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.35rem 0.5rem' }}
                          title="Remove Vehicle from Fleet"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Car size={20} color="var(--color-blue-600)" />
                {editingVehicle ? `Edit ${editingVehicle.brand} ${editingVehicle.model}` : 'Add New Vehicle to Fleet'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', marginBottom: '1.25rem' }}>
              Enter vehicle technical specifications, license plate, category, and daily hire rate.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Brand / Make <span style={{ color: 'var(--color-blue-600)' }}>*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="e.g. Toyota, Honda, Nissan, Yamaha"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Model <span style={{ color: 'var(--color-blue-600)' }}>*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Prius, Civic, Vezel, FZ-S"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    min="2000"
                    max="2030"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category <span style={{ color: 'var(--color-blue-600)' }}>*</span></label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                    className="form-select"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">License Plate / Reg No. <span style={{ color: 'var(--color-blue-600)' }}>*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. WP CAA-4412"
                    className="form-input"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    value={formData.colour}
                    onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                    placeholder="e.g. Pearl White"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="form-select"
                  >
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="form-select"
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ELECTRIC">Electric</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Seating Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Daily Hire Rate (LKR) <span style={{ color: 'var(--color-blue-600)' }}>*</span></label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Odometer Mileage (km)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentMileage}
                    onChange={(e) => setFormData({ ...formData, currentMileage: e.target.value })}
                    className="form-input"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle Primary Image URL</label>
                <input
                  type="url"
                  value={formData.primaryImageUrl}
                  onChange={(e) => setFormData({ ...formData, primaryImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description & Features</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Air Conditioning, Bluetooth, Reverse Camera, ABS, Cruise Control"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add to Fleet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && vehicleToDelete && (
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Deactivate Vehicle from Fleet"
          message={`Are you sure you want to remove ${(vehicleToDelete.make || vehicleToDelete.brand || '')} ${(vehicleToDelete.model || '')} (${vehicleToDelete.registrationNumber || vehicleToDelete.licensePlate || `#${vehicleToDelete.id}`}) from active fleet? It will be marked INACTIVE.`}
          confirmText="Yes, Deactivate"
          confirmType="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}
