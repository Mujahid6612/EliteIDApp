// tokenSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PAuthToken } from "../types";


const initialState: PAuthToken = {
  tokens: {}, // { jobId: token }
};

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    setTokenForJob: (state, action: PayloadAction<{ jobId: string; token: string }>) => {
      state.tokens[action.payload.jobId] = action.payload.token;
    },
    clearTokenForJob: (state, action: PayloadAction<string>) => {
      delete state.tokens[action.payload];
    },
  },
});

export const { setTokenForJob, clearTokenForJob } = tokenSlice.actions;
export default tokenSlice.reducer;
