import { createSlice } from '@reduxjs/toolkit';

const lockSlice = createSlice({
  name: 'lock',
  initialState: {
    locks: [],
    loading: false,
    error: null
  },
  reducers: {}
});

export default lockSlice.reducer;
