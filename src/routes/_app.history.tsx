import { createFileRoute, redirect } from "@tanstack/react-router";

/** B2C driver app — trip history not used; rent & EMI live under Payments. */
export const Route = createFileRoute("/_app/history")({
  beforeLoad: () => {
    throw redirect({ to: "/payments" });
  },
});
