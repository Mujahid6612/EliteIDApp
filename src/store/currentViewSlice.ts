// currentViewSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrentViewState } from "../types";

const initialState: CurrentViewState = {
  currentRoute: "/",
};

const currentViewSlice = createSlice({
  name: "currentView",
  initialState,
  reducers: {
    setCurrentView: (state, action: PayloadAction<string> ) => {
      state.currentRoute = action.payload;
    },
  },
});

export const { setCurrentView } = currentViewSlice.actions;
export default currentViewSlice.reducer;
