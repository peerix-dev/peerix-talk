import { Peer, BroadcastChannelDriver, NatsDriver, MqttDriver, SseDriver, type Driver } from "peerix";
import { getConfig, loadConfig } from "@/lib/config";

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

  if (!cfg.driver) {
    return new BroadcastChannelDriver();
  }

  switch (cfg.driver.type) {
    case "nats": {
      const { wsconnect } = await import("@nats-io/nats-core") as any;
      const nc = await wsconnect({ servers: cfg.driver.servers, noEcho: true });
      return new NatsDriver({ nc, prefix: cfg.driver.prefix });
    }

    case "mqtt": {
      const mqtt = await import("mqtt") as any;
      const connect = mqtt.connect || mqtt.default?.connect;
      if (!connect) throw new Error("mqtt module does not export connect");

      const client = connect(cfg.driver.server);
      return new MqttDriver({ client, prefix: cfg.driver.prefix });
    }

    case "sse": {
      return new SseDriver({
        url: cfg.driver.url,
        subscriber: {},
        publisher: {
          headers: {
            Authorization: `Bearer ${cfg.driver.publisherJwtKey}`,
          },
        },
      });
    }
  }
}

/**
 * Creates a Peer with the configured driver and ICE settings.
 */
export async function createPeer(): Promise<Peer> {
  const driver = await createDriver();
  const cfg = getConfig();
  return new Peer({
    driver,
    iceServers: cfg?.iceServers,
    iceTransportPolicy: cfg?.iceTransportPolicy,
  });
}


