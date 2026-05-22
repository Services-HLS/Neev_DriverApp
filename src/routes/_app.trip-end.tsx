import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { TripSubmissionFlow } from "@/components/TripSubmissionFlow";
import { useAppState, useMounted } from "@/lib/store";

export const Route = createFileRoute("/_app/trip-end")({
  component: TripEndPage,
  head: () => ({ meta: [{ title: "End Trip · Submit for Analysis · Neev Driver" }] }),
});

function TripEndPage() {
  const mounted = useMounted();
  const tripActive = useAppState((s) => s.tripActive);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mounted) return;
    if (!tripActive) navigate({ to: "/business" });
  }, [mounted, tripActive, navigate]);

  if (!mounted || !tripActive) {
    return (
      <div className="page-shell grid place-items-center py-20">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <TripSubmissionFlow phase="end" />;
}
