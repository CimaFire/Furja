import { createSlice } from '@reduxjs/toolkit';

export const createAuthSlice = ({ persistUser, persistToken, loadUser, loadToken, clearStorage }) => {
  return createSlice({
    name: 'auth',
    initialState: {
      user: loadUser ? loadUser() : null,
      token: loadToken ? loadToken() : null,
      isLoading: false,
      error: null
    },
    reducers: {
      setUser: (state, action) => {
        state.user = action.payload;
        if (persistUser) persistUser(action.payload);
      },
      setToken: (state, action) => {
        state.token = action.payload;
        if (persistToken) persistToken(action.payload);
      },
      setLoading: (state, action) => {
        state.isLoading = action.payload;
      },
      setError: (state, action) => {
        state.error = action.payload;
      },
      logout: (state) => {
        state.user = null;
        state.token = null;
        if (clearStorage) clearStorage();
      }
    }
  });
};
