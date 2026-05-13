import { baseApi } from "@/store/baseApi";
import type { CoupleSummary } from "@/types/couple";
import { getMockCouples } from "@/services/mock/couples";
import type { CoupleCreateValues } from "@/lib/schemas/couple";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const coupleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCouples: build.query<CoupleSummary[], void>({
      queryFn: async () => {
        await sleep(150);
        return { data: getMockCouples() };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Couple" as const, id })),
              { type: "Couple", id: "LIST" },
            ]
          : [{ type: "Couple", id: "LIST" }],
    }),

    getCouple: build.query<CoupleSummary | undefined, string>({
      queryFn: async (id) => {
        await sleep(100);
        return { data: getMockCouples().find((c) => c.id === id) };
      },
      providesTags: (_, __, id) => [{ type: "Couple", id }],
    }),

    createCouple: build.mutation<CoupleSummary, CoupleCreateValues>({
      queryFn: async (values) => {
        await sleep(350);
        const couple: CoupleSummary = {
          id: `C-${String(Date.now()).slice(-3)}`,
          male: values.male,
          femelle: values.femelle,
          cage: values.cage,
          date: values.date,
          active: true,
          reproductions: 0,
        };
        return { data: couple };
      },
      invalidatesTags: [{ type: "Couple", id: "LIST" }],
    }),

    breakCouple: build.mutation<void, string>({
      queryFn: async () => {
        await sleep(300);
        return { data: undefined };
      },
      invalidatesTags: (_, __, id) => [
        { type: "Couple", id },
        { type: "Couple", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCouplesQuery,
  useGetCoupleQuery,
  useCreateCoupleMutation,
  useBreakCoupleMutation,
} = coupleApi;
