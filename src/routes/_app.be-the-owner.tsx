import { createFileRoute } from "@tanstack/react-router";
import { Crown, Sparkles, Bell, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/be-the-owner")({
  component: OwnerPage,
});

function OwnerPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl glass-strong p-8 lg:p-12 glow-ring animate-fade-up">
        <div className="absolute -top-20 -right-20 size-72 rounded-full eco-gradient opacity-40 blur-3xl animate-eco-float" />
        <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-teal/40 blur-3xl animate-eco-float [animation-delay:-3s]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full eco-gradient text-primary-foreground animate-pulse-glow">
            <Sparkles className="size-3" /> Coming Soon
          </div>
          <h1 className="mt-5 text-4xl lg:text-5xl font-semibold tracking-tight">
            Be the <span className="text-eco-gradient">Owner.</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Build your own EV business with Neev. Own multiple vehicles, onboard drivers, monitor fleet telemetry, and grow with our hub network — all from this same app.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            {[
              { k: "Fleet", v: "Own up to 25 EVs" },
              { k: "Revenue", v: "Daily settlements" },
              { k: "Support", v: "Hub & service network" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl eco-soft p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.k}</div>
                <div className="font-medium mt-1">{s.v}</div>
              </div>
            ))}
          </div>

          <button className="mt-8 inline-flex items-center gap-2 h-12 px-5 rounded-xl eco-gradient text-primary-foreground font-semibold glow-ring">
            <Bell className="size-4" /> Notify me when live <ArrowRight className="size-4" />
          </button>
        </div>

        <Crown className="absolute right-6 bottom-6 size-16 text-primary/30" />
      </div>
    </div>
  );
}
