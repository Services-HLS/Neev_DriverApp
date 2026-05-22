import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, Wallet, Receipt } from "lucide-react";
import { tripHistory, rentHistory, emi, emiPaymentHistory } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "Driver History · Neev Driver" }] }),
});

const tabs = [
  { id: "trips", label: "Trip History", icon: Briefcase },
  { id: "rent", label: "Rent History", icon: Wallet },
  { id: "emi", label: "EMI History", icon: Receipt },
] as const;

function HistoryPage() {
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("trips");

  return (
    <div className="page-shell-wide space-y-4">
      <PageHeader eyebrow="Records" title="Driver History" />

      <div className="flex gap-1.5 glass rounded-xl p-1 w-fit overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition whitespace-nowrap ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-xl overflow-hidden animate-fade-up text-xs">
        {tab === "trips" && (
          <Table
            head={["Date", "Vehicle", "Shift", "Start", "End", "Odometer", "Verification"]}
            rows={tripHistory.map((b) => [b.date, `${b.vehicle} (${b.reg})`, b.shift, b.start, b.end, b.odometer, b.verification])}
          />
        )}
        {tab === "rent" && (
          <Table
            head={["Date", "Rent Amount", "Late Fee", "Status"]}
            rows={rentHistory.map((r) => [r.date, `₹${r.amount.toLocaleString()}`, r.lateFee ? `₹${r.lateFee}` : "—", r.status])}
          />
        )}
        {tab === "emi" && (
          <>
            <Table
              head={["#", "Due Date", "Amount", "Status"]}
              rows={emi.installments.map((i) => [`#${i.n}`, i.date, `₹${i.amount.toLocaleString()}`, i.status])}
            />
            <div className="border-t border-border p-5">
              <div className="text-sm font-semibold mb-3">Receipts</div>
              <div className="space-y-2">
                {emiPaymentHistory.map((p) => (
                  <div key={p.receipt} className="flex justify-between text-sm font-mono px-3 py-2 rounded-xl bg-foreground/5">
                    <span>{p.date}</span>
                    <span>₹{p.amount.toLocaleString()}</span>
                    <span className="text-muted-foreground">{p.receipt}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
            {head.map((h) => (
              <th key={h} className="px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-foreground/5">
              {r.map((c, j) => (
                <td key={j} className={`px-5 py-3 ${j === 0 || /[0-9₹,(]/.test(String(c)) ? "font-mono" : ""}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
