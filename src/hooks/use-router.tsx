import { createContext, useContext, useState } from "react";

export type Route = "lobby" | "room";

interface RouterState {
  route: Route;
  navigate: (next: Route) => void;
}

const RouterContext = createContext<RouterState | undefined>(undefined);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>("lobby");

  return (
    <RouterContext.Provider value={{ route, navigate: setRoute }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (ctx === undefined) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return ctx;
}
