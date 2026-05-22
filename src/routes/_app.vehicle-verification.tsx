import { createFileRoute } from "@tanstack/react-router";
import { TripSubmissionFlow } from "@/components/TripSubmissionFlow";

export const Route = createFileRoute("/_app/vehicle-verification")({
  component: () => <TripSubmissionFlow phase="start" />,
  head: () => ({ meta: [{ title: "Trip Authorization · Neev Driver" }] }),
});
