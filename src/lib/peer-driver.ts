import { Peer, BroadcastChannelDriver, NatsDriver, MqttDriver, SseDriver, type Driver } from "peerix";
import { loadConfig } from "@/lib/config";

/**
 * Creates a Peerix Driver instance based on the loaded config.
 *
 * - "broadcastchannel" (default) — no external dependency needed.
 * - "nats" — dynamically imports `@nats-io/nats-core` and creates a WebSocket NATS connection.
 * - "mqtt" — dynamically imports `mqtt` and creates an MQTT client.
 * - "sse" — uses the built-in SseDriver with Mercure-compatible options.
 */
export async function createDriver(): Promise<Driver> {
  const cfg = await loadConfig();

  switch (cfg.useDriver) {
    case "nats": {
      const natsCfg = cfg.drivers.nats;
      if (!natsCfg) throw new Error("NATS driver configured but no NATS options in config");

      const { wsconnect } = await import(/* @vite-ignore */ natsCfg.module);
      const nc = await wsconnect({ servers: natsCfg.servers, noEcho: true });
      return new NatsDriver({ nc, prefix: natsCfg.prefix });
    }

    case "mqtt": {
      const mqttCfg = cfg.drivers.mqtt;
      if (!mqttCfg) throw new Error("MQTT driver configured but no MQTT options in config");

      const mqtt = await import(/* @vite-ignore */ mqttCfg.module);
      const connect = mqtt.connect || mqtt.default?.connect;
      if (!connect) throw new Error("mqtt module does not export connect");

      const client = connect(mqttCfg.server);
      return new MqttDriver({ client, prefix: mqttCfg.prefix });
    }

    case "sse": {
      const sseCfg = cfg.drivers.sse;
      if (!sseCfg) throw new Error("SSE driver configured but no SSE options in config");

      return new SseDriver({
        url: sseCfg.url,
        subscriber: {},
        publisher: {
          headers: {
            Authorization: `Bearer ${sseCfg.publisherJwtKey}`,
          },
        },
      });
    }

    default:
      return new BroadcastChannelDriver();
  }
}

/**
 * Creates a Peer with the configured driver.
 */
export async function createPeer(): Promise<Peer> {
  const driver = await createDriver();
  return new Peer({ driver });
}
