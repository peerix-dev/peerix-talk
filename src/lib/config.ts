export interface AppConfig {
  useDriver: "nats" | "mqtt" | "sse" | null;
  drivers: {
    mqtt?: {
      module: string;
      server: string;
      prefix: string;
    };
    nats?: {
      module: string;
      servers: string[];
      prefix: string;
    };
    sse?: {
      url: string;
      publisherJwtKey: string;
    };
  };
}

let configPromise: Promise<AppConfig> | null = null;
let resolvedConfig: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  if (resolvedConfig) return resolvedConfig;

  if (!configPromise) {
    configPromise = (async () => {
      const res = await fetch("/config.json");
      if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
      const data = await res.json();
      const cfg: AppConfig = {
        useDriver: data.useDriver ?? null,
        drivers: data.drivers ?? {},
      };
      resolvedConfig = cfg;
      return cfg;
    })();
  }

  return configPromise;
}

export function getConfig(): AppConfig | null {
  return resolvedConfig;
}
