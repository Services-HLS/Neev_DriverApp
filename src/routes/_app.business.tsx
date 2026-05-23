import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BatteryCharging, MapPin, Clock, ChevronRight, ShieldCheck, Bell, Wallet, Gauge, Camera, Square, Calendar, UserCheck, User,
} from "lucide-react";
import { Battery } from "@/components/Battery";
import { ModeSelector } from "@/components/ModeSelector";
import { VehicleImage } from "@/components/VehicleImage";
import { PageHeader } from "@/components/PageHeader";
import { dailyVehicleAssignments, driver } from "@/lib/data";
import { getTodaysAssignment, formatTripDuration } from "@/lib/operations";
import { useAppState, isTripAuthorizationComplete, isDailyDriverSelfieComplete, resetEndVerification } from "@/lib/store";
import { useRentScheduler } from "@/hooks/use-rent-scheduler";

export const Route = createFileRoute("/_app/business")({
  component: DriverDashboard,
  head: () => ({ meta: [{ title: "Driver Dashboard · Neev Driver" }] }),
});

function DriverDashboard() {
  useRentScheduler();
  const tripActive = useAppState((s) => s.tripActive);
  const tripStartTime = useAppState((s) => s.tripStartTime);
  const battery = useAppState((s) => s.batteryPct);
  const odo = useAppState((s) => s.odometer);
  const authComplete = useAppState(isTripAuthorizationComplete);
  const dailySelfieDone = useAppState(isDailyDriverSelfieComplete);
  const navigate = useNavigate();
  const [timer, setTimer] = useState("00:00:00");

  const vehicle = getTodaysAssignment(dailyVehicleAssignments);
  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  useEffect(() => {
    if (!tripActive || !tripStartTime) return;
    const id = setInterval(() => setTimer(formatTripDuration(tripStartTime)), 1000);
    setTimer(formatTripDuration(tripStartTime));
    return () => clearInterval(id);
  }, [tripActive, tripStartTime]);

  return (
    <div className="page-shell-wide space-y-4">
      <div className="flex items-start justify-between gap-3 animate-fade-up">
        <PageHeader
          eyebrow="Driver Dashboard · B2C"
          title={`Hello, ${driver.name.split(" ")[0]}`}
          description="Operations ready for today's shift"
        />
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-[10px] shrink-0">
          <span className={`size-1.5 rounded-full ${tripActive ? "bg-primary animate-pulse-glow" : "bg-muted-foreground"}`} />
          {tripActive ? "Shift active" : !dailySelfieDone ? "Selfie pending" : authComplete ? "Pictures done" : "Pictures pending"}
        </div>
      </div>

      <ModeSelector />

      <section className="relative overflow-hidden rounded-xl eco-gradient text-primary-foreground p-4 glow-ring animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0 order-2 sm:order-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-80">
              <Camera className="size-3" /> Daily car pictures
            </div>
            <div className="mt-1 font-mono stat-md">{vehicle.reg}</div>
            <div className="text-xs opacity-90">{vehicle.model}</div>
            <p className="mt-1 text-[10px] opacity-75 italic">{vehicle.assignmentMessage}</p>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Metric label="Battery" value={`${vehicle.battery}%`} icon={<BatteryCharging className="size-3" />} />
              <Metric label="Range" value={`${vehicle.range} km`} icon={<Gauge className="size-3" />} />
              <Metric label="Shift" value={vehicle.shift} icon={<Clock className="size-3" />} />
              <Metric label="Pickup" value={vehicle.pickup.split(",")[0]} icon={<MapPin className="size-3" />} />
              <Metric label="Status" value={vehicle.status} icon={<ShieldCheck className="size-3" />} />
              <Metric label="Driver" value={driver.status} icon={<UserCheck className="size-3" />} />
            </div>

            <div className="mt-3 max-w-xs">
              <div className="flex justify-between text-[10px] opacity-90 mb-1">
                <span>EV battery</span><span className="font-mono">{vehicle.battery}%</span>
              </div>
              <Battery pct={vehicle.battery} size="sm" />
            </div>

            <div className="mt-4 space-y-2 max-w-md">
              {!tripActive ? (
                <div className="space-y-2">
                  <div className="rounded-lg bg-white/10 border border-white/20 px-3 py-2.5 space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold opacity-95">
                      <Calendar className="size-3.5 shrink-0" />
                      {todayLabel}
                    </div>
                    <div className="text-[10px] opacity-85 font-mono">
                      Shift {vehicle.shift} · {vehicle.pickup.split(",")[0]}
                    </div>
                    {authComplete && (
                      <div className="text-[10px] text-primary-foreground font-medium pt-0.5">
                        Today&apos;s pictures submitted · ready for shift
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate({ to: "/vehicle-verification" })}
                    className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary-foreground text-primary font-semibold text-sm shadow-md hover:scale-[1.01] active:scale-[.98] transition"
                  >
                    <Camera className="size-4 shrink-0" />
                    {authComplete ? "Daily car pictures · View / update" : "Daily car pictures"}
                  </button>
                  <p className="text-[10px] opacity-75 text-center sm:text-left">
                    7 vehicle photos + walkaround video for operations analysis
                  </p>
                </div>
              ) : null}

              {tripActive && (
                <div className="space-y-2">
                  <div className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-[11px] font-medium opacity-95 inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0" />
                    {todayLabel}
                  </div>
                  <div className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary-foreground/15 border border-primary-foreground/25 font-mono text-sm">
                    Shift active · {timer}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="rounded-lg bg-white/10 px-2 py-1.5"><span className="opacity-70">Shift</span><div className="font-mono">{vehicle.shift}</div></div>
                    <div className="rounded-lg bg-white/10 px-2 py-1.5"><span className="opacity-70">Status</span><div className="font-mono">{vehicle.status}</div></div>
                    <div className="rounded-lg bg-white/10 px-2 py-1.5"><span className="opacity-70">Odo</span><div className="font-mono">{odo.toLocaleString()}</div></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetEndVerification();
                      navigate({ to: "/trip-end" });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-primary-foreground text-primary font-semibold text-sm shadow-md hover:scale-[1.01] active:scale-[.98] transition"
                  >
                    <Square className="size-4" /> END TRIP · SUBMIT FOR ANALYSIS
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="order-1 sm:order-2 shrink-0 w-full sm:w-[250px] flex justify-center sm:justify-end">
            <VehicleImage
              vehicle={vehicle}
              compact
              showLabel={false}
              animate
              className="w-full sm:w-[250px] !max-w-[250px] ring-2 ring-white/40 shadow-lg"
            />
          </div>
        </div>
      </section>

      {tripActive && (
        <section className="glass-strong card-md animate-fade-up space-y-2">
          <div className="section-label">Live trip</div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="stat-md text-eco-gradient">{timer}</span>
            <span className="text-muted-foreground">{vehicle.shift}</span>
            <span className="ml-auto font-mono">Bat {battery}% · {odo.toLocaleString()} km</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            End trip requires the same vehicle photos, video, GPS match, and selfie — submitted for operations analysis.
          </p>
        </section>
      )}

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Widget icon={<Wallet className="size-4" />} label="Payments" value="EMI + Rent" sub="Due by 3 PM" to="/payments" />
        <Widget icon={<Bell className="size-4" />} label="Alerts" value="Updates" sub="Reminders" to="/notifications" />
        <Widget
          icon={<User className="size-4" />}
          label="Driver selfie"
          value={dailySelfieDone ? "Verified" : "Take now"}
          sub="Daily identity check"
          to="/driver-selfie"
        />
      </section>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white/10 border border-white/15 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide opacity-75">{icon}{label}</div>
      <div className="mt-0.5 font-mono text-[11px] font-semibold truncate">{value}</div>
    </div>
  );
}

function Widget({ icon, label, value, sub, to }: { icon: React.ReactNode; label: string; value: string; sub: string; to: string }) {
  return (
    <Link to={to as "/payments"} className="group glass rounded-xl p-3 hover:glow-ring transition animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="size-8 rounded-lg eco-soft grid place-items-center text-primary">{icon}</div>
        <ChevronRight className="size-3.5 text-muted-foreground" />
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </Link>
  );
}
