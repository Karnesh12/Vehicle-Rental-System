import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Car, Search, Sparkles } from 'lucide-react';

export default function VehicleCataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || 'ALL');
  const [sortBy, setSortBy] = useState('dailyRate');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch categories once
  useEffect(() => {
    vehicleService.getCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  // Fetch vehicles whenever search or category changes
  useEffect(() => {
    setLoading(true);

    const params = {
      page,
      size: 9,
      sortBy,
      sortDir
    };

    if (keyword.trim()) {
      params.keyword = keyword.trim();
    }

    if (selectedCategory && selectedCategory !== 'ALL') {
      params.categoryId = selectedCategory;
    }

    vehicleService.searchVehicles(params)
      .then((res) => {
        const pageData = res.data?.data || res.data;
        const list = pageData?.content || (Array.isArray(pageData) ? pageData : []);
        // Strictly exclude any deactivated / INACTIVE vehicles from the catalogue
        const activeList = list.filter(v => v.status !== 'INACTIVE');
        setVehicles(activeList);
        setTotalPages(pageData?.totalPages || 1);
        setTotalElements(pageData?.totalElements ?? activeList.length);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [keyword, selectedCategory, sortBy, sortDir, page]);

  return (
    <div style={{ backgroundColor: '#070d1d', minHeight: '100vh', padding: '3rem 0 5rem 0', color: '#ffffff' }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Page Title & Stats Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          marginBottom: '2.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                Vehicle Catalogue
              </h1>
            </div>

            {/* Quick Search & Sort Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              {/* Minimal Search Input */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid #1e293b',
                borderRadius: '0.75rem',
                padding: '0.45rem 0.85rem',
                gap: '0.5rem',
                minWidth: '240px'
              }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search model, brand..."
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(0);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    width: '100%'
                  }}
                />
              </div>

              {/* Sort By Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  value={`${sortBy}-${sortDir}`}
                  onChange={(e) => {
                    const [newSort, newDir] = e.target.value.split('-');
                    setSortBy(newSort);
                    setSortDir(newDir);
                    setPage(0);
                  }}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid #1e293b',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="dailyRate-asc">Price: Low to High</option>
                  <option value="dailyRate-desc">Price: High to Low</option>
                  <option value="year-desc">Newest First</option>
                  <option value="make-asc">Make (A to Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Quick Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setPage(0);
              }}
              style={{
                padding: '0.45rem 1.1rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: selectedCategory === 'ALL' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: selectedCategory === 'ALL' ? '#2563eb' : 'rgba(15, 23, 42, 0.6)',
                color: selectedCategory === 'ALL' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Fleet
            </button>

            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.id.toString());
                  setPage(0);
                }}
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: selectedCategory === c.id.toString() ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: selectedCategory === c.id.toString() ? '#2563eb' : 'rgba(15, 23, 42, 0.6)',
                  color: selectedCategory === c.id.toString() ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Grid */}
        {loading ? (
          <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner text="Loading vehicle fleet..." />
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: '#0b1329',
            borderRadius: '1.25rem',
            border: '1px solid #1e293b',
            maxWidth: '500px',
            margin: '2rem auto'
          }}>
            <Car size={42} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              No Vehicles Found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              No vehicles matched your search. Try typing a different model or select "All Fleet".
            </p>
            <button
              type="button"
              onClick={() => {
                setKeyword('');
                setSelectedCategory('ALL');
                setPage(0);
              }}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.5rem',
                color: '#60a5fa',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: page === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid #1e293b',
                    borderRadius: '0.5rem',
                    color: page === 0 ? '#475569' : '#ffffff',
                    fontSize: '0.85rem',
                    cursor: page === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', padding: '0 0.75rem' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: page >= totalPages - 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid #1e293b',
                    borderRadius: '0.5rem',
                    color: page >= totalPages - 1 ? '#475569' : '#ffffff',
                    fontSize: '0.85rem',
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
