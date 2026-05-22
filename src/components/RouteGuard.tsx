import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAppState, useMounted, setState } from "@/lib/store";

/** Renders nothing on the server; redirects after mount if requirements not met. */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const loggedIn = useAppState((s) => s.loggedIn);
  const mode = useAppState((s) => s.mode);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mounted) return;
    if (!loggedIn) navigate({ to: "/login" });
    else if (!mode) setState({ mode: "customer" });
  }, [mounted, loggedIn, mode, navigate]);

  if (!mounted || !loggedIn) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}
