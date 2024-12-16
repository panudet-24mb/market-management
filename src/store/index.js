import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import zoneReducer from './zoneSlice';
import lockReducer from './lockSlice';
import billingReducer from './billingSlice';
import tenantReducer from './tenantSlice';

// Load persisted auth state from localStorage
const persistedAuth = JSON.parse(localStorage.getItem('authState')) || { isAuthenticated: false, error: null };

const store = configureStore({
  reducer: {
    auth: authReducer,
    zone: zoneReducer,
    lock: lockReducer,
    billing: billingReducer,
    tenant: tenantReducer
  },
  preloadedState: {
    auth: persistedAuth
  }
});

// Subscribe to store changes and persist auth state
store.subscribe(() => {
  const { auth } = store.getState();
  localStorage.setItem('authState', JSON.stringify(auth));
});

export default store;
