// tokenSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PAuthToken } from "../types";

const initialState: PAuthToken = {
  token: "",
};

const tokenSlice = createSlice({
    name: "token",
    initialState,
    reducers: {
      setCurrentToken: (state, action: PayloadAction<string>) => {
        state.token = action.payload;
      },
    },
  });
  

export const { setCurrentToken } = tokenSlice.actions;
export default tokenSlice.reducer;
