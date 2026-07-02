import { useCallback, useState } from "react";

export type Route = "join" | "conference";

export function useRouter() {
  const [route, setRoute] = useState<Route>("join");

  const navigate = useCallback((nextRoute: Route) => {
    setRoute(nextRoute);
  }, []);

  return { route, navigate };
}
