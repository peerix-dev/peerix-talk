export interface MqttDriverConfig {
  type: "mqtt";
  module: string;
  server: string;
  prefix: string;
}

export interface NatsDriverConfig {
  type: "nats";
  module: string;
  servers: string[];
  prefix: string;
}

export interface SseDriverConfig {
  type: "sse";
  url: string;
  publisherJwtKey: string;
}

export type DriverConfig = MqttDriverConfig | NatsDriverConfig | SseDriverConfig;

export interface AppConfig {
  driver: DriverConfig | null;
  iceServers?: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
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
        driver: data.driver ?? null,
        iceServers: data.iceServers,
        iceTransportPolicy: data.iceTransportPolicy,
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
