import { baseApi } from "@/store/baseApi";
import type { Reproduction } from "@/types/reproduction";
import type { ReproductionCreateValues } from "@/lib/schemas/reproduction";

type PaginatedReproductions = { data: Reproduction[] };
type SingleReproduction = { data: Reproduction };

export interface ReproductionListParams {
  per_page?: number;
  "filter[statut]"?: string;
  include?: string;
}

export const reproductionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReproductions: build.query<Reproduction[], ReproductionListParams | void>({
      query: (params = {}) => ({
        url: "reproductions",
        params: { per_page: 100, include: "couple.male,couple.femelle,pigeons", ...params },
      }),
      transformResponse: (response: PaginatedReproductions) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Reproduction" as const, id })),
              { type: "Reproduction", id: "LIST" },
            ]
          : [{ type: "Reproduction", id: "LIST" }],
    }),

    getReproduction: build.query<Reproduction, number>({
      query: (id) => ({
        url: `reproductions/${id}`,
        params: { include: "couple.male,couple.femelle,pigeons" },
      }),
      transformResponse: (response: SingleReproduction) => response.data,
      providesTags: (_, __, id) => [{ type: "Reproduction", id }],
    }),

    createReproduction: build.mutation<Reproduction, ReproductionCreateValues>({
      query: (body) => ({
        url: "reproductions",
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleReproduction) => response.data,
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
