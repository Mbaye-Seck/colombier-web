import { baseApi } from "@/store/baseApi";
import { loginMock } from "@/lib/auth";
import type { AuthSession } from "@/lib/auth";
import type { LoginFormValues } from "@/lib/schemas/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthSession, LoginFormValues>({
      queryFn: async ({ email, password }) => {
        try {
          const session = await loginMock(email, password);
          return { data: session };
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Échec de la connexion." };
        }
      },
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;
