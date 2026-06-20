import { createAuthSlice } from '../../../../shared/store/slices/authSlice';

const authSlice = createAuthSlice({});

export const { setUser, setToken, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
