import type { AssignedVehicle } from "./data";

export type GpsMatchState = "verified" | "slight" | "outside";

export interface Coordinates {
  lat: number;
  lng: number;
}

/** Simulated pickup hub coordinates (Whitefield Hub). */
export const PICKUP_HUB: Coordinates = { lat: 12.9698, lng: 77.7499 };

/** Rotate management-assigned vehicles by calendar day. */
export function getAssignmentDayIndex(date = new Date()): number {
  const epoch = new Date(2024, 0, 1).getTime();
  const day = Math.floor((date.getTime() - epoch) / 86_400_000);
  return ((day % 3) + 3) % 3;
}

export function getTodaysAssignment(
  pool: AssignedVehicle[],
  date = new Date(),
): AssignedVehicle {
  return pool[getAssignmentDayIndex(date) % pool.length];
}

/** Simulate driver GPS near pickup; ~85% verified, ~10% slight, ~5% outside (deterministic per capture key). */
export function simulateGpsMatch(
  captureKey: string,
  pickup: Coordinates = PICKUP_HUB,
): { driver: Coordinates; pickup: Coordinates; score: number; state: GpsMatchState } {
  const hash = captureKey.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const roll = hash % 20;
  let offsetM = 12;
  let state: GpsMatchState = "verified";
  if (roll === 17) {
    offsetM = 85;
    state = "slight";
  } else if (roll === 18) {
    offsetM = 220;
    state = "outside";
  }
  const driver: Coordinates = {
    lat: pickup.lat + (offsetM / 111_000) * (hash % 2 === 0 ? 1 : -1),
    lng: pickup.lng + (offsetM / 111_000) * (hash % 3 === 0 ? 1 : -1),
  };
  const score =
    state === "verified" ? 92 + (hash % 8) : state === "slight" ? 68 + (hash % 10) : 34 + (hash % 12);
  return { driver, pickup, score, state };
}

export function canProceedWithGps(state: GpsMatchState): boolean {
  return state !== "outside";
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatTripDuration(startMs: number | null): string {
  if (!startMs) return "00:00:00";
  const sec = Math.floor((Date.now() - startMs) / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
