import { createFileRoute, redirect } from "@tanstack/react-router";

// /auth doublonnait /admin/login : on redirige.
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/login", replace: true });
  },
});
