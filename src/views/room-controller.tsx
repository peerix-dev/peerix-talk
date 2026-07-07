import { useCallback, useEffect, useRef } from "react";
import { Peer, BroadcastChannelDriver } from "peerix";
import { toast } from "sonner";
import { roomId } from "@/lib/room-info";
import { useRouter } from "@/hooks/use-router";
import { useStorage } from "@/hooks/use-storage";
import { useRoom } from "@/hooks/use-room";
import { LobbyView } from "@/views/lobby/lobby-view";
import { RoomView } from "@/views/room/room-view";

async function getUserMedia(options: {
  audio: boolean;
  video: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
}): Promise<MediaStream> {
  const { audio, video, audioDeviceId, videoDeviceId } = options;
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: audio
      ? audioDeviceId !== undefined
        ? { deviceId: audioDeviceId }
        : true
      : false,
    video: video
      ? videoDeviceId !== undefined
        ? { deviceId: videoDeviceId }
        : true
      : false,
  });
  return stream;
}

async function getDisplayMedia(): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: true,
  });
  return stream;
}

export function RoomController() {
  const { route, navigate } = useRouter();
  const {
    mic,
    cam,
    scr,
    toggleMic,
    toggleCam,
    toggleScr,
    setParticipants,
    setMessages,
  } = useRoom();
  const { value: username } = useStorage("username");
  const { value: audioDeviceId } = useStorage("audioDeviceId");
  const { value: videoDeviceId } = useStorage("videoDeviceId");
  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const camRef = useRef(cam);
  const micRef = useRef(mic);

  camRef.current = cam;
  micRef.current = mic;

  // Microphone and camera
  useEffect(() => {
    if (mic || cam) {
      getUserMedia({ audio: mic, video: cam, audioDeviceId, videoDeviceId })
        .then((stream) => {
          streamRef.current = stream;
          peerRef.current?.share({ stream, label: "camera" });
        })
        .catch((err) => {
          toast.error(`${err.message ?? err}`, { position: "top-center" });
          toggleCam(false);
          toggleMic(false);
        });
    } else {
      peerRef.current?.unshare({ label: "camera" });
      streamRef.current = null;
    }
  }, [mic, cam]);

  // Screen sharing
  useEffect(() => {
    if (scr) {
      getDisplayMedia()
        .then((stream) => {
          peerRef.current?.share({ stream, label: "screen" });
        })
        .catch((err) => {
          toast.error(`${err.message ?? err}`, { position: "top-center" });
          toggleScr(false);
        });
    } else {
      peerRef.current?.unshare({ label: "screen" });
    }
  }, [scr]);

  const handleJoin = useCallback(async () => {
    const driver = new BroadcastChannelDriver();
    const peer = new Peer({ driver });
    peerRef.current = peer;

    const name = username || "Guest";

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

    await peer.join({ room: roomId, metadata: { name } });

    if (streamRef.current) {
      peer.share({ stream: streamRef.current, label: "camera" });
    } else {
      setParticipants((prev) => [
        ...prev,
        { peer: peerRef.current?.id || name, label: "camera", name },
      ]);
    }

    navigate("room");
  }, [navigate, username]);

  const handleLeave = useCallback(async () => {
    peerRef.current?.unshare({ label: "camera" });
    await peerRef.current?.leave();
    peerRef.current = null;
    setParticipants([]);
    setMessages([]);
    navigate("lobby");
  }, [navigate, setParticipants, setMessages]);

  return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      {route === "lobby" && <LobbyView onJoin={handleJoin} />}
      {route === "room" && <RoomView onLeave={handleLeave} />}
    </div>
  );
}
