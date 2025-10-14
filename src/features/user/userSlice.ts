import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Usuario } from "../../types/Usuario";

interface UserState {
  usuario: Usuario | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  usuario: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<Usuario>) => {
      state.usuario = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.usuario = null;
      state.isAuthenticated = false;
    },
    updateUsuario: (state, action: PayloadAction<Partial<Usuario>>) => {
      if (state.usuario) {
        state.usuario = { ...state.usuario, ...action.payload };
      }
    },
  },
});

export const { login, logout, updateUsuario } = userSlice.actions;
export default userSlice.reducer;