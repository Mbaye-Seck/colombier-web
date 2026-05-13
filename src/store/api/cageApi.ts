import { baseApi } from "@/store/baseApi";
import type { Cage, CageView, CageOccupant, CageStatus, AviaryId } from "@/types/cage";
import type { Pigeon } from "@/types/pigeon";

type PaginatedCages = { data: Cage[] };
type SingleCage = { data: Cage };
type SingleAffectation = { data: { id: number } };

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
    status,
    occupants,
    history: [],
  };
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const cageApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCages: build.query<CageView[], void>({
      query: () => ({
        url: "cages",
        params: {
          per_page: 200,
          include: "affectationActive.pigeon,affectationActive.couple",
        },
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
          params: {
            per_page: 200,
            include: "affectationActive.pigeon,affectationActive.couple",
          },
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
            ]
          : [{ type: "Cage", id: aviary }],
    }),

    getCage: build.query<CageView, number>({
      query: (id) => ({
        url: `cages/${id}`,
        params: { include: "affectationActive.pigeon,affectationActive.couple" },
      }),
      transformResponse: (response: SingleCage) => toCageView(response.data),
      providesTags: (_, __, id) => [{ type: "Cage", id }],
    }),

    assignPigeon: build.mutation<void, { backendId: number; pigeon_id: number; motif?: string }>({
      query: ({ backendId, pigeon_id, motif }) => ({
        url: "affectation-cages",
        method: "POST",
        body: { cage_id: backendId, pigeon_id, motif: motif ?? null },
      }),
      invalidatesTags: [
        { type: "Cage", id: "LIST" },
        { type: "AffectationCage", id: "LIST" },
      ],
    }),

    assignCouple: build.mutation<void, { backendId: number; couple_id: number; motif?: string }>({
      query: ({ backendId, couple_id, motif }) => ({
        url: "affectation-cages",
        method: "POST",
        body: { cage_id: backendId, couple_id, motif: motif ?? null },
      }),
      invalidatesTags: [
        { type: "Cage", id: "LIST" },
        { type: "AffectationCage", id: "LIST" },
      ],
    }),

    releaseCage: build.mutation<void, number>({
      query: (affectationId) => ({
        url: `affectation-cages/${affectationId}/release`,
        method: "PATCH",
        body: {},
      }),
      transformResponse: (_response: SingleAffectation) => undefined,
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
  useAssignPigeonMutation,
  useAssignCoupleMutation,
  useReleaseCageMutation,
} = cageApi;
