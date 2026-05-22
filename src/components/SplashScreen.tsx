import { Car, Leaf, Zap } from "lucide-react";

/** Matches https://driver-app-eta-lovat.vercel.app/ startup animation */
export function SplashScreen({ exiting }: { exiting?: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${exiting ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      aria-hidden={exiting}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

      <div className="absolute w-64 h-64 rounded-full bg-primary/5 splash-ring splash-ring-a" />
      <div className="absolute w-48 h-48 rounded-full bg-primary/10 splash-ring splash-ring-b" />

      <div className="relative flex flex-col items-center gap-6 splash-content">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 splash-logo">
            <Car className="w-12 h-12 text-primary-foreground" strokeWidth={2} />
          </div>
          <div className="absolute -top-2 -right-2 splash-badge splash-badge-leaf">
            <div className="p-2 rounded-full bg-secondary shadow-md">
              <Leaf className="w-4 h-4 text-secondary-foreground" strokeWidth={2} />
            </div>
          </div>
          <div className="absolute -bottom-1 -left-2 splash-badge splash-badge-zap">
            <div className="p-2 rounded-full bg-yellow-400 shadow-md">
              <Zap className="w-4 h-4 text-yellow-900" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="text-center splash-title-block">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Neev<span className="text-primary">Cabs</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-base font-medium splash-tagline">
            Drive Electric. Drive Green.
          </p>
        </div>

        <div className="flex gap-1.5 mt-2 splash-dots">
          <span className="w-2 h-2 rounded-full bg-primary splash-dot" />
          <span className="w-2 h-2 rounded-full bg-primary splash-dot splash-dot-2" />
          <span className="w-2 h-2 rounded-full bg-primary splash-dot splash-dot-3" />
        </div>
      </div>

      <p className="absolute bottom-8 text-sm text-muted-foreground splash-footer">
        Powering sustainable mobility
      </p>
    </div>
  );
}
