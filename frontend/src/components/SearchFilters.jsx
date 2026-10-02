import React from 'react';
import { Search, Calendar, RefreshCw } from 'lucide-react';

export default function SearchFilters({
  filters,
  onChange,
  onReset,
  categories = []
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="card p-6 mb-8" style={{ backgroundColor: 'var(--color-white)' }}>
      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
        <div className="flex items-center gap-2">
          <Search size={18} className="text-blue-600" />
          <h4 className="text-base font-bold text-navy-900">Find & Filter Vehicles</h4>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onReset}
        >
          <RefreshCw size={14} /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Keyword Search */}
        <div className="form-group mb-0">
          <label className="form-label">Search Keyword</label>
          <input
            type="text"
            name="keyword"
            className="form-input"
            placeholder="e.g. Prius, Vezel, HiAce..."
            value={filters.keyword || ''}
            onChange={handleChange}
          />
        </div>

        {/* Category */}
        <div className="form-group mb-0">
          <label className="form-label">Category</label>
          <select
            name="categoryId"
            className="form-select"
            value={filters.categoryId || ''}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Pickup Date */}
        <div className="form-group mb-0">
          <label className="form-label flex items-center gap-1">
            <Calendar size={14} className="text-blue-600" /> Pickup Date
          </label>
          <input
            type="date"
            name="pickupDate"
            className="form-input"
            value={filters.pickupDate || ''}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Return Date */}
        <div className="form-group mb-0">
          <label className="form-label flex items-center gap-1">
            <Calendar size={14} className="text-blue-600" /> Return Date
          </label>
          <input
            type="date"
            name="returnDate"
            className="form-input"
            value={filters.returnDate || ''}
            onChange={handleChange}
            min={filters.pickupDate || new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Transmission */}
        <div className="form-group mb-0">
          <label className="form-label">Transmission</label>
          <select
            name="transmission"
            className="form-select"
            value={filters.transmission || ''}
            onChange={handleChange}
          >
            <option value="">All Transmissions</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>

        {/* Fuel Type */}
        <div className="form-group mb-0">
          <label className="form-label">Fuel Type</label>
          <select
            name="fuelType"
            className="form-select"
            value={filters.fuelType || ''}
            onChange={handleChange}
          >
            <option value="">All Fuel Types</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ELECTRIC">Electric</option>
          </select>
        </div>

        {/* Price Min */}
        <div className="form-group mb-0">
          <label className="form-label">Min Daily Rate (LKR)</label>
          <input
            type="number"
            name="minPrice"
            className="form-input"
            placeholder="Min LKR"
            value={filters.minPrice || ''}
            onChange={handleChange}
            step="500"
          />
        </div>

        {/* Price Max */}
        <div className="form-group mb-0">
          <label className="form-label">Max Daily Rate (LKR)</label>
          <input
            type="number"
            name="maxPrice"
            className="form-input"
            placeholder="Max LKR"
            value={filters.maxPrice || ''}
            onChange={handleChange}
            step="500"
          />
        </div>
      </div>
    </div>
  );
}
