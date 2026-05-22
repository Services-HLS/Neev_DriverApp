import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, CheckCircle2, AlertTriangle, Car, Wallet, ShieldCheck } from "lucide-react";
import { setState, useAppState } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notifications · Neev Driver" }] }),
});

const iconMap: Record<string, typeof Bell> = {
  success: CheckCircle2,
  warn: AlertTriangle,
  error: AlertTriangle,
  info: Bell,
  vehicle: Car,
  payment: Wallet,
  verify: ShieldCheck,
};

const seed = [
  { id: "s1", title: "Vehicle Assigned", body: "Today's vehicle assigned by Neev Operations Team.", kind: "info", ts: Date.now() - 3600000, read: true },
  { id: "s2", title: "EMI Reminder", body: "Next installment due on schedule.", kind: "warn", ts: Date.now() - 7200000, read: true },
];

function NotificationsPage() {
  const notifications = useAppState((s) => s.notifications);
  const list = notifications.length ? notifications : seed;

  const markAll = () => setState((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));

  return (
    <div className="page-shell space-y-4">
      <div className="flex items-end justify-between gap-3 animate-fade-up">
        <PageHeader eyebrow="Updates" title="Notifications" />
        <button type="button" onClick={markAll} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border hover:bg-foreground/5 text-xs shrink-0">
          <CheckCheck className="size-4" /> Mark all read
        </button>
      </div>

      <div className="space-y-2">
        {list.map((n, i) => {
          const Icon = iconMap[n.kind] || Bell;
          const tone =
            n.kind === "success"
              ? "text-primary eco-soft"
              : n.kind === "warn"
                ? "text-amber-600 bg-amber-500/10"
                : n.kind === "error"
                  ? "text-destructive bg-destructive/10"
                  : "text-teal bg-teal/10";
          return (
            <div
              key={n.id}
              style={{ animationDelay: `${i * 70}ms` }}
              className={`glass rounded-xl p-3 flex gap-2.5 items-start animate-fade-up transition ${!n.read ? "glow-ring" : "opacity-90"}`}
            >
              <div className={`size-10 rounded-xl grid place-items-center shrink-0 ${tone}`}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                    {new Date(n.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">{n.body}</div>
              </div>
              {!n.read && <span className="size-2 rounded-full bg-primary animate-pulse-glow shrink-0 mt-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
