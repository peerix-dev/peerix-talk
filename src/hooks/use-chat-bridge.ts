import { useEffect } from "react";
import { useRoom } from "@/hooks/use-room";
import type { Peer } from "peerix";

export function useChatBridge(peerRef: React.MutableRefObject<Peer | null>) {
  const { messages } = useRoom();

  useEffect(() => {
    const peer = peerRef.current;
    const msg = messages[messages.length - 1];
    if (peer && msg && !msg.peer) {
      peer.send(msg, { label: "chat" });
    }
  }, [messages]);
}
