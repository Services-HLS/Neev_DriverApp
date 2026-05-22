import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppState, useMounted } from "@/lib/store";

/** Legacy route — login goes directly to dashboard; redirect if hit. */
export const Route = createFileRoute("/mode-select")({
  component: ModeSelectRedirect,
});

function ModeSelectRedirect() {
  const mounted = useMounted();
  const loggedIn = useAppState((s) => s.loggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mounted) return;
    if (!loggedIn) navigate({ to: "/login" });
    else navigate({ to: "/business" });
  }, [mounted, loggedIn, navigate]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
