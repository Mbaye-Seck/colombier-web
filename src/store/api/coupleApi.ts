import { baseApi } from "@/store/baseApi";
import type { Couple } from "@/types/couple";
import type { CoupleCreateValues, CoupleUpdateValues } from "@/lib/schemas/couple";

type PaginatedCouples = { data: Couple[] };
type SingleCouple = { data: Couple };

export interface CoupleListParams {
  per_page?: number;
  "filter[statut]"?: string;
  "filter[search]"?: string;
  include?: string;
}

export const coupleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCouples: build.query<Couple[], CoupleListParams | void>({
      query: (params = {}) => ({
        url: "couples",
        params: { per_page: 100, include: "male,femelle", ...params },
      }),
      transformResponse: (response: PaginatedCouples) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Couple" as const, id })),
              { type: "Couple", id: "LIST" },
            ]
          : [{ type: "Couple", id: "LIST" }],
    }),

    getCouple: build.query<Couple, number>({
      query: (id) => ({
        url: `couples/${id}`,
        params: { include: "male,femelle,reproductions" },
      }),
      transformResponse: (response: SingleCouple) => response.data,
      providesTags: (_, __, id) => [{ type: "Couple", id }],
    }),

    createCouple: build.mutation<Couple, CoupleCreateValues>({
      query: (body) => ({
        url: "couples",
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleCouple) => response.data,
      invalidatesTags: [{ type: "Couple", id: "LIST" }],
    }),

    updateCouple: build.mutation<Couple, { id: number; data: CoupleUpdateValues }>({
      query: ({ id, data }) => ({
        url: `couples/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: SingleCouple) => response.data,
      invalidatesTags: (_, __, { id }) => [
        { type: "Couple", id },
        { type: "Couple", id: "LIST" },
      ],
    }),

    breakCouple: build.mutation<Couple, number>({
      query: (id) => ({
        url: `couples/${id}`,
        method: "PATCH",
        body: {
          statut: "rompu",
          date_rupture: new Date().toISOString().slice(0, 10),
        },
      }),
      transformResponse: (response: SingleCouple) => response.data,
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
  useUpdateCoupleMutation,
  useBreakCoupleMutation,
} = coupleApi;
