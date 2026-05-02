import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User { id: number; nombre: string; apellido: string; correo: string; es_admin: boolean; creditos_disponibles: number; promedio_valoracion: number; }
interface AuthState { user: User | null; accessToken: string | null; refreshToken: string | null; }

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
};

const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) { state.user = { ...state.user, ...action.payload }; localStorage.setItem('user', JSON.stringify(state.user)); }
    },
    logout(state) { state.user = null; state.accessToken = null; state.refreshToken = null; localStorage.clear(); },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
