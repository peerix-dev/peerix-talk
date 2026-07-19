import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LogoutCircle01Icon,
  ComputerScreenShareIcon,
  ChatIcon,
  Share01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { roomId } from "@/lib/room-info";
import { formatDuration } from "@/lib/format";
import { canShareScreen } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MediaButton } from "@/components/media-button";
import { VideoGrid } from "@/views/room/video-grid";
import { ChatPanel } from "@/views/room/chat-panel";
import { ShareDialog } from "@/views/share-dialog";
import { useRoom } from "@/hooks/use-room";

export function RoomView({ onLeave, onSend }: { onLeave: () => void; onSend: (text: string) => void }) {
  const { t } = useTranslation();
  const { mic, cam, scr, messages, toggleMic, toggleCam, toggleScr } = useRoom();
  const [chatOpen, setChatOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((d) => d + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setChatOpen(true);
    }
  }, [messages]);

  return (
    <div className="flex h-full w-full flex-col bg-background min-w-64">
      <header className="flex items-center gap-4 m-4 mb-0">
        <div className="hidden sm:flex gap-2">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
          <Separator orientation="vertical" />
        </div>
        <div className="min-w-0 flex flex-col">
          <div className="text-sm truncate">{t("common.appName")}</div>
          <div className="text-xs font-bold font-mono truncate">
            #{roomId} · {formatDuration(elapsed)}
          </div>
        </div>
        <div className="grow" />
        <div className="flex gap-2">
          <MediaButton kind="audio" enabled={mic} onToggle={toggleMic} />
          <MediaButton kind="video" enabled={cam} onToggle={toggleCam} />
          {/* Desktop: show buttons inline */}
          <div className="hidden gap-2 sm:flex">
            {canShareScreen() && (
              <Button
                size="lg"
                variant={scr ? "default" : "outline"}
                onClick={() => toggleScr()}
                aria-label={t("room.screenShare")}
              >
                <HugeiconsIcon icon={ComputerScreenShareIcon} />
              </Button>
            )}
            <Button
              size="lg"
              variant={chatOpen ? "default" : "outline"}
              onClick={() => setChatOpen(!chatOpen)}
              aria-label={t("room.chat")}
            >
              <HugeiconsIcon icon={ChatIcon} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShareOpen(true)}
              aria-label={t("room.shareRoom")}
            >
              <HugeiconsIcon icon={Share01Icon} />
            </Button>
          </div>

          {/* Desktop: separator + leave */}
          <div className="hidden sm:inline-flex items-center gap-2">
            <Separator orientation="vertical" />
            <Button
              variant="destructive"
              size="icon-lg"
              onClick={onLeave}
              aria-label={t("room.leave")}
            >
              <HugeiconsIcon icon={LogoutCircle01Icon} />
            </Button>
          </div>

          {/* Mobile: collapse into dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="sm:hidden"
                aria-label={t("room.label")}
              >
                <HugeiconsIcon icon={MoreVerticalIcon} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {canShareScreen() && (
                  <DropdownMenuItem onClick={() => toggleScr()}>
                    <HugeiconsIcon icon={ComputerScreenShareIcon} />
                    {t("room.screenShare")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setChatOpen(!chatOpen)}>
                  <HugeiconsIcon icon={ChatIcon} />
                  {t("room.chat")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareOpen(true)}>
                  <HugeiconsIcon icon={Share01Icon} />
                  {t("room.shareRoom")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onLeave}>
                <HugeiconsIcon icon={LogoutCircle01Icon} />
                {t("room.leave")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex flex-1 gap-4 overflow-hidden p-4">
        <VideoGrid asideOpen={chatOpen} />
        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} onSend={onSend} />}
      </main>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
