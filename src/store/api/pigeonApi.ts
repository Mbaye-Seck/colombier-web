import { baseApi } from "@/store/baseApi";
import type { Pigeon } from "@/types/pigeon";
import { getMockPigeons } from "@/services/mock/pigeons";
import type { PigeonCreateValues } from "@/lib/schemas/pigeon";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const pigeonApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPigeons: build.query<Pigeon[], void>({
      queryFn: async () => {
        await sleep(150);
        return { data: getMockPigeons() };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ ring }) => ({ type: "Pigeon" as const, id: ring })),
              { type: "Pigeon", id: "LIST" },
            ]
          : [{ type: "Pigeon", id: "LIST" }],
    }),

    getPigeon: build.query<Pigeon | undefined, string>({
      queryFn: async (ring) => {
        await sleep(100);
        return { data: getMockPigeons().find((p) => p.ring === ring) };
      },
      providesTags: (_, __, ring) => [{ type: "Pigeon", id: ring }],
    }),

    createPigeon: build.mutation<Pigeon, PigeonCreateValues>({
      queryFn: async (values) => {
        await sleep(300);
        const pigeon: Pigeon = {
          ring: values.ring,
          sex: values.sexe,
          race: values.race,
          couleur: "—",
          age: "< 1 an",
          statut: "Actif",
          cage: "—",
        };
        return { data: pigeon };
      },
      invalidatesTags: [{ type: "Pigeon", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPigeonsQuery,
  useGetPigeonQuery,
  useCreatePigeonMutation,
} = pigeonApi;
