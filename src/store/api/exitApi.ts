import { baseApi } from "@/store/baseApi";
import type { Exit } from "@/types/exit";
import { MOCK_EXITS } from "@/services/mock/exits";
import type { ExitCreateValues } from "@/lib/schemas/exit";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const exitApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExits: build.query<Exit[], void>({
      queryFn: async () => {
        await sleep(150);
        return { data: [...MOCK_EXITS] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Exit" as const, id })),
              { type: "Exit", id: "LIST" },
            ]
          : [{ type: "Exit", id: "LIST" }],
    }),

    getExit: build.query<Exit | undefined, string>({
      queryFn: async (id) => {
        await sleep(80);
        return { data: MOCK_EXITS.find((e) => e.id === id) };
      },
      providesTags: (_, __, id) => [{ type: "Exit", id }],
    }),

    createExit: build.mutation<Exit, ExitCreateValues>({
      queryFn: async (values) => {
        await sleep(350);
        const exit: Exit = {
          id: `S-${String(Date.now()).slice(-3)}`,
          ring: values.ring,
          type: values.type,
          date: values.date,
          prix: values.prix,
          acheteur: values.acheteur,
          cause: values.cause,
        };
        return { data: exit };
      },
      invalidatesTags: [{ type: "Exit", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetExitsQuery, useGetExitQuery, useCreateExitMutation } = exitApi;
