import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, IdCard, Phone, MapPin, Calendar, Wallet, Leaf, User } from "lucide-react";
import { driver } from "@/lib/data";
import { logout } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile · Neev Driver" }] }),
});

function ProfilePage() {
  const navigate = useNavigate();
  const onLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="page-shell-wide space-y-4">
      <PageHeader eyebrow="Account" title="Driver Profile" />
      <section className="relative overflow-hidden rounded-xl eco-gradient text-primary-foreground p-4 glow-ring animate-fade-up">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-white/20 blur-3xl animate-eco-float" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="size-16 rounded-xl bg-white/15 border border-white/30 grid place-items-center overflow-hidden shrink-0">
            <User className="size-8 opacity-90" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest opacity-80">Driver</div>
            <h2 className="text-lg font-semibold tracking-tight truncate">{driver.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm opacity-90">
              <span className="font-mono">{driver.id}</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-xs">
                <Leaf className="size-3" /> {driver.status}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="glass card-md grid sm:grid-cols-2 gap-2 animate-fade-up">
        <Row icon={<Phone className="size-4" />} label="Phone" value={driver.mobile} />
        <Row icon={<IdCard className="size-4" />} label="License" value={driver.license} />
        <Row icon={<Calendar className="size-4" />} label="Joining Date" value={driver.joined} />
        <Row icon={<MapPin className="size-4" />} label="Assigned Hub" value={driver.hub} />
        <Row icon={<Leaf className="size-4" />} label="Driver Status" value={driver.status} />
        <Row icon={<Calendar className="size-4" />} label="Working Days" value={`${driver.workingDays} days`} />
        <Row icon={<Wallet className="size-4" />} label="EMI Completion" value={`${driver.emiCompletion}%`} />
        <Row icon={<Wallet className="size-4" />} label="Total Rent Paid" value={`₹${driver.totalRentPaid.toLocaleString()}`} />
      </section>

      <button
        onClick={onLogout}
        className="btn-md w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-destructive/40 text-destructive hover:bg-destructive/10 transition"
      >
        <LogOut className="size-4" /> Log out
      </button>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-foreground/5">
      <div className="size-9 rounded-lg eco-soft grid place-items-center text-primary">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-mono text-sm">{value}</div>
      </div>
    </div>
  );
}
