// authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, JobApiResponse } from "../types";

const initialState: AuthState = {
  isAuthenticated: false,
  jobData: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setJobData: (state, action: PayloadAction<{ jobId: string; data: JobApiResponse | null }>) => {
      state.jobData[action.payload.jobId] = action.payload.data;
      state.isAuthenticated = Object.keys(state.jobData).length > 0;
    },
    clearJobData: (state, action: PayloadAction<string>) => {
      delete state.jobData[action.payload];
      state.isAuthenticated = Object.keys(state.jobData).length > 0;
    },
  },
});

export const { setJobData, clearJobData } = authSlice.actions;
export default authSlice.reducer;
