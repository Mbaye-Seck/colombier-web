import { baseApi } from "@/store/baseApi";
import type { Couple } from "@/types/couple";
import type { CoupleCreateValues, CoupleUpdateValues } from "@/lib/schemas/couple";

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

type RawCouplePage = { data: Couple[]; meta: PaginationMeta };
type SingleCouple = { data: Couple };

export type CouplePage = { data: Couple[]; meta: PaginationMeta };

export interface CouplePageParams {
  page?: number;
  per_page?: number;
  "filter[statut]"?: string;
}

export interface CoupleListParams {
  per_page?: number;
  "filter[statut]"?: string;
  include?: string;
}

export const coupleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Paginated — used by the couples list page
    getCouplesPage: build.query<CouplePage, CouplePageParams | void>({
      query: (params = {}) => ({
        url: "couples",
        params: { per_page: 15, include: "male,femelle", ...params },
      }),
      transformResponse: (response: RawCouplePage): CouplePage => response,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Couple" as const, id })),
              { type: "Couple", id: "LIST" },
            ]
          : [{ type: "Couple", id: "LIST" }],
    }),

    // Flat array — used by dropdowns (reproduction create form)
    getCouples: build.query<Couple[], CoupleListParams | void>({
      query: (params = {}) => ({
        url: "couples",
        params: { per_page: 100, include: "male,femelle", ...params },
      }),
      transformResponse: (response: RawCouplePage) => response.data,
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

    deleteCouple: build.mutation<void, number>({
      query: (id) => ({ url: `couples/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [
        { type: "Couple", id },
        { type: "Couple", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCouplesPageQuery,
  useGetCouplesQuery,
  useGetCoupleQuery,
  useCreateCoupleMutation,
  useUpdateCoupleMutation,
  useBreakCoupleMutation,
  useDeleteCoupleMutation,
} = coupleApi;
