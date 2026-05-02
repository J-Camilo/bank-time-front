import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    dark: localStorage.getItem('theme') === 'dark',
  },
  reducers: {
    toggleTheme(state) {
      state.dark = !state.dark;
      localStorage.setItem('theme', state.dark ? 'dark' : 'light');
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
