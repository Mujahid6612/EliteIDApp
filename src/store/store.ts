// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import authReducer from "./authSlice";
import currentViewReducer from "./currentViewSlice";
import tokenReducer from "./tokenSlice" 

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "token", "currentView"], // Persist only the auth slice
};

const rootReducer = combineReducers({
  auth: authReducer,
  currentView: currentViewReducer,
  token: tokenReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export default store;
