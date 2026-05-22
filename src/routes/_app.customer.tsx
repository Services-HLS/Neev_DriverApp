import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

/** Vehicle rental/selection removed — management assigns vehicles. Redirect to dashboard. */
export const Route = createFileRoute("/_app/customer")({
  component: CustomerRedirect,
});

function CustomerRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/business", replace: true });
  }, [navigate]);
  return null;
}
