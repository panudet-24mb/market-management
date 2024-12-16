// src/store/tenantSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API call to save tenant data
export const saveTenant = createAsyncThunk(
  'tenant/saveTenant',
  async (tenantData) => {
    // In a real scenario, you would POST tenantData to a backend API
    // Here we just mock a response
    return tenantData;
  }
);

const tenantSlice = createSlice({
  name: 'tenant',
  initialState: {
    tenant: null,
    loading: false,
    error: null
  },
  reducers: {
    clearTenantState(state) {
      state.tenant = null;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTenant.fulfilled, (state, action) => {
        state.loading = false;
        state.tenant = action.payload; // saved tenant data
      })
      .addCase(saveTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearTenantState } = tenantSlice.actions;
export default tenantSlice.reducer;
