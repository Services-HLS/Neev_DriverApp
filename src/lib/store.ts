import { useEffect, useState, useSyncExternalStore } from "react";
import { todayKey } from "./operations";
import type { GpsMatchState } from "./operations";

type Listener = () => void;
const listeners = new Set<Listener>();
const KEY = "neev-driver-state-v2";

export type OpMode = "business" | "customer" | "be-the-owner";

export interface CaptureCoord {
  driver: { lat: number; lng: number };
  pickup: { lat: number; lng: number };
  score: number;
  state: GpsMatchState;
  distanceM?: number;
}

export interface AppState {
  loggedIn: boolean;
  driverId: string;
  mode: OpMode;
  assignmentDate: string;
  vehicleImagesComplete: boolean;
  videoComplete: boolean;
  driverSelfieVerified: boolean;
  coordinatesVerified: boolean;
  gpsMatchScore: number;
  gpsMatchState: GpsMatchState;
  captureCoords: Record<string, CaptureCoord>;
  endVehicleImagesComplete: boolean;
  endVideoComplete: boolean;
  endDriverSelfieVerified: boolean;
  endCoordinatesVerified: boolean;
  endCaptureCoords: Record<string, CaptureCoord>;
  tripActive: boolean;
  tripStartTime: number | null;
  tripStartOdometer: number | null;
  tripStartBattery: number | null;
  odometer: number;
  batteryPct: number;
  rentPaidToday: boolean;
  rentLatePenaltyApplied: boolean;
  rentPenaltyDate: string | null;
  rentReminder2pm: boolean;
  rentReminder230pm: boolean;
  notifications: { id: string; title: string; body: string; ts: number; read: boolean; kind: string }[];
}

const defaultState: AppState = {
  loggedIn: false,
  driverId: "",
  mode: "customer",
  assignmentDate: "",
  vehicleImagesComplete: false,
  videoComplete: false,
  driverSelfieVerified: false,
  coordinatesVerified: false,
  gpsMatchScore: 0,
  gpsMatchState: "verified",
  captureCoords: {},
  endVehicleImagesComplete: false,
  endVideoComplete: false,
  endDriverSelfieVerified: false,
  endCoordinatesVerified: false,
  endCaptureCoords: {},
  tripActive: false,
  tripStartTime: null,
  tripStartOdometer: null,
  tripStartBattery: null,
  odometer: 24875,
  batteryPct: 86,
  rentPaidToday: false,
  rentLatePenaltyApplied: false,
  rentPenaltyDate: null,
  rentReminder2pm: false,
  rentReminder230pm: false,
  notifications: [],
};

let state: AppState = defaultState;

function migrateLegacy(raw: Record<string, unknown>): Partial<AppState> {
  const patch: Partial<AppState> = { ...raw } as Partial<AppState>;
  if (raw.shiftActive && !raw.tripActive) patch.tripActive = Boolean(raw.shiftActive);
  if (raw.vehicleVerified && !raw.vehicleImagesComplete) {
    patch.vehicleImagesComplete = true;
    patch.videoComplete = true;
    patch.coordinatesVerified = true;
    patch.driverSelfieVerified = true;
  }
  if (!raw.mode) patch.mode = "customer";
  return patch;
}

function resetDailyState() {
  const today = todayKey();
  const patch: Partial<AppState> = {};

  if (state.assignmentDate !== today) {
    patch.assignmentDate = today;
    patch.vehicleImagesComplete = false;
    patch.videoComplete = false;
    patch.driverSelfieVerified = false;
    patch.coordinatesVerified = false;
    patch.captureCoords = {};
    patch.endCaptureCoords = {};
    patch.endVehicleImagesComplete = false;
    patch.endVideoComplete = false;
    patch.endDriverSelfieVerified = false;
    patch.endCoordinatesVerified = false;
    patch.gpsMatchScore = 0;
    patch.gpsMatchState = "verified";
    patch.tripActive = false;
    patch.tripStartTime = null;
    patch.tripStartOdometer = null;
    patch.tripStartBattery = null;
  }

  if (state.rentPenaltyDate !== today) {
    patch.rentPaidToday = false;
    patch.rentLatePenaltyApplied = false;
    patch.rentPenaltyDate = null;
    patch.rentReminder2pm = false;
    patch.rentReminder230pm = false;
  }

  if (Object.keys(patch).length) {
    state = { ...state, ...patch };
    persist();
  }
}

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem("neev-driver-state-v1");
    if (raw) state = { ...defaultState, ...migrateLegacy(JSON.parse(raw)) };
  } catch {}
  resetDailyState();
}
load();

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getState() {
  return state;
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState<T = AppState>(sel: (s: AppState) => T = (s) => s as unknown as T): T {
  return useSyncExternalStore(
    subscribe,
    () => sel(state),
    () => sel(defaultState),
  );
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function pushNotification(n: { title: string; body: string; kind?: string }) {
  setState((s) => ({
    notifications: [
      {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        title: n.title,
        body: n.body,
        ts: Date.now(),
        read: false,
        kind: n.kind ?? "info",
      },
      ...s.notifications,
    ].slice(0, 50),
  }));
}

export function isTripAuthorizationComplete(s: AppState = state): boolean {
  return (
    s.vehicleImagesComplete &&
    s.videoComplete &&
    s.coordinatesVerified &&
    s.driverSelfieVerified
  );
}

export function resetStartVerification() {
  setState({
    vehicleImagesComplete: false,
    videoComplete: false,
    driverSelfieVerified: false,
    coordinatesVerified: false,
    captureCoords: {},
    gpsMatchScore: 0,
    gpsMatchState: "verified",
  });
}

export function resetEndVerification() {
  setState({
    endVehicleImagesComplete: false,
    endVideoComplete: false,
    endDriverSelfieVerified: false,
    endCoordinatesVerified: false,
    endCaptureCoords: {},
  });
}

/** @deprecated */
export function resetVerification() {
  resetStartVerification();
}

export function logout() {
  state = { ...defaultState };
  persist();
  listeners.forEach((l) => l());
}

/** @deprecated Use tripActive */
export function vehicleVerifiedLegacy(): boolean {
  return isTripAuthorizationComplete();
}
