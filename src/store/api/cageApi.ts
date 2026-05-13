import { baseApi } from "@/store/baseApi";
import type { AviaryId, Cage, CageOccupant } from "@/types/cage";
import { MOCK_CAGES_BY_AVIARY } from "@/services/mock/cages";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const cageApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCagesByAviary: build.query<Cage[], AviaryId>({
      queryFn: async (aviary) => {
        await sleep(100);
        return { data: MOCK_CAGES_BY_AVIARY[aviary] ?? [] };
      },
      providesTags: (result, _, aviary) =>
        result
          ? [
              ...result.map(({ code }) => ({ type: "Cage" as const, id: code })),
              { type: "Cage", id: aviary },
            ]
          : [{ type: "Cage", id: aviary }],
    }),

    getCage: build.query<Cage | undefined, string>({
      queryFn: async (code) => {
        await sleep(80);
        for (const list of Object.values(MOCK_CAGES_BY_AVIARY)) {
          const cage = list.find((c) => c.code === code);
          if (cage) return { data: cage };
        }
        return { data: undefined };
      },
      providesTags: (_, __, code) => [{ type: "Cage", id: code }],
    }),

    assignPigeon: build.mutation<void, { code: string; occupant: CageOccupant }>({
      queryFn: async () => {
        await sleep(400);
        return { data: undefined };
      },
      async onQueryStarted({ code, occupant }, { dispatch, queryFulfilled }) {
        const aviary = code[0] as AviaryId;
        const patch = dispatch(
          cageApi.util.updateQueryData("getCagesByAviary", aviary, (draft) => {
            const cage = draft.find((c) => c.code === code);
            if (cage) {
              cage.status = "single";
              cage.occupants = [occupant];
              cage.history.unshift({
                date: new Date().toLocaleDateString("fr-FR"),
                label: `Pigeon ${occupant.ring} affecté`,
              });
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    assignCouple: build.mutation<
      void,
      { code: string; male: CageOccupant; female: CageOccupant }
    >({
      queryFn: async () => {
        await sleep(400);
        return { data: undefined };
      },
      async onQueryStarted({ code, male, female }, { dispatch, queryFulfilled }) {
        const aviary = code[0] as AviaryId;
        const patch = dispatch(
          cageApi.util.updateQueryData("getCagesByAviary", aviary, (draft) => {
            const cage = draft.find((c) => c.code === code);
            if (cage) {
              cage.status = "couple";
              cage.occupants = [male, female];
              cage.history.unshift({
                date: new Date().toLocaleDateString("fr-FR"),
                label: `Couple affecté (${male.ring} × ${female.ring})`,
              });
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    releaseCage: build.mutation<void, string>({
      queryFn: async () => {
        await sleep(300);
        return { data: undefined };
      },
      async onQueryStarted(code, { dispatch, queryFulfilled }) {
        const aviary = code[0] as AviaryId;
        const patch = dispatch(
          cageApi.util.updateQueryData("getCagesByAviary", aviary, (draft) => {
            const cage = draft.find((c) => c.code === code);
            if (cage) {
              cage.status = "empty";
              cage.occupants = [];
              cage.history.unshift({
                date: new Date().toLocaleDateString("fr-FR"),
                label: "Cage libérée",
              });
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCagesByAviaryQuery,
  useGetCageQuery,
  useAssignPigeonMutation,
  useAssignCoupleMutation,
  useReleaseCageMutation,
} = cageApi;
