import { baseApi } from "@/store/baseApi";
import type { Reproduction } from "@/types/reproduction";
import type { Pigeon } from "@/types/pigeon";
import type {
  ReproductionCreateValues,
  ReproductionUpdateValues,
  GenerateOffspringValues,
} from "@/lib/schemas/reproduction";

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

type RawReproductionPage = { data: Reproduction[]; meta: PaginationMeta };
type SingleReproduction = { data: Reproduction };

export type ReproductionPage = { data: Reproduction[]; meta: PaginationMeta };

export interface ReproductionPageParams {
  page?: number;
  per_page?: number;
  "filter[statut]"?: string;
  "filter[couple_id]"?: number;
}

export interface ReproductionListParams {
  per_page?: number;
  "filter[statut]"?: string;
  "filter[couple_id]"?: number;
  include?: string;
}

export const reproductionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Paginated — used by the reproductions list page
    getReproductionsPage: build.query<ReproductionPage, ReproductionPageParams | void>({
      query: (params = {}) => ({
        url: "reproductions",
        params: { per_page: 15, include: "couple.male,couple.femelle,pigeons", ...params },
      }),
      transformResponse: (response: RawReproductionPage): ReproductionPage => response,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Reproduction" as const, id })),
              { type: "Reproduction", id: "LIST" },
            ]
          : [{ type: "Reproduction", id: "LIST" }],
    }),

    // Flat array — kept for backwards compatibility
    getReproductions: build.query<Reproduction[], ReproductionListParams | void>({
      query: (params = {}) => ({
        url: "reproductions",
        params: { per_page: 100, include: "couple.male,couple.femelle,pigeons", ...params },
      }),
      transformResponse: (response: RawReproductionPage) => response.data,
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

    updateReproduction: build.mutation<Reproduction, { id: number; data: ReproductionUpdateValues }>({
      query: ({ id, data }) => ({
        url: `reproductions/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: SingleReproduction) => response.data,
      invalidatesTags: (_, __, { id }) => [
        { type: "Reproduction", id },
        { type: "Reproduction", id: "LIST" },
      ],
    }),

    deleteReproduction: build.mutation<void, number>({
      query: (id) => ({ url: `reproductions/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [
        { type: "Reproduction", id },
        { type: "Reproduction", id: "LIST" },
      ],
    }),

    generateOffspring: build.mutation<Pigeon[], { reproductionId: number; data: GenerateOffspringValues }>({
      query: ({ reproductionId, data }) => ({
        url: `reproductions/${reproductionId}/pigeons`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: Pigeon[] }) => response.data,
      invalidatesTags: (_, __, { reproductionId }) => [
        { type: "Reproduction", id: reproductionId },
        { type: "Reproduction", id: "LIST" },
        { type: "Pigeon", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReproductionsPageQuery,
  useGetReproductionsQuery,
  useGetReproductionQuery,
  useCreateReproductionMutation,
  useUpdateReproductionMutation,
  useDeleteReproductionMutation,
  useGenerateOffspringMutation,
} = reproductionApi;
