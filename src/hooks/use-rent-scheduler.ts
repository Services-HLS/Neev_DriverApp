import { useEffect } from "react";
import { rentBase, rentPenalty } from "@/lib/data";
import { getState, pushNotification, setState, useAppState } from "@/lib/store";
import { todayKey } from "@/lib/operations";

/** App-wide rent reminders at 2:00 PM, 2:30 PM, and late fee after 3:01 PM (once per day). */
export function useRentScheduler() {
  const rentPaid = useAppState((s) => s.rentPaidToday);
  const penalty = useAppState((s) => s.rentLatePenaltyApplied);
  const reminder2 = useAppState((s) => s.rentReminder2pm);
  const reminder230 = useAppState((s) => s.rentReminder230pm);

  useEffect(() => {
    const tick = () => {
      const s = getState();
      if (s.rentPaidToday) return;

      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const today = todayKey(now);

      if (mins >= 14 * 60 && !s.rentReminder2pm) {
        setState({ rentReminder2pm: true });
        pushNotification({
          title: "Rent Reminder",
          body: `Reminder: Pay rent of ₹${rentBase} before 3 PM.`,
          kind: "warn",
        });
      }

      if (mins >= 14 * 60 + 30 && !s.rentReminder230pm) {
        setState({ rentReminder230pm: true });
        pushNotification({
          title: "Final Reminder",
          body: "Final Reminder: Rent due in 30 minutes",
          kind: "warn",
        });
      }

      if (mins > 15 * 60 && s.rentPenaltyDate !== today && !s.rentLatePenaltyApplied) {
        setState({
          rentLatePenaltyApplied: true,
          rentPenaltyDate: today,
        });
        pushNotification({
          title: "Late Fee Applied",
          body: `Daily rent increased by ₹${rentPenalty}. New total ₹${rentBase + rentPenalty}.`,
          kind: "error",
        });
      }
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [rentPaid, penalty, reminder2, reminder230]);
}
