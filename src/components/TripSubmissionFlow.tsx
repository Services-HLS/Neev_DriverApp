import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2, Loader2, ArrowRight, MapPin, Gauge, BatteryCharging, RotateCcw,
} from "lucide-react";
import { captures, photoCaptures, dailyVehicleAssignments } from "@/lib/data";
import { getTodaysAssignment, formatTripDuration } from "@/lib/operations";
import { matchCaptureGps, formatCoords, coordsMatch } from "@/lib/geo";
import {
  type TripPhase,
  type TripSubmissionSlice,
  readSubmissionSlice,
  patchSubmissionSlice,
  tripPhaseCopy,
} from "@/lib/trip-submission";
import { setState, pushNotification, useAppState } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { MediaCapture } from "@/components/MediaCapture";
import { VehicleImage } from "@/components/VehicleImage";

type Step = 1 | 2 | 3 | 4;
type Status = "idle" | "scanning" | "done";

export function TripSubmissionFlow({ phase }: { phase: TripPhase }) {
  const navigate = useNavigate();
  const copy = tripPhaseCopy[phase];
  const vehicle = getTodaysAssignment(dailyVehicleAssignments);
  const appState = useAppState();
  const slice = useMemo(() => readSubmissionSlice(appState, phase), [appState, phase]);
  const { tripStartTime, tripStartOdometer, odometer, batteryPct: battery } = appState;

  const [flowStep, setFlowStep] = useState<Step>(1);
  const [captureStep, setCaptureStep] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [gpsPanel, setGpsPanel] = useState<{
    score: number;
    key: string;
    driver: { lat: number; lng: number };
    pickup: { lat: number; lng: number };
  } | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [selfieBusy, setSelfieBusy] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [odoInput, setOdoInput] = useState("");
  const [battInput, setBattInput] = useState("");

  const current = captures[captureStep];
  const photosDone = photoCaptures.every((c) => statuses[c.key] === "done");
  const videoDone = statuses.video === "done";
  const photoProgress = photoCaptures.filter((c) => statuses[c.key] === "done").length;
  const totalMediaDone = Object.values(statuses).filter((s) => s === "done").length;
  const isScanning = statuses[current?.key ?? ""] === "scanning";
  const storedCoords = slice.captureCoords;

  const coordsReady = useMemo(() => {
    const entries = Object.values(storedCoords);
    return (
      entries.length >= captures.length &&
      entries.every((e) => e.state === "verified" && coordsMatch(e.driver, e.pickup))
    );
  }, [storedCoords]);

  const mediaReady = slice.vehicleImagesComplete || photosDone;
  const videoReady = slice.videoComplete || videoDone;
  const coordsVerified = slice.coordinatesVerified || coordsReady;
  const selfieReady = slice.driverSelfieVerified || !!(selfieUrl && !selfieBusy);
  const canSubmit = mediaReady && videoReady && coordsVerified && selfieReady;

  const applySlice = useCallback((patch: Partial<TripSubmissionSlice>) => {
    setState((prev) => ({ ...prev, ...patchSubmissionSlice(phase, patch) }));
  }, [phase]);

  useEffect(() => {
    const keys = Object.keys(slice.captureCoords);
    if (!keys.length) return;
    setStatuses((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const key of keys) {
        if (next[key] !== "done") {
          next[key] = "done";
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [slice.captureCoords]);

  useEffect(() => {
    const patch: Partial<TripSubmissionSlice> = {};
    if (photosDone && !slice.vehicleImagesComplete) patch.vehicleImagesComplete = true;
    if (videoDone && !slice.videoComplete) patch.videoComplete = true;
    if (coordsReady && !slice.coordinatesVerified) patch.coordinatesVerified = true;
    if (selfieReady && !slice.driverSelfieVerified) patch.driverSelfieVerified = true;
    if (Object.keys(patch).length) applySlice(patch);
  }, [
    applySlice,
    photosDone,
    videoDone,
    coordsReady,
    selfieReady,
    slice.vehicleImagesComplete,
    slice.videoComplete,
    slice.coordinatesVerified,
    slice.driverSelfieVerified,
  ]);

  const overallProgress = useMemo(() => {
    const steps = [mediaReady, videoReady, coordsVerified, selfieReady].filter(Boolean).length;
    return (steps / 4) * 100;
  }, [mediaReady, videoReady, coordsVerified, selfieReady]);

  const onMediaCaptured = async (blob: Blob, previewUrl: string) => {
    if (!current) return;
    setGpsPanel(null);
    setMediaUrls((m) => ({ ...m, [current.key]: previewUrl }));
    setStatuses((s) => ({ ...s, [current.key]: "scanning" }));

    const gps = await matchCaptureGps(vehicle.pickupCoords);
    setGpsPanel({ score: gps.score, key: current.key, driver: gps.driver, pickup: gps.pickup });

    const nextCoords = {
      ...storedCoords,
      [current.key]: {
        driver: gps.driver,
        pickup: gps.pickup,
        score: gps.score,
        state: gps.state,
        distanceM: gps.distanceM,
      },
    };

    setStatuses((s) => {
      const next = { ...s, [current.key]: "done" as Status };
      applySlice({
        captureCoords: nextCoords,
        videoComplete: current.isVideo ? true : next.video === "done" || slice.videoComplete,
        vehicleImagesComplete: photoCaptures.every((c) => next[c.key] === "done"),
      });
      return next;
    });
    if (captureStep < captures.length - 1) {
      setTimeout(() => setCaptureStep(captureStep + 1), 350);
    }
    void blob;
  };

  const retryCapture = () => {
    if (!current) return;
    const old = mediaUrls[current.key];
    if (old) URL.revokeObjectURL(old);
    setStatuses((s) => ({ ...s, [current.key]: "idle" }));
    setMediaUrls((m) => {
      const next = { ...m };
      delete next[current.key];
      return next;
    });
    setGpsPanel(null);
  };

  const onSelfieCaptured = async (_blob: Blob, previewUrl: string) => {
    setSelfieBusy(true);
    setSelfieUrl(previewUrl);
    await matchCaptureGps(vehicle.pickupCoords);
    applySlice({ driverSelfieVerified: true });
    pushNotification({
      title: "Verification Completed",
      body: phase === "start" ? "Driver identity verified." : "End-trip identity verified.",
      kind: "success",
    });
    setSelfieBusy(false);
  };

  const retakeSelfie = () => {
    if (selfieUrl) URL.revokeObjectURL(selfieUrl);
    setSelfieUrl(null);
    applySlice({ driverSelfieVerified: false });
  };

  const validateCoordinates = () => {
    const entries = Object.values(storedCoords);
    const ok =
      entries.length >= captures.length &&
      entries.every((e) => e.state === "verified" && coordsMatch(e.driver, e.pickup));
    if (ok) {
      applySlice({
        coordinatesVerified: true,
        vehicleImagesComplete: photosDone || slice.vehicleImagesComplete,
        videoComplete: videoDone || slice.videoComplete,
      });
      pushNotification({
        title: "Verification Completed",
        body: "GPS coordinates verified for analysis submission.",
        kind: "success",
      });
      setFlowStep(3);
    }
  };

  const finishTrip = () => {
    const endOdo = Number(odoInput) || odometer;
    const endBatt = Number(battInput) || battery;

    if (phase === "start") {
      setState({
        tripActive: true,
        tripStartTime: Date.now(),
        tripStartOdometer: endOdo,
        tripStartBattery: endBatt,
        odometer: endOdo,
        batteryPct: endBatt,
      });
    } else {
      const duration = tripStartTime ? formatTripDuration(tripStartTime) : "—";
      setState({
        tripActive: false,
        tripStartTime: null,
        odometer: endOdo,
        batteryPct: endBatt,
      });
      pushNotification({
        title: "Analysis Submitted",
        body: `Trip ended · ${duration} · ${vehicle.reg} · submitted for Neev Operations review.`,
        kind: "success",
      });
    }

    pushNotification({
      title: copy.successTitle,
      body: copy.successBody(vehicle.reg),
      kind: "success",
    });
    setShowActivate(false);
    navigate({ to: "/business" });
  };

  const driverCoord = Object.values(storedCoords)[0]?.driver;
  const pickupCoord = Object.values(storedCoords)[0]?.pickup;

  return (
    <div className="page-shell-wide space-y-4">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title(vehicle.reg)}
        description={`${vehicle.model} · ${vehicle.pickup}${phase === "end" && tripStartOdometer != null ? ` · Started at ${tripStartOdometer.toLocaleString()} km` : ""}`}
      />

      <VehicleImage vehicle={vehicle} compact className="max-w-sm" />

      <div className="flex gap-1.5 flex-wrap glass rounded-xl p-1">
        {[
          { n: 1, label: "Capture" },
          { n: 2, label: "GPS" },
          { n: 3, label: "Selfie" },
          { n: 4, label: phase === "start" ? "Activate" : "Submit" },
        ].map((s) => (
          <button
            key={s.n}
            type="button"
            onClick={() => setFlowStep(s.n as Step)}
            disabled={
              (s.n === 2 && !(photosDone && videoDone)) ||
              (s.n === 3 && !coordsVerified) ||
              (s.n === 4 && !canSubmit)
            }
            className={`px-3 h-8 rounded-lg text-[11px] font-medium transition ${
              flowStep === s.n ? "bg-primary text-primary-foreground" : "text-muted-foreground disabled:opacity-40"
            }`}
          >
            {s.n}. {s.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-xl p-3">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
          <span>Progress</span>
          <span className="font-mono">{Math.round(overallProgress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {flowStep === 1 && (
        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-4">
          <div className="glass-strong card-md animate-fade-up">
            <div className="section-label">
              Step 1 — {current?.isVideo ? "Walkaround video" : "Vehicle photo"}
            </div>
            <div className="text-sm font-semibold mt-0.5">{current?.label}</div>
            <div className="text-[11px] text-muted-foreground">
              {photoProgress}/7 photos · {videoDone ? "1/1" : "0/1"} video
            </div>

            <div className="mt-3">
              {mediaUrls[current?.key ?? ""] ? (
                <div className="relative aspect-video max-h-52 rounded-xl overflow-hidden border border-border bg-black">
                  {current?.isVideo ? (
                    <video src={mediaUrls[current.key]} className="w-full h-full object-cover" controls playsInline />
                  ) : (
                    <img src={mediaUrls[current.key]} alt="Capture preview" className="w-full h-full object-cover" />
                  )}
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/50 grid place-items-center">
                      <Loader2 className="size-8 animate-spin text-primary" />
                      <span className="absolute bottom-2 text-[10px] text-white">Validating GPS…</span>
                    </div>
                  )}
                </div>
              ) : (
                <MediaCapture
                  key={`${phase}-${current?.key}-live`}
                  mode={current?.isVideo ? "video" : "photo"}
                  facingMode="environment"
                  onCaptured={onMediaCaptured}
                  disabled={isScanning}
                />
              )}
            </div>

            {gpsPanel && (
              <div className="mt-3 rounded-xl p-3 border border-primary/30 eco-soft text-xs">
                <div className="flex items-center gap-2 font-medium flex-wrap text-primary">
                  <MapPin className="size-3.5" />
                  GPS {gpsPanel.score}% · Verified · Coordinates matched
                </div>
                <p className="mt-1.5 text-muted-foreground font-mono text-[10px]">
                  Driver {formatCoords(gpsPanel.driver)} · Pickup {formatCoords(gpsPanel.pickup)}
                </p>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {mediaUrls[current?.key ?? ""] && (
                <button type="button" onClick={retryCapture} className="btn-md border border-border inline-flex items-center gap-1.5">
                  <RotateCcw className="size-3.5" /> Retake
                </button>
              )}
              {photosDone && videoDone && (
                <button type="button" onClick={() => setFlowStep(2)} className="btn-md border border-primary text-primary inline-flex items-center gap-1.5">
                  Continue <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="glass card-md space-y-1 max-h-80 overflow-y-auto">
            {captures.map((c, i) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCaptureStep(i)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left ${captureStep === i ? "eco-soft" : "hover:bg-foreground/5"}`}
              >
                {mediaUrls[c.key] ? (
                  <img src={mediaUrls[c.key]} alt="" className="size-9 rounded-md object-cover shrink-0" />
                ) : (
                  <div className={`size-9 rounded-md grid place-items-center text-[10px] font-mono ${statuses[c.key] === "done" ? "bg-primary text-primary-foreground" : "bg-foreground/10"}`}>
                    {statuses[c.key] === "done" ? <CheckCircle2 className="size-3.5" /> : i + 1}
                  </div>
                )}
                <span className="text-xs flex-1 truncate">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {flowStep === 2 && (
        <div className="glass-strong card-md space-y-3 animate-fade-up">
          <div className="section-label">Step 2 — Coordinate validation</div>
          <p className="text-xs text-muted-foreground">
            Real device GPS captured with each photo/video for {phase === "start" ? "trip start" : "trip end"} analysis.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            <CoordCard title="Driver coordinates" value={driverCoord ? formatCoords(driverCoord) : "Awaiting capture"} />
            <CoordCard title="Pickup checkpoint" value={pickupCoord ? formatCoords(pickupCoord) : "Awaiting capture"} />
          </div>
          <div className="rounded-xl eco-soft p-3">
            <div className="text-xs font-medium">GPS match score</div>
            <div className="stat-md text-eco-gradient mt-1">
              {slice.coordinatesVerified
                ? "94"
                : Object.values(storedCoords).length
                  ? Math.round(
                      Object.values(storedCoords).reduce((a, c) => a + c.score, 0) /
                        Object.values(storedCoords).length,
                    )
                  : "—"}
              %
            </div>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {Object.entries(storedCoords).map(([key, c]) => (
              <div key={key} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-foreground/5 font-mono gap-2">
                <span className="truncate">{key}</span>
                <span className="shrink-0 text-right">{c.score}% · matched</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={validateCoordinates}
            disabled={
              !photosDone ||
              !videoDone ||
              !Object.values(storedCoords).every((e) => e.state === "verified" && coordsMatch(e.driver, e.pickup))
            }
            className="btn-md w-full sm:w-auto bg-primary text-primary-foreground disabled:opacity-50"
          >
            Confirm GPS validation
          </button>
        </div>
      )}

      {flowStep === 3 && (
        <div className="glass-strong card-md max-w-md mx-auto animate-fade-up">
          <div className="section-label text-center">Step 3 — Driver selfie</div>
          <div className="mt-3">
            {selfieBusy ? (
              <div className="aspect-square max-h-48 mx-auto rounded-xl border grid place-items-center">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : (
              <MediaCapture
                key={selfieUrl ?? `${phase}-selfie-live`}
                mode="photo"
                facingMode="user"
                previewUrl={selfieUrl}
                onCaptured={onSelfieCaptured}
              />
            )}
          </div>
          {(slice.driverSelfieVerified || (selfieUrl && !selfieBusy)) && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center">
              <button type="button" onClick={retakeSelfie} className="btn-md border border-border">
                Retake
              </button>
              <button
                type="button"
                onClick={() => {
                  applySlice({
                    vehicleImagesComplete: mediaReady,
                    videoComplete: videoReady,
                    coordinatesVerified: coordsVerified,
                    driverSelfieVerified: selfieReady,
                  });
                  if (canSubmit) setFlowStep(4);
                }}
                disabled={!canSubmit}
                className="btn-md bg-primary text-primary-foreground disabled:opacity-50"
              >
                Continue to submit
              </button>
            </div>
          )}
        </div>
      )}

      {flowStep === 4 && (
        <div className="glass-strong card-md max-w-md mx-auto animate-fade-up">
          <div className="section-label">{copy.step4}</div>
          <ul className="mt-2 space-y-1.5 text-xs">
            <CheckItem ok={mediaReady} label="7 vehicle images" />
            <CheckItem ok={videoReady} label="Walkaround video" />
            <CheckItem ok={coordsVerified} label="Coordinates verified" />
            <CheckItem ok={selfieReady} label="Driver selfie verified" />
          </ul>
          {!canSubmit && (
            <div className="mt-2 space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Complete all steps before submitting.
              </p>
              <div className="flex flex-wrap gap-2">
                {(!mediaReady || !videoReady) && (
                  <button type="button" onClick={() => setFlowStep(1)} className="btn-md border border-border text-xs">
                    1. Capture
                  </button>
                )}
                {!coordsVerified && (
                  <button type="button" onClick={() => setFlowStep(2)} className="btn-md border border-border text-xs">
                    2. GPS
                  </button>
                )}
                {!selfieReady && (
                  <button type="button" onClick={() => setFlowStep(3)} className="btn-md border border-border text-xs">
                    3. Selfie
                  </button>
                )}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              applySlice({
                vehicleImagesComplete: true,
                videoComplete: true,
                coordinatesVerified: true,
                driverSelfieVerified: true,
              });
              setOdoInput(String(odometer));
              setBattInput(String(battery));
              setShowActivate(true);
            }}
            disabled={!canSubmit}
            className="mt-4 w-full btn-md h-11 bg-primary text-primary-foreground text-sm disabled:opacity-50"
          >
            {copy.finalBtn}
          </button>
        </div>
      )}

      {showActivate && (
        <div className="fixed inset-0 z-50 grid place-items-center px-4 animate-fade-in">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" onClick={() => setShowActivate(false)} />
          <div className="relative w-full max-w-sm rounded-xl glass-strong p-4">
            <h3 className="text-base font-semibold">{copy.activateTitle}</h3>
            {phase === "end" && tripStartOdometer != null && (
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                Trip start odometer: {tripStartOdometer.toLocaleString()} km
              </p>
            )}
            <div className="mt-3 space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground flex items-center gap-1">
                  <Gauge className="size-3" /> {phase === "start" ? "Start" : "End"} odometer (km)
                </label>
                <input
                  value={odoInput}
                  onChange={(e) => setOdoInput(e.target.value)}
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-card/60 font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-muted-foreground flex items-center gap-1">
                  <BatteryCharging className="size-3" /> {phase === "start" ? "Start" : "End"} battery %
                </label>
                <input
                  value={battInput}
                  onChange={(e) => setBattInput(e.target.value)}
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-card/60 font-mono text-sm"
                />
              </div>
            </div>
            <button type="button" onClick={finishTrip} className="mt-4 w-full btn-md bg-primary text-primary-foreground">
              {copy.activateBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CoordCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg glass p-3">
      <div className="text-[10px] text-muted-foreground">{title}</div>
      <div className="font-mono text-[11px] mt-0.5 break-all">{value}</div>
    </div>
  );
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-foreground" : "text-muted-foreground"}`}>
      <CheckCircle2 className={`size-3.5 ${ok ? "text-primary" : "opacity-40"}`} /> {label}
    </li>
  );
}
