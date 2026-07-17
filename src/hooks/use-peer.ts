import { useCallback, useRef } from "react";
import { roomId } from "@/lib/room-info";
import { useRouter } from "@/hooks/use-router";
import { useStorage } from "@/hooks/use-storage";
import { useRoom } from "@/hooks/use-room";
import { createPeer } from "@/lib/peer-driver";
import type { Message } from "@/lib/types";
import type { Peer } from "peerix";

export function usePeer() {
  const { navigate } = useRouter();
  const { value: username } = useStorage("username");
  const { cam, mic, setParticipants, setMessages, toggleCam, toggleMic, toggleScr } = useRoom();
  const peerRef = useRef<Peer | null>(null);
  const camRef = useRef(cam);
  const micRef = useRef(mic);

  camRef.current = cam;
  micRef.current = mic;

  const join = useCallback(async (initialStream?: MediaStream | null) => {
    const peer = await createPeer();
    peerRef.current = peer;

    const name = username || "Guest";

    peer.on("error", (e) => {
      console.error("Peer error:", e.error);
    });

    peer.on("local:share", (e) => {
      const { stream, label } = e;
      setParticipants((prev) => {
        const peerId = peerRef.current?.id || name;
        const existing = prev.find(
          (p) => p.label === label && p.peer === peerId,
        );
        const entry = {
          peer: peerId,
          label,
          name,
          ...(label === "camera"
            ? {
                audio: micRef.current,
                video: camRef.current,
                mirror: true,
              }
            : { video: true, audio: true }),
          stream,
          muted: true,
        };
        return existing
          ? prev.map((p) =>
              p.label === label && p.peer === peerId ? entry : p,
            )
          : [...prev, entry];
      });
    });

    peer.on("local:unshare", (e) => {
      const { label } = e;
      setParticipants((prev) => {
        const peerId = peerRef.current?.id || name;
        return label === "camera"
          ? prev.map((p) =>
              p.label === label && p.peer === peerId
                ? { peer: peerId, label, name }
                : p,
            )
          : prev.filter((p) => !(p.label === label && p.peer === peerId));
      });
      if (label === "camera") {
        toggleCam(false);
        toggleMic(false);
      }
      if (label === "screen") {
        toggleScr(false);
      }
    });

    peer.on("connection:new", (e) => {
      const { remote } = e;
      setParticipants((prev) => [
        ...prev,
        {
          peer: remote.id,
          label: "camera",
          name: `${remote.metadata?.name ?? "Guest"}`,
        },
      ]);
    });

    peer.on("connection:closed", (e) => {
      const { remote } = e;
      setParticipants((prev) => prev.filter((p) => p.peer !== remote.id));
    });

    peer.on("track", (e) => {
      const { remote, stream, label } = e;
      setParticipants((prev) => {
        const existing = prev.find(
          (p) => p.label === label && p.peer === remote.id,
        );
        const entry = {
          peer: remote.id,
          label,
          name,
          stream,
          audio: stream.getAudioTracks().length > 0,
          video: stream.getVideoTracks().length > 0,
        };
        return existing
          ? prev.map((p) =>
              p.label === label && p.peer === remote.id ? entry : p,
            )
          : [...prev, entry];
      });
    });

    peer.on("channel:message", async (e) => {
      const { remote, data } = e;
      const message = (await data) as Message;
      setMessages((prev) => [...prev, { ...message, peer: remote.id }]);
    });

    peer.open({ label: "chat" });

    await peer.join({ room: roomId, metadata: { name } });

    if (initialStream) {
      peer.share({ stream: initialStream, label: "camera" });
    } else {
      setParticipants((prev) => [
        ...prev,
        { peer: peerRef.current?.id || name, label: "camera", name },
      ]);
    }

    navigate("room");
  }, [navigate, username, setParticipants, setMessages, toggleCam, toggleMic, toggleScr]);

  const leave = useCallback(async () => {
    peerRef.current?.unshare({ label: "camera" });
    peerRef.current?.unshare({ label: "screen" });
    await peerRef.current?.leave();
    peerRef.current = null;
    setParticipants([]);
    setMessages([]);
    toggleCam(false);
    toggleMic(false);
    toggleScr(false);
    navigate("lobby");
  }, [navigate, setParticipants, setMessages, toggleCam, toggleMic, toggleScr]);

  return { peerRef, join, leave };
}
