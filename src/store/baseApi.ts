import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Central RTK Query base API.
 *
 * All domain API slices inject into this instance.
 * Replace fakeBaseQuery with fetchBaseQuery when wiring the Laravel API:
 *
 *   baseQuery: fetchBaseQuery({
 *     baseUrl: import.meta.env.VITE_API_URL,
 *     prepareHeaders: (headers, { getState }) => {
 *       const token = (getState() as RootState).auth.token;
 *       if (token) headers.set("Authorization", `Bearer ${token}`);
 *       return headers;
 *     },
 *   }),
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery<string>(),
  tagTypes: ["Pigeon", "Couple", "Cage", "Reproduction", "Exit", "Notification", "Auth"],
  endpoints: () => ({}),
});
