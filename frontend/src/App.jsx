import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import VehicleCataloguePage from './pages/VehicleCataloguePage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import AvailabilitySearchPage from './pages/AvailabilitySearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Customer Pages
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import BookingFormPage from './pages/BookingFormPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import LicenceManagementPage from './pages/LicenceManagementPage';
import NotificationsPage from './pages/NotificationsPage';

// Staff Pages
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffFleetPage from './pages/staff/StaffFleetPage';
import StaffBookingsPage from './pages/staff/StaffBookingsPage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages with MainLayout (Nav + Main + Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogue" element={<VehicleCataloguePage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
        <Route path="/search" element={<AvailabilitySearchPage />} />
        <Route path="/availability" element={<AvailabilitySearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Booking flow (supporting both /book/:vehicleId and /booking/:vehicleId) */}
        <Route 
          path="/book/:vehicleId" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN']}>
              <BookingFormPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/booking/:vehicleId" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN']}>
              <BookingFormPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/booking-confirmation/:id" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN']}>
              <BookingConfirmationPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/booking/confirmation/:id" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN']}>
              <BookingConfirmationPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Customer Portal (100% Untouched) */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboardPage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetailsPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="licence" element={<LicenceManagementPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Staff Operations Portal */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboardPage />} />
        <Route path="fleet" element={<StaffFleetPage />} />
        <Route path="bookings" element={<StaffBookingsPage />} />
        {/* Redirect any old links to staff dashboard */}
        <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
      </Route>

      {/* Legacy Admin Redirect to Staff Portal */}
      <Route path="/admin/*" element={<Navigate to="/staff/dashboard" replace />} />

      {/* 404 Catch-all */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
