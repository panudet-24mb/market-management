// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/Dashboard/DashboardPage.jsx';
import ZoneListPage from '../pages/Zones/ZoneListPage.jsx';
import LockListPage from '../pages/Locks/LockListPage.jsx'; // Import LockListPage
import BillingListPage from '../pages/Billing/BillingListPage.jsx';
import TenantListPage from '../pages/Tenant/TenantListPage.jsx';
import SettingsPage from '../pages/Settings/SettingsPage.jsx';
import LoginPage from '../pages/Auth/LoginPage.jsx';
import { useSelector } from 'react-redux';
import LockCreatePage from '../pages/Locks/LockCreatePage.jsx';
import LockDetailPage from '../pages/Locks/LockDetailPage.jsx';
import TenantCreatePage  from '../pages/Tenant/TenantCreatePage.jsx';
import TenantDetailPage from '../pages/Tenant/TenentDetailPage.jsx';
import MeterManagementPage from '../pages/Meter/MeterManagementPage.jsx';
const AppRoutes = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <Routes>
      {!isAuthenticated && (
        <Route path="/login" element={<LoginPage />} />
      )}
      {isAuthenticated ? (
        <>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/zones" element={<ZoneListPage />} />
          <Route path="/locks" element={<LockListPage />} />
          <Route path="/locks/new" element={<LockCreatePage />} />
          <Route path="/locks/:id" element={<LockDetailPage />} />
          <Route path="/billings" element={<BillingListPage />} />
          <Route path="/tenant-list" element={<TenantListPage />} />
          <Route path="/tenants/new" element={<TenantCreatePage />} />
          <Route path="/tenants/:id" element={<TenantDetailPage />} />
          <Route path="/meters" element={<MeterManagementPage />} />



          <Route path="/settings" element={<SettingsPage />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};

export default AppRoutes;
