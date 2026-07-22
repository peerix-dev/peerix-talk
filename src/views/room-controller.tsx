import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "@/hooks/use-router";
import { useStorage } from "@/hooks/use-storage";
import { useRoom } from "@/hooks/use-room";
import { usePeer } from "@/hooks/use-peer";
import { useMediaShare } from "@/hooks/use-media-share";
import { useChatBridge } from "@/hooks/use-chat-bridge";
import { LobbyView } from "@/views/lobby/lobby-view";
import { RoomView } from "@/views/room/room-view";

export function RoomController() {
  const { t } = useTranslation();
  const { route } = useRouter();
  const { setMessages } = useRoom();
  const { value: username } = useStorage("username");
  const { peerRef, join, leave } = usePeer();
  const streamRef = useMediaShare(peerRef);
  useChatBridge(peerRef);

  const handleJoin = useCallback(async () => {
    await join(streamRef.current);
  }, [join, streamRef]);

  const handleSend = useCallback(
    (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), author: username || t("common.defaultUserName"), text, time: Date.now() },
      ]);
    },
    [username, t, setMessages],
  );

  return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      {route === "lobby" && <LobbyView onJoin={handleJoin} />}
      {route === "room" && <RoomView onLeave={leave} onSend={handleSend} />}
    </div>
  );
}
