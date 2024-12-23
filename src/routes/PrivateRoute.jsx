import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from "../assets/Layout"

const PrivateRoute = () => {
    const { isAuthenticated } = useSelector(state => state.auth);

    return isAuthenticated ? <Layout>
        <Outlet />
    </Layout> : <Navigate to="/login" />;
}

export default PrivateRoute