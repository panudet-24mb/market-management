import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import zoneService from '../services/zoneService';

export const fetchZones = createAsyncThunk('zone/fetchZones', async () => {
  const response = await zoneService.getZones();
  return response; 
});

const zoneSlice = createSlice({
  name: 'zone',
  initialState: {
    zones: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchZones.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchZones.fulfilled, (state, action) => {
        state.loading = false;
        state.zones = action.payload;
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      });
  }
});

export default zoneSlice.reducer;
