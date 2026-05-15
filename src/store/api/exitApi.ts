import { baseApi } from "@/store/baseApi";
import type { Sortie } from "@/types/exit";
import type { ExitCreateValues } from "@/lib/schemas/exit";

type PaginatedSorties = { data: Sortie[] };
type SingleSortie = { data: Sortie };

export const exitApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExits: build.query<Sortie[], void>({
      query: () => ({
        url: "sorties",
        params: { per_page: 100, include: "pigeon", sort: "-date_sortie" },
      }),
      transformResponse: (response: PaginatedSorties) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Exit" as const, id })),
              { type: "Exit", id: "LIST" },
            ]
          : [{ type: "Exit", id: "LIST" }],
    }),

    getExit: build.query<Sortie, number>({
      query: (id) => ({
        url: `sorties/${id}`,
        params: { include: "pigeon" },
      }),
      transformResponse: (response: SingleSortie) => response.data,
      providesTags: (_, __, id) => [{ type: "Exit", id }],
    }),

    createExit: build.mutation<Sortie, ExitCreateValues>({
      query: (body) => ({
        url: "sorties",
        method: "POST",
        body,
      }),
      transformResponse: (response: SingleSortie) => response.data,
      invalidatesTags: [
        { type: "Exit", id: "LIST" },
        { type: "Pigeon", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetExitsQuery, useGetExitQuery, useCreateExitMutation } = exitApi;
