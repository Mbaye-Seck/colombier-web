import { configureStore, type Middleware } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { authSlice, clearAuth } from "./slices/authSlice";
import { themeSlice } from "./slices/themeSlice";
import { uiSlice } from "./slices/uiSlice";
import { baseApi } from "./baseApi";

// Whenever clearAuth() fires (logout OR a 401 interceptor), immediately wipe
// the RTK Query cache so no stale data from the previous session can bleed
// into the next user's session.
const authCacheResetMiddleware: Middleware = (api) => (next) => (action) => {
  const result = next(action);
  if (clearAuth.match(action)) {
    api.dispatch(baseApi.util.resetApiState());
  }
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    theme: themeSlice.reducer,
    ui: uiSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(authCacheResetMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
