import { baseApi } from "@/store/baseApi";
import { clearAuth } from "@/store/slices/authSlice";
import type { AuthUser, AuthSession } from "@/lib/auth";
import type { LoginFormValues } from "@/lib/schemas/auth";

type LoginResponse = { data: AuthUser; token: string };
type MeResponse = { data: AuthUser };

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthSession, LoginFormValues>({
      query: ({ email, password }) => ({
        url: "auth/login",
        method: "POST",
        body: { email, password },
      }),
      transformResponse: (response: LoginResponse): AuthSession => ({
        user: response.data,
        token: response.token,
      }),
      invalidatesTags: ["Auth"],
    }),

    getMe: build.query<AuthUser, void>({
      query: () => "auth/me",
      transformResponse: (response: MeResponse): AuthUser => response.data,
      providesTags: ["Auth"],
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: "auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        // Clear auth immediately (optimistic). The authCacheResetMiddleware in
        // store/index.ts will also reset the RTK Query cache when this fires.
        dispatch(clearAuth());
        try {
          await queryFulfilled;
        } catch {
          // Ignored — session and cache are already cleared locally.
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useGetMeQuery, useLogoutMutation } = authApi;
