import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function DashboardLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />
      <div style={{ flex: '1 0 auto', display: 'flex', width: '100%', maxWidth: '1680px', margin: '0 auto', padding: '0 1.5rem' }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, padding: '2rem 1.5rem 2rem 2rem', overflowX: 'auto' }}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
