import { createFileRoute, redirect } from "@tanstack/react-router";
import { validateOpportunitesSearch } from "@/lib/opportunites-search";

// Ancienne adresse de la recherche : la liste unique vit à /opportunites (paramètres conservés).
export const Route = createFileRoute("/opportunites/search")({
  validateSearch: validateOpportunitesSearch,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/opportunites", search, replace: true });
  },
});
