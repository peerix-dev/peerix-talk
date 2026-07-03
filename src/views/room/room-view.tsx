import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LogoutCircle01Icon,
  ComputerScreenShareIcon,
  ChatIcon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { getRoomId } from "@/lib/room-id";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MediaButton } from "@/components/media-button";
import { VideoGrid } from "@/views/room/video-grid";
import { ChatPanel } from "@/views/room/chat-panel";
import { ShareDialog } from "@/views/share-dialog";

function formatDuration(s: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function RoomView({ onLeave }: { onLeave: () => void }) {
  const { t } = useTranslation();
  const { roomId } = getRoomId();
  const [chatOpen, setChatOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [mic, setMic] = useState(false);
  const [cam, setCam] = useState(false);
  const [screen, setScreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((d) => d + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <header className="flex items-center gap-4 m-4 mb-0">
        <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
        <Separator orientation="vertical" />
        <div className="min-w-0 flex flex-col">
          <div className="text-sm truncate">{t("common.appName")}</div>
          <div className="text-xs font-bold font-mono truncate">
            #{roomId} · {formatDuration(elapsed)}
          </div>
        </div>
        <div className="grow" />
        <div className="flex gap-2">
          <MediaButton
            kind="audio"
            enabled={mic}
            deviceId=""
            onToggle={() => setMic(!mic)}
            onDeviceChange={() => {}}
          />
          <MediaButton
            kind="video"
            enabled={cam}
            deviceId=""
            onToggle={() => setCam(!cam)}
            onDeviceChange={() => {}}
          />
          <Button
            size="lg"
            variant="outline"
            onClick={() => setScreen(!screen)}
          >
            <HugeiconsIcon icon={ComputerScreenShareIcon} />
          </Button>
          <Button
            size="lg"
            variant={chatOpen ? "default" : "outline"}
            onClick={() => setChatOpen(!chatOpen)}
          >
            <HugeiconsIcon icon={ChatIcon} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShareOpen(true)}
          >
            <HugeiconsIcon icon={Share01Icon} />
          </Button>
          <Separator orientation="vertical" />
          <Button variant="destructive" size="icon-lg" onClick={onLeave}>
            <HugeiconsIcon icon={LogoutCircle01Icon} />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 gap-4 overflow-hidden p-4">
        <VideoGrid asideOpen={chatOpen} />
        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
      </main>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
