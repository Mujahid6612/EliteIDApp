// authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, JobApiResponse } from "../types";

const initialState: AuthState = {
  isAuthenticated: false,
  jobData: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<JobApiResponse | null>) => {
      state.jobData = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
});

export const { setAuthState } = authSlice.actions;
export default authSlice.reducer;
