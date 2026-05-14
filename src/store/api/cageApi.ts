import { baseApi } from "@/store/baseApi";
import type { Cage, CageView, CageOccupant, CageStatus, AviaryId, AffectationCage } from "@/types/cage";
import type { Pigeon } from "@/types/pigeon";

type PaginatedCages = { data: Cage[] };
type PaginatedAffectations = { data: AffectationCage[] };
type SingleCage = { data: Cage };

const CAGE_INCLUDES = "affectationActive.pigeon,affectationActive.couple.male,affectationActive.couple.femelle";

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveCageStatus(cage: Cage): CageStatus {
  if (!cage.is_occupied) return "empty";
  return cage.occupation_type === "couple" ? "couple" : "single";
}

function pigeonToOccupant(pigeon: Pigeon): CageOccupant {
  return {
    pigeonId: pigeon.id,
    name: pigeon.code_bague,
    sex: pigeon.sexe === "male" ? "M" : "F",
    ring: pigeon.code_bague,
    race: pigeon.race ?? "—",
    age: "—",
  };
}

function toCageView(cage: Cage): CageView {
  const status = deriveCageStatus(cage);
  const occupants: CageOccupant[] = [];

  if (cage.affectation_active) {
    if (cage.affectation_active.pigeon) {
      occupants.push(pigeonToOccupant(cage.affectation_active.pigeon));
    } else if (cage.affectation_active.couple) {
      const { couple } = cage.affectation_active;
      if (couple.male) occupants.push(pigeonToOccupant(couple.male));
      if (couple.femelle) occupants.push(pigeonToOccupant(couple.femelle));
    }
  }

  return {
    id: String(cage.id),
    code: cage.numero,
    backendId: cage.id,
    affectationId: cage.affectation_active?.id,
    coupleId: cage.affectation_active?.couple_id ?? null,
    status,
    occupants,
    history: [],
    nom: cage.nom,
    type: cage.type,
    capacite: cage.capacite,
    superficie: cage.superficie,
  };
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const cageApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCages: build.query<CageView[], void>({
      query: () => ({
        url: "cages",
        params: { per_page: 200, include: CAGE_INCLUDES },
      }),
      transformResponse: (response: PaginatedCages) => response.data.map(toCageView),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ backendId }) => ({ type: "Cage" as const, id: backendId })),
              { type: "Cage", id: "LIST" },
            ]
          : [{ type: "Cage", id: "LIST" }],
    }),

    getCagesByAviary: build.query<CageView[], AviaryId>({
      queryFn: async (aviary, _api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: "cages",
          params: { per_page: 200, include: CAGE_INCLUDES },
        });
        if (result.error) return { error: result.error };
        const all = (result.data as PaginatedCages).data.map(toCageView);
        const filtered = all.filter((c) => c.code.toUpperCase().startsWith(aviary));
        return { data: filtered.length > 0 ? filtered : all };
      },
      providesTags: (result, _, aviary) =>
        result
          ? [
              ...result.map(({ backendId }) => ({ type: "Cage" as const, id: backendId })),
              { type: "Cage", id: aviary },
              { type: "Cage", id: "LIST" },
            ]
          : [{ type: "Cage", id: aviary }, { type: "Cage", id: "LIST" }],
    }),

    getCage: build.query<CageView, number>({
      query: (id) => ({
        url: `cages/${id}`,
        params: { include: CAGE_INCLUDES },
      }),
      transformResponse: (response: SingleCage) => toCageView(response.data),
      providesTags: (_, __, id) => [{ type: "Cage", id }, { type: "Cage", id: "LIST" }],
    }),

    getAffectationsByCage: build.query<AffectationCage[], number>({
      query: (cageId) => ({
        url: "affectation-cages",
        params: {
          "filter[cage_id]": cageId,
          include: "pigeon,couple",
          per_page: 100,
          sort: "-date_affectation",
        },
      }),
      transformResponse: (response: PaginatedAffectations) => response.data,
      providesTags: (_, __, cageId) => [
        { type: "AffectationCage", id: cageId },
        { type: "AffectationCage", id: "LIST" },
      ],
    }),

    createCage: build.mutation<CageView, { numero: string; nom: string; type: string; capacite?: number | null; superficie?: number | null }>({
      query: (data) => ({ url: "cages", method: "POST", body: data }),
      transformResponse: (response: SingleCage) => toCageView(response.data),
      invalidatesTags: [{ type: "Cage", id: "LIST" }],
    }),

    updateCage: build.mutation<CageView, { id: number; data: Partial<{ numero: string; nom: string; type: string; capacite: number | null; superficie: number | null }> }>({
      query: ({ id, data }) => ({ url: `cages/${id}`, method: "PATCH", body: data }),
      transformResponse: (response: SingleCage) => toCageView(response.data),
      invalidatesTags: (_, __, { id }) => [{ type: "Cage", id }, { type: "Cage", id: "LIST" }],
    }),

    deleteCage: build.mutation<void, number>({
      query: (id) => ({ url: `cages/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [{ type: "Cage", id }, { type: "Cage", id: "LIST" }],
    }),

    assignPigeon: build.mutation<void, { backendId: number; pigeon_id: number; motif?: string }>({
      query: ({ backendId, pigeon_id, motif }) => ({
        url: "affectation-cages",
        method: "POST",
        body: { cage_id: backendId, pigeon_id, motif: motif ?? null },
      }),
      invalidatesTags: (_, __, { backendId }) => [
        { type: "Cage", id: backendId },
        { type: "Cage", id: "LIST" },
        { type: "AffectationCage", id: backendId },
        { type: "AffectationCage", id: "LIST" },
      ],
    }),

    assignCouple: build.mutation<void, { backendId: number; couple_id: number; motif?: string }>({
      query: ({ backendId, couple_id, motif }) => ({
        url: "affectation-cages",
        method: "POST",
        body: { cage_id: backendId, couple_id, motif: motif ?? null },
      }),
      invalidatesTags: (_, __, { backendId }) => [
        { type: "Cage", id: backendId },
        { type: "Cage", id: "LIST" },
        { type: "AffectationCage", id: backendId },
        { type: "AffectationCage", id: "LIST" },
      ],
    }),

    releaseCage: build.mutation<void, number>({
      query: (affectationId) => ({
        url: `affectation-cages/${affectationId}/release`,
        method: "PATCH",
        body: {},
      }),
      invalidatesTags: [
        { type: "Cage", id: "LIST" },
        { type: "AffectationCage", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCagesQuery,
  useGetCagesByAviaryQuery,
  useGetCageQuery,
  useGetAffectationsByCageQuery,
  useCreateCageMutation,
  useUpdateCageMutation,
  useDeleteCageMutation,
  useAssignPigeonMutation,
  useAssignCoupleMutation,
  useReleaseCageMutation,
} = cageApi;
