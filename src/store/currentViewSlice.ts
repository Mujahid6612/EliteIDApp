// currentViewSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrentViewState } from "../types";

const initialState: CurrentViewState = {
  currentRoutes: {},
};

const currentViewSlice = createSlice({
  name: "currentView",
  initialState,
  reducers: {
    setCurrentRoute: (state, action: PayloadAction<{ jobId: string; route: string }>) => {
      state.currentRoutes[action.payload.jobId] = action.payload.route;
    },
    clearCurrentRoute: (state, action: PayloadAction<string>) => {
      delete state.currentRoutes[action.payload];
    },
  },
});

export const { setCurrentRoute, clearCurrentRoute } = currentViewSlice.actions;
export default currentViewSlice.reducer;

