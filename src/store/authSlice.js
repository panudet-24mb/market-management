import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { isAuthenticated: false, error: null },
  reducers: {
    login(state, action) {
      const { username, password } = action.payload;
      if (username === 'admin' && password === '1234') {
        state.isAuthenticated = true;
        state.error = null;
      } else {
        state.error = 'Invalid username or password.';
        state.isAuthenticated = false;
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.error = null;
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
