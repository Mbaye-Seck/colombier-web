import { baseApi } from "@/store/baseApi";
import type { ReproductionCard } from "@/types/reproduction";
import { getMockReproductions } from "@/services/mock/reproductions";
import type { ReproductionCreateValues } from "@/lib/schemas/reproduction";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const reproductionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReproductions: build.query<ReproductionCard[], void>({
      queryFn: async () => {
        await sleep(150);
        return { data: getMockReproductions() };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Reproduction" as const, id })),
              { type: "Reproduction", id: "LIST" },
            ]
          : [{ type: "Reproduction", id: "LIST" }],
    }),

    getReproduction: build.query<ReproductionCard | undefined, string>({
      queryFn: async (id) => {
        await sleep(100);
        return { data: getMockReproductions().find((r) => r.id === id) };
      },
      providesTags: (_, __, id) => [{ type: "Reproduction", id }],
    }),

    createReproduction: build.mutation<ReproductionCard, ReproductionCreateValues>({
      queryFn: async (values) => {
        await sleep(350);
        const record: ReproductionCard = {
          id: `R-${String(Date.now()).slice(-3)}`,
          couple: values.coupleId,
          pere: "—",
          mere: "—",
          ponte: values.ponte,
          eclosion: values.eclosionPrevue ?? "—",
          jeunes: 0,
          jeunesIds: [],
        };
        return { data: record };
      },
      invalidatesTags: [{ type: "Reproduction", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReproductionsQuery,
  useGetReproductionQuery,
  useCreateReproductionMutation,
} = reproductionApi;
