export function Battery({ pct, size = "md" }: { pct: number; size?: "sm" | "md" | "lg" }) {
  const h = size === "lg" ? "h-3.5" : size === "sm" ? "h-2" : "h-2.5";
  return (
    <div className={`relative w-full ${h} rounded-full bg-foreground/10 overflow-hidden`}>
      <div
        className="absolute inset-y-0 left-0 rounded-full eco-gradient animate-battery-fill"
        style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
      />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-white/40 blur-md animate-charging" />
      </div>
    </div>
  );
}
