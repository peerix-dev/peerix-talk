import { createContext, useCallback, useContext, useMemo, useState } from "react";

type StorageMap = Record<string, string>;

type StorageState = {
  get: (key: string) => string;
  set: (key: string, value: string) => void;
};

const StorageContext = createContext<StorageState | undefined>(undefined);

function loadAll(): StorageMap {
  try {
    const raw = localStorage.getItem("peerix-storage");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StorageMap>(loadAll);

  const get = useCallback(
    (key: string) => store[key] ?? "",
    [store],
  );

  const set = useCallback((key: string, value: string) => {
    setStore((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("peerix-storage", JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ get, set }), [get, set]);

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

/**
 * Access a specific localStorage key as reactive state.
 *
 * @example
 *   const { value, setValue } = useStorage("username");
 */
export function useStorage(key: string) {
  const ctx = useContext(StorageContext);
  if (ctx === undefined) {
    throw new Error("useStorage must be used within a StorageProvider");
  }

  const value = ctx.get(key);
  const setValue = (next: string) => ctx.set(key, next);

  return { value, setValue };
}
