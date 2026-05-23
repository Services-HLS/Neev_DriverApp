import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Camera, Car, CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MediaCapture } from "@/components/MediaCapture";
import { driver, dailyVehicleAssignments } from "@/lib/data";
import { matchCaptureGps } from "@/lib/geo";
import { getTodaysAssignment, todayKey } from "@/lib/operations";
import { setState, pushNotification, useAppState } from "@/lib/store";

export const Route = createFileRoute("/_app/driver-selfie")({
  component: DriverSelfiePage,
  head: () => ({ meta: [{ title: "Daily Driver Selfie · Neev Driver" }] }),
});

function DriverSelfiePage() {
  const navigate = useNavigate();
  const verified = useAppState((s) => s.dailyDriverSelfieVerified);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const vehicle = getTodaysAssignment(dailyVehicleAssignments);
  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const onCaptured = async (_blob: Blob, previewUrl: string) => {
    setBusy(true);
    setSelfieUrl(previewUrl);
    await matchCaptureGps(vehicle.pickupCoords);
    setState({
      dailyDriverSelfieVerified: true,
      assignmentDate: todayKey(),
    });
    pushNotification({
      title: "Driver selfie verified",
      body: `${driver.name} · daily identity check complete for ${todayLabel}.`,
      kind: "success",
    });
    setBusy(false);
  };

  const retake = () => {
    if (selfieUrl) URL.revokeObjectURL(selfieUrl);
    setSelfieUrl(null);
    setState({ dailyDriverSelfieVerified: false });
  };

  return (
    <div className="page-shell space-y-4">
      <PageHeader
        eyebrow="Daily check-in"
        title="Driver selfie"
        description="Verify your identity once per day before your shift."
      />

      <section className="glass-strong card-md space-y-3 text-xs text-muted-foreground leading-relaxed">
        <div className="flex gap-2">
          <Camera className="size-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Daily car pictures</p>
            <p className="mt-0.5">
              Seven vehicle photos + walkaround video of <strong className="text-foreground">{vehicle.reg}</strong> when you{" "}
              <strong className="text-foreground">START TRIP</strong> — used for damage and EV condition analysis.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <User className="size-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Driver selfie (this page)</p>
            <p className="mt-0.5">
              One live face photo of <strong className="text-foreground">{driver.name}</strong> each day — confirms the assigned driver is on shift.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Car className="size-4 text-primary shrink-0 mt-0.5" />
          <p>Trip start/end still include a separate selfie inside the full submission flow.</p>
        </div>
      </section>

      <section className="glass-strong card-md max-w-md mx-auto">
        <div className="section-label text-center">Live selfie · {todayLabel}</div>

        <div className="mt-3">
          {busy ? (
            <div className="aspect-square max-h-56 mx-auto rounded-xl border grid place-items-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <MediaCapture
              key={selfieUrl ?? "daily-selfie-live"}
              mode="photo"
              facingMode="user"
              previewUrl={selfieUrl}
              onCaptured={onCaptured}
            />
          )}
        </div>

        {(verified || selfieUrl) && !busy && (
          <div className="mt-4 flex flex-col gap-2">
            {verified && (
              <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
                <CheckCircle2 className="size-4" /> Today&apos;s selfie verified
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={retake} className="btn-md flex-1 border border-border">
                Retake
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/business" })}
                className="btn-md flex-1 bg-primary text-primary-foreground"
              >
                Back to dashboard
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
