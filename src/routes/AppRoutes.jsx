// src/routes/AppRoutes.jsx
import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../assets/Layout";

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
import TenantCreatePage from '../pages/Tenant/TenantCreatePage.jsx';
import TenantDetailPage from '../pages/Tenant/TenentDetailPage.jsx';
import MeterManagementPage from '../pages/Meter/MeterManagementPage.jsx';
import LiffRegisterPage from '../pages/LiffRegister';
import Watcher from '../pages/MeterWatcher/Watcher';
import LockReservesPage from '../pages/Reserve/LockReservesPage';
// import NavigationBar from './src/components/NavigationBar.jsx';

import PrivateRoute from "./PrivateRoute.jsx";

const AppRoutes = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (

    <Fragment>
      <Routes>
        <Route exact path='/liff-register' element={<LiffRegisterPage />} />
        <Route exact path='/login' element={<LoginPage />} />
        <Route exact path='/watcher' element={<Watcher />} />


        <Route exact path='/' element={<PrivateRoute />}>
          <Route exact path='/' element={<DashboardPage />} />

          <Route exact path='/zones' element={<ZoneListPage />} />
          <Route exact path='/locks' element={<LockListPage />} />
          <Route exact path="/locks/new" element={<LockCreatePage />} />
          <Route exact path="/locks/:id" element={<LockDetailPage />} />
          <Route exact path='/billings' element={<BillingListPage />} />
          <Route exact path='/tenant-list' element={<TenantListPage />} />
          <Route exact path='/tenants/new' element={<TenantCreatePage />} />
          <Route exact path='/tenants/:id' element={<TenantDetailPage />} />
          <Route exact path='/meters' element={<MeterManagementPage />} />
          <Route exact path='/settings' element={<SettingsPage />} />
          <Route exact path='/reserves' element={<LockReservesPage />} />

        </Route>
      </Routes>
    </Fragment>

    // <Routes>
    //   {!isAuthenticated && (
    //     <Route path="/login" element={<LoginPage />} />
    //   )}
    //    <Route path="/liff-register" element={<LiffRegisterPage />} />

    //   {isAuthenticated ? (
    //     <>
    //     <Layout>
    //     <Route path="/" element={<DashboardPage />} />
    //       <Route path="/zones" element={<ZoneListPage />} />
    //       <Route path="/locks" element={<LockListPage />} />
    //       <Route path="/locks/new" element={<LockCreatePage />} />
    //       <Route path="/locks/:id" element={<LockDetailPage />} />
    //       <Route path="/billings" element={<BillingListPage />} />
    //       <Route path="/tenant-list" element={<TenantListPage />} />
    //       <Route path="/tenants/new" element={<TenantCreatePage />} />
    //       <Route path="/tenants/:id" element={<TenantDetailPage />} />
    //       <Route path="/meters" element={<MeterManagementPage />} />



    //       <Route path="/settings" element={<SettingsPage />} />
    //     </Layout>

    //       <Route path="*" element={<Navigate to="/" />} />
    //     </>
    //   ) : (
    //     <Route path="*" element={<Navigate to="/login" />} />
    //   )}
    // </Routes>
  );
};

export default AppRoutes;
