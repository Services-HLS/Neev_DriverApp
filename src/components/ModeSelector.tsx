import { Briefcase, Car, Crown, Check } from "lucide-react";

const modes = [
  { id: "business", title: "B2B", icon: Briefcase, disabled: true },
  { id: "customer", title: "B2C", icon: Car, disabled: false },
  { id: "be-the-owner", title: "Be the Owner", icon: Crown, disabled: true },
] as const;

export function ModeSelector() {
  return (
    <section className="animate-fade-up">
      <div className="page-eyebrow mb-2">Operational mode</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const active = m.id === "customer";
          return (
            <div
              key={m.id}
              className={`relative rounded-xl border p-3 transition ${
                m.disabled
                  ? "opacity-45 grayscale border-border bg-foreground/5 cursor-not-allowed"
                  : active
                    ? "glass-strong glow-ring border-primary/40"
                    : "glass border-border"
              }`}
              aria-disabled={m.disabled}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`size-8 rounded-lg grid place-items-center ${active ? "bg-primary text-primary-foreground" : "bg-foreground/10 text-muted-foreground"}`}>
                  <Icon className="size-4" />
                </div>
                {active && (
                  <span className="size-5 rounded-full bg-primary grid place-items-center text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm font-semibold">{m.title}</div>
              {m.disabled && <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Disabled</div>}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Company managed vehicle operations.</p>
    </section>
  );
}
