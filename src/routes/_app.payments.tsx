import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, CheckCircle2, AlertTriangle, Receipt, Wallet } from "lucide-react";
import { emi, rentBase, rentPenalty, emiPaymentHistory } from "@/lib/data";
import { useAppState, setState, pushNotification } from "@/lib/store";
import { useRentScheduler } from "@/hooks/use-rent-scheduler";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/payments")({
  component: PaymentsPage,
  head: () => ({ meta: [{ title: "Payments & Dues · Neev Driver" }] }),
});

function PaymentsPage() {
  useRentScheduler();
  const rentPaid = useAppState((s) => s.rentPaidToday);
  const penalty = useAppState((s) => s.rentLatePenaltyApplied);
  const [tab, setTab] = useState<"emi" | "rent">("rent");
  const [receipt, setReceipt] = useState<null | { id: string; amount: number; kind: string; lateFee: number }>(null);

  const total = rentBase + (penalty ? rentPenalty : 0);
  const rentStatus = rentPaid ? "Paid" : penalty ? "Late Fee Applied" : "Due";

  const payRent = () => {
    setState({ rentPaidToday: true });
    pushNotification({ title: "Payment Success", body: `Daily rent ₹${total} paid successfully.`, kind: "success" });
    setReceipt({ id: "RCT-" + Date.now().toString().slice(-6), amount: total, kind: "Daily Rent", lateFee: penalty ? rentPenalty : 0 });
  };

  const payEmi = () => {
    pushNotification({ title: "Payment Success", body: `EMI installment ₹${emi.monthly} processed.`, kind: "success" });
    setReceipt({ id: "EMI-" + Date.now().toString().slice(-6), amount: emi.monthly, kind: "EMI Installment", lateFee: 0 });
  };

  return (
    <div className="page-shell-wide space-y-4">
      <PageHeader eyebrow="Financials" title="Payments & Dues" />

      <div className="flex gap-1.5 glass rounded-xl p-1 w-fit">
        {(["emi", "rent"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-4 h-8 rounded-lg text-xs font-medium transition ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {k === "emi" ? "EMI Tracking" : "Daily Rent"}
          </button>
        ))}
      </div>

      {tab === "emi" ? (
        <section className="space-y-3">
          <div className="rounded-xl eco-gradient text-primary-foreground p-4 glow-ring relative overflow-hidden animate-fade-up">
            <div className="text-[10px] uppercase tracking-widest opacity-80">Total advance</div>
            <div className="mt-0.5 font-mono stat-lg">₹{emi.totalDeposit.toLocaleString()}</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Stat label="Paid" value={`₹${emi.paid.toLocaleString()}`} />
              <Stat label="Remaining" value={`₹${emi.remaining.toLocaleString()}`} />
              <Stat label="Next EMI" value={emi.nextDue} />
            </div>
            <div className="mt-5">
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full bg-white animate-battery-fill" style={{ width: `${(emi.paid / emi.totalDeposit) * 100}%` }} />
              </div>
              <div className="mt-1 text-xs opacity-90 font-mono">{Math.round((emi.paid / emi.totalDeposit) * 100)}% completed</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 glass card-md animate-fade-up">
              <div className="text-xs font-semibold mb-2">Installment timeline</div>
              <div className="space-y-2">
                {emi.installments.map((i) => (
                  <div key={i.n} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5">
                    <div className={`size-8 rounded-lg grid place-items-center text-xs font-mono ${i.status === "paid" ? "eco-gradient text-primary-foreground" : i.status === "due" ? "bg-destructive/15 text-destructive" : "bg-foreground/10 text-muted-foreground"}`}>{i.n}</div>
                    <div className="flex-1">
                      <div className="text-sm">Installment #{i.n}</div>
                      <div className="text-xs text-muted-foreground font-mono">{i.date}</div>
                    </div>
                    <div className="font-mono text-sm">₹{i.amount.toLocaleString()}</div>
                    <div className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${i.status === "paid" ? "eco-soft text-primary" : i.status === "due" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{i.status}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-strong card-md h-fit animate-fade-up">
              <div className="page-eyebrow">Next EMI</div>
              <div className="mt-0.5 stat-md text-eco-gradient">₹{emi.monthly.toLocaleString()}</div>
              <div className="text-[11px] text-muted-foreground">{emi.nextDue}</div>
              <button type="button" onClick={payEmi} className="mt-3 w-full btn-md bg-primary text-primary-foreground">
                <Wallet className="size-3.5 inline mr-1.5" /> Pay installment
              </button>
              <div className="mt-4 text-[11px] text-muted-foreground">EMI remains independent of daily rent and trip access.</div>
            </div>
          </div>

          <div className="glass card-md animate-fade-up">
            <div className="text-xs font-semibold mb-2">Payment history</div>
            <div className="space-y-2">
              {emiPaymentHistory.map((p) => (
                <div key={p.receipt} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5">
                  <Receipt className="size-4 text-primary" />
                  <div className="flex-1 text-sm">{p.date}</div>
                  <div className="font-mono text-sm">₹{p.amount.toLocaleString()}</div>
                  <div className="text-xs font-mono text-muted-foreground">{p.receipt}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="grid lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-3">
            <div className={`rounded-xl p-4 glow-ring animate-fade-up ${rentPaid ? "glass-strong" : "eco-gradient text-primary-foreground"}`}>
              <div className="text-[10px] uppercase tracking-widest opacity-80">Today&apos;s rent</div>
              <div className="mt-0.5 stat-lg">₹{total.toLocaleString()}</div>
              <div className="mt-1.5 text-xs opacity-90 flex flex-wrap items-center gap-2">
                <Clock className="size-3.5" /> Pay before 3:00 PM
                <span className={`text-xs px-2 py-0.5 rounded-full ${rentStatus === "Paid" ? "eco-soft text-primary" : rentStatus === "Late Fee Applied" ? "bg-destructive/20" : "bg-white/15"}`}>
                  {rentStatus}
                </span>
                {penalty && !rentPaid && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive/20">
                    <AlertTriangle className="size-3" /> +₹{rentPenalty} late fee
                  </span>
                )}
              </div>
              {!rentPaid && (
                <button type="button" onClick={payRent} className="mt-4 btn-md bg-primary-foreground text-primary">
                  Pay now · ₹{total.toLocaleString()}
                </button>
              )}
            </div>

            <div className="glass card-md animate-fade-up">
              <div className="text-xs font-semibold">Reminder schedule</div>
              <div className="mt-2 space-y-1.5 text-xs">
                <RemRow time="2:00 PM" label="Reminder: Pay rent before 3 PM" />
                <RemRow time="2:30 PM" label="Final Reminder: Rent due in 30 minutes" />
                <RemRow time="3:01 PM" label={`Late fee ₹${rentPenalty} applied once per day (₹${rentBase} → ₹${rentBase + rentPenalty})`} warn />
              </div>
            </div>
          </div>

          <div className="glass card-md h-fit animate-fade-up">
            <div className="text-xs font-semibold mb-2">Rent history</div>
            <div className="space-y-1.5 text-xs">
              {[
                { d: "Yesterday", a: 1400, fee: 0, s: "Paid" },
                { d: "20 May", a: 1400, fee: 0, s: "Paid" },
                { d: "19 May", a: 1650, fee: 250, s: "Late Fee Applied" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5">
                  <Receipt className="size-4 text-primary" />
                  <div className="flex-1">{r.d}</div>
                  <div className="font-mono">₹{r.a}</div>
                  <div className="text-[10px] text-muted-foreground">{r.s}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {receipt && (
        <div className="fixed inset-0 z-50 grid place-items-center px-4 animate-fade-in">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" onClick={() => setReceipt(null)} />
          <div className="relative w-full max-w-sm rounded-xl glass-strong p-5 animate-fade-up text-center">
            <div className="size-12 mx-auto rounded-full bg-primary grid place-items-center text-primary-foreground">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="mt-3 text-base font-semibold">Payment successful</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">Receipt {receipt.id}</div>
            <div className="mt-4 rounded-2xl eco-soft p-4">
              <div className="text-xs text-muted-foreground">{receipt.kind}</div>
              <div className="stat-md text-eco-gradient">₹{receipt.amount.toLocaleString()}</div>
              {receipt.lateFee > 0 && <div className="text-xs text-muted-foreground mt-1">Includes late fee ₹{receipt.lateFee}</div>}
            </div>
            <button onClick={() => setReceipt(null)} className="mt-5 w-full h-11 rounded-xl border border-border hover:bg-foreground/5">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest opacity-80">{label}</div>
      <div className="font-mono font-semibold text-sm mt-0.5">{value}</div>
    </div>
  );
}

function RemRow({ time, label, warn }: { time: string; label: string; warn?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-foreground/5">
      <div className="font-mono text-xs w-16">{time}</div>
      <div className="flex-1">{label}</div>
      {warn && <AlertTriangle className="size-4 text-destructive" />}
    </div>
  );
}
