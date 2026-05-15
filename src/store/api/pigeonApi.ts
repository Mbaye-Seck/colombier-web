import { baseApi } from "@/store/baseApi";
import type { AncestorNode, ChildPigeon, Pigeon } from "@/types/pigeon";
import type { PigeonCreateValues, PigeonUpdateValues } from "@/lib/schemas/pigeon";

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type PigeonPage = {
  data: Pigeon[];
  meta: PaginationMeta;
};

type RawPigeonPage = { data: Pigeon[]; meta: PaginationMeta };
type SinglePigeon = { data: Pigeon };

export interface PigeonListParams {
  page?: number;
  per_page?: number;
  "filter[sexe]"?: string;
  "filter[statut]"?: string;
  "filter[search]"?: string;
  sort?: string;
  include?: string;
}

export const pigeonApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Paginated list with full metadata — used by the pigeons list page
    getPigeonPage: build.query<PigeonPage, PigeonListParams | void>({
      query: (params = {}) => ({
        url: "pigeons",
        params: { include: "pere,mere", ...params },
      }),
      transformResponse: (response: RawPigeonPage): PigeonPage => response,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Pigeon" as const, id })),
              { type: "Pigeon", id: "LIST" },
            ]
          : [{ type: "Pigeon", id: "LIST" }],
    }),

    // Flat array — used by couple/exit/cage-grid select dropdowns
    getPigeons: build.query<Pigeon[], PigeonListParams | void>({
      query: (params = {}) => ({
        url: "pigeons",
        params: { per_page: 100, ...params },
      }),
      transformResponse: (response: RawPigeonPage) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Pigeon" as const, id })),
              { type: "Pigeon", id: "LIST" },
            ]
          : [{ type: "Pigeon", id: "LIST" }],
    }),

    getPigeon: build.query<Pigeon, number>({
      query: (id) => ({
        url: `pigeons/${id}`,
        params: { include: "pere,mere,sorties" },
      }),
      transformResponse: (response: SinglePigeon) => response.data,
      providesTags: (_, __, id) => [{ type: "Pigeon", id }],
    }),

    createPigeon: build.mutation<Pigeon, FormData | PigeonCreateValues>({
      query: (body) => ({
        url: "pigeons",
        method: "POST",
        body,
      }),
      transformResponse: (response: SinglePigeon) => response.data,
      invalidatesTags: [{ type: "Pigeon", id: "LIST" }],
    }),

    updatePigeon: build.mutation<Pigeon, { id: number; data: FormData | PigeonUpdateValues }>({
      query: ({ id, data }) => ({
        url: `pigeons/${id}`,
        // Use POST + _method=PATCH for FormData (PHP ignores files on PATCH/PUT)
        method: data instanceof FormData ? "POST" : "PATCH",
        body: data,
      }),
      transformResponse: (response: SinglePigeon) => response.data,
      invalidatesTags: (_, __, { id }) => [
        { type: "Pigeon", id },
        { type: "Pigeon", id: "LIST" },
      ],
    }),

    deletePigeon: build.mutation<void, number>({
      query: (id) => ({ url: `pigeons/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [
        { type: "Pigeon", id },
        { type: "Pigeon", id: "LIST" },
      ],
    }),

    getAncestors: build.query<AncestorNode, { id: number; depth?: number }>({
      query: ({ id, depth = 3 }) => ({
        url: `pigeons/${id}/ancestors`,
        params: { depth },
      }),
      transformResponse: (response: { data: AncestorNode }) => response.data,
      providesTags: (_, __, { id }) => [{ type: "Pigeon", id }],
    }),

    getChildren: build.query<ChildPigeon[], number>({
      query: (id) => ({ url: `pigeons/${id}/children` }),
      transformResponse: (response: { data: ChildPigeon[] }) => response.data,
      providesTags: (_, __, id) => [{ type: "Pigeon", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPigeonPageQuery,
  useGetPigeonsQuery,
  useGetPigeonQuery,
  useCreatePigeonMutation,
  useUpdatePigeonMutation,
  useDeletePigeonMutation,
  useGetAncestorsQuery,
  useGetChildrenQuery,
} = pigeonApi;
