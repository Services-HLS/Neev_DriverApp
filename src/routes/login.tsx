import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Car, Zap, Leaf, Shield, Mail, Lock, User } from "lucide-react";
import { setState, pushNotification } from "@/lib/store";
import { driver, dailyVehicleAssignments } from "@/lib/data";
import { getTodaysAssignment, todayKey } from "@/lib/operations";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in · NeevCabs Driver Ops" },
      { name: "description", content: "Sign in to NeevCabs driver fleet operations." },
    ],
  }),
});

const DEMO_EMAIL = "driver@neevcabs.com";
const DEMO_PASSWORD = "demo1234";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const vehicle = getTodaysAssignment(dailyVehicleAssignments);
      setState({
        loggedIn: true,
        driverId: email.includes("@") ? driver.id : email || driver.id,
        mode: "customer",
        assignmentDate: todayKey(),
      });
      pushNotification({
        title: "Vehicle Assigned",
        body: `${vehicle.model} (${vehicle.reg}) assigned for today at ${vehicle.pickup}.`,
        kind: "info",
      });
      pushNotification({
        title: "EMI Reminder",
        body: "Next installment due on schedule. Manage in Payments & Dues.",
        kind: "warn",
      });
      navigate({ to: "/business" });
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row">
      {/* Brand panel — below form on mobile, left on desktop */}
      <aside className="hidden lg:flex relative flex-col overflow-hidden bg-primary text-primary-foreground px-5 py-8 sm:px-8 lg:w-1/2 lg:min-h-screen lg:justify-between lg:px-12 lg:py-12 shrink-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 100%, rgba(255,255,255,0.22) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 0% 0%, rgba(255,255,255,0.08) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-10 lg:size-11 rounded-xl bg-white/15 backdrop-blur-sm grid place-items-center border border-white/20">
              <Car className="size-5" strokeWidth={2.2} />
            </div>
            <span className="text-base lg:text-lg font-semibold tracking-tight">NeevCabs</span>
          </div>

          <h1 className="mt-5 lg:mt-14 text-xl sm:text-2xl lg:text-[2.35rem] font-bold leading-[1.2] tracking-tight max-w-lg">
            Drive Electric. Drive Green. Drive the Future.
          </h1>
          <p className="mt-2 lg:mt-4 text-xs sm:text-sm lg:text-[15px] text-primary-foreground/85 max-w-md leading-relaxed">
            India&apos;s centralized EV fleet operations platform — your driver app synced with Neev Operations in real time.
          </p>
        </div>

        <div className="relative z-10 mt-5 lg:mt-0 grid grid-cols-3 gap-2 lg:gap-3">
          {[
            { icon: Zap, title: "100% Electric", sub: "Zero Emissions" },
            { icon: Leaf, title: "Eco Friendly", sub: "18K+ kg CO₂ Saved" },
            { icon: Shield, title: "Secure", sub: "AI-Powered" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg lg:rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-2.5 py-2.5 lg:px-4 lg:py-3.5"
            >
              <item.icon className="size-4 lg:size-5 mb-1 lg:mb-2 opacity-95" strokeWidth={2} />
              <div className="text-[11px] lg:text-sm font-semibold leading-tight">{item.title}</div>
              <div className="text-[9px] lg:text-[11px] text-primary-foreground/75 mt-0.5 hidden sm:block lg:block">
                {item.sub}
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 mt-4 lg:mt-8 text-[10px] lg:text-[11px] text-primary-foreground/70 text-center lg:text-left">
          Powering sustainable mobility since 2023
        </p>
      </aside>

      {/* Login form — first on mobile */}
      <main className="flex-1 flex flex-col items-center justify-center bg-[#eef2ef] px-4 py-6 sm:py-8 lg:py-12 min-h-screen lg:min-h-screen safe-top">
        <div className="lg:hidden w-full max-w-[420px] flex flex-col items-center text-center mb-6 animate-fade-up">
          <div className="size-14 rounded-2xl bg-primary grid place-items-center text-primary-foreground shadow-lg shadow-primary/25">
            <Car className="size-7" strokeWidth={2.2} />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Neev<span className="text-primary">Cabs</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Driver Operations</p>
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-card border border-border/80 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8 animate-fade-up">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Welcome Back</h2>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Sign in to your driver operations dashboard
          </p>

          <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2 h-10 w-full rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm">
            <User className="size-3.5" />
            Login as Driver
          </div>

          <form onSubmit={submit} className="mt-5 sm:mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
              <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring/40 transition">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@neevcabs.com"
                  autoComplete="email"
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted-foreground/55"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Password</label>
              <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring/40 transition">
                <Lock className="size-4 text-muted-foreground shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted-foreground/55"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 transition active:scale-[.99] disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In to Driver Operations"
              )}
            </button>
          </form>

          <div className="my-5 sm:my-6 border-t border-border" />
          <p className="text-[11px] text-center text-muted-foreground mb-3">
            Demo Mode — click to fill credentials
          </p>
          <button
            type="button"
            onClick={fillDemo}
            className="w-full h-11 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted/60 transition"
          >
            Use Demo Driver Account
          </button>
        </div>

        <p className="mt-4 sm:mt-6 max-w-[420px] text-center text-[11px] text-muted-foreground px-2">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </main>
    </div>
  );
}
