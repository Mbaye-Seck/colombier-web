import { baseApi } from "@/store/baseApi";
import type { Pigeon } from "@/types/pigeon";
import type { PigeonCreateValues, PigeonUpdateValues } from "@/lib/schemas/pigeon";

type PaginatedPigeons = { data: Pigeon[] };
type SinglePigeon = { data: Pigeon };

export interface PigeonListParams {
  page?: number;
  per_page?: number;
  "filter[sexe]"?: string;
  "filter[statut]"?: string;
  "filter[race]"?: string;
  "filter[search]"?: string;
  sort?: string;
  include?: string;
}

export const pigeonApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPigeons: build.query<Pigeon[], PigeonListParams | void>({
      query: (params = {}) => ({
        url: "pigeons",
        params: { per_page: 100, ...params },
      }),
      transformResponse: (response: PaginatedPigeons) => response.data,
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

    createPigeon: build.mutation<Pigeon, PigeonCreateValues>({
      query: (body) => ({
        url: "pigeons",
        method: "POST",
        body,
      }),
      transformResponse: (response: SinglePigeon) => response.data,
      invalidatesTags: [{ type: "Pigeon", id: "LIST" }],
    }),

    updatePigeon: build.mutation<Pigeon, { id: number; data: PigeonUpdateValues }>({
      query: ({ id, data }) => ({
        url: `pigeons/${id}`,
        method: "PATCH",
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
  }),
  overrideExisting: false,
});

export const {
  useGetPigeonsQuery,
  useGetPigeonQuery,
  useCreatePigeonMutation,
  useUpdatePigeonMutation,
  useDeletePigeonMutation,
} = pigeonApi;
