import { useCallback, useState } from "react";

export type Route = "lobby" | "room";

export function useRouter() {
  const [route, setRoute] = useState<Route>("lobby");

  const navigate = useCallback((nextRoute: Route) => {
    setRoute(nextRoute);
  }, []);

  return { route, navigate };
}
