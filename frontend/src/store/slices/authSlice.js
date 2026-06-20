import { createAuthSlice } from '../../../../shared/store/slices/authSlice';

const authSlice = createAuthSlice({
  loadUser: () => JSON.parse(localStorage.getItem('user')),
  loadToken: () => localStorage.getItem('token'),
  persistUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  persistToken: (token) => localStorage.setItem('token', token),
  clearStorage: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
});

export const { setUser, setToken, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
