import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RouteGuard } from "@/components/RouteGuard";

export const Route = createFileRoute("/_app")({
  component: () => (
    <RouteGuard>
      <AppShell />
    </RouteGuard>
  ),
});
