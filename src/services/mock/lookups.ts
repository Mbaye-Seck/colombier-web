import type { Cage } from "@/types/cage";
import { MOCK_CAGES_BY_AVIARY } from "./cages";
import { getMockCouples } from "./couples";
import { MOCK_EXITS } from "./exits";
import { getMockPigeons } from "./pigeons";
import { getMockReproductions } from "./reproductions";

export function findPigeonByRing(ring: string) {
  return getMockPigeons().find((p) => p.ring === ring);
}

export function findCoupleById(id: string) {
  return getMockCouples().find((c) => c.id === id);
}

export function findReproductionById(id: string) {
  return getMockReproductions().find((r) => r.id === id);
}

export function findExitById(id: string) {
  return MOCK_EXITS.find((e) => e.id === id);
}

export function findCageByCode(code: string): Cage | undefined {
  for (const list of Object.values(MOCK_CAGES_BY_AVIARY)) {
    const cage = list.find((c) => c.code === code);
    if (cage) return cage;
  }
  return undefined;
}
