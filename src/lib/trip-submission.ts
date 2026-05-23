import type { AppState, CaptureCoord } from "./store";

export type TripPhase = "start" | "end";

export type TripSubmissionSlice = {
  captureCoords: Record<string, CaptureCoord>;
  vehicleImagesComplete: boolean;
  videoComplete: boolean;
  driverSelfieVerified: boolean;
  coordinatesVerified: boolean;
};

export function readSubmissionSlice(s: AppState, phase: TripPhase): TripSubmissionSlice {
  if (phase === "start") {
    return {
      captureCoords: s.captureCoords,
      vehicleImagesComplete: s.vehicleImagesComplete,
      videoComplete: s.videoComplete,
      driverSelfieVerified: s.driverSelfieVerified,
      coordinatesVerified: s.coordinatesVerified,
    };
  }
  return {
    captureCoords: s.endCaptureCoords,
    vehicleImagesComplete: s.endVehicleImagesComplete,
    videoComplete: s.endVideoComplete,
    driverSelfieVerified: s.endDriverSelfieVerified,
    coordinatesVerified: s.endCoordinatesVerified,
  };
}

export function patchSubmissionSlice(
  phase: TripPhase,
  patch: Partial<TripSubmissionSlice>,
): Partial<AppState> {
  const out: Partial<AppState> = {};
  if (phase === "start") {
    if (patch.captureCoords !== undefined) {
      out.captureCoords = patch.captureCoords;
      out.gpsMatchScore = 97;
      out.gpsMatchState = "verified";
    }
    if (patch.vehicleImagesComplete !== undefined) out.vehicleImagesComplete = patch.vehicleImagesComplete;
    if (patch.videoComplete !== undefined) out.videoComplete = patch.videoComplete;
    if (patch.driverSelfieVerified !== undefined) out.driverSelfieVerified = patch.driverSelfieVerified;
    if (patch.coordinatesVerified !== undefined) out.coordinatesVerified = patch.coordinatesVerified;
  } else {
    if (patch.captureCoords !== undefined) out.endCaptureCoords = patch.captureCoords;
    if (patch.vehicleImagesComplete !== undefined) out.endVehicleImagesComplete = patch.vehicleImagesComplete;
    if (patch.videoComplete !== undefined) out.endVideoComplete = patch.videoComplete;
    if (patch.driverSelfieVerified !== undefined) out.endDriverSelfieVerified = patch.driverSelfieVerified;
    if (patch.coordinatesVerified !== undefined) out.endCoordinatesVerified = patch.coordinatesVerified;
  }
  return out;
}

export function isSubmissionComplete(s: AppState, phase: TripPhase): boolean {
  const slice = readSubmissionSlice(s, phase);
  return (
    slice.vehicleImagesComplete &&
    slice.videoComplete &&
    slice.coordinatesVerified &&
    slice.driverSelfieVerified
  );
}

export const tripPhaseCopy = {
  start: {
    eyebrow: "Daily car pictures",
    title: (reg: string) => `Daily car pictures · ${reg}`,
    step4: "Submit pictures",
    activateTitle: "Confirm submission",
    activateBtn: "Submit for analysis",
    finalBtn: "SUBMIT DAILY CAR PICTURES",
    successTitle: "Pictures submitted",
    successBody: (reg: string) => `${reg} · Daily car pictures sent for Neev Operations analysis.`,
  },
  end: {
    eyebrow: "End Trip · Submit for Analysis",
    title: (reg: string) => `End Trip · ${reg}`,
    step4: "Submit for analysis",
    activateTitle: "Complete trip readings",
    activateBtn: "Submit for analysis",
    finalBtn: "SUBMIT FOR ANALYSIS",
    successTitle: "Trip Completed",
    successBody: (reg: string) => `${reg} · End submission sent for Neev Operations analysis.`,
  },
} as const;
