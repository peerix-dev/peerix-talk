import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { MediaButton } from "@/components/media-button";
import { getRoomId } from "@/lib/room-id";

export function JoinView({ onJoin }: { onJoin: () => void }) {
  const { t } = useTranslation();
  const { roomId } = getRoomId();
  const [mic, setMic] = useState(false);
  const [cam, setCam] = useState(false);
  const [userName, setUserName] = useState("");

  return (
    <div className="flex flex-col h-max w-96 max-w-96 max-h-full bg-background shadow rounded">
      <header className="flex items-center gap-4 p-4">
        <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
        <Separator orientation="vertical" />
        <div className="flex min-w-0 flex-col">
          <div className="truncate text-sm">{t("common.appName")}</div>
          <div className="truncate font-mono text-xs font-bold ">#{roomId}</div>
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
        </div>
      </header>
      <main className="p-4 flex flex-col gap-6 h-fit overflow-auto">
        <Field>
          <FieldLabel className="text-sm" htmlFor="username">
            {t("join.yourName")}
          </FieldLabel>
          <Input
            className="py-4 text-base md:text-base"
            id="username"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={t("common.defaultUserName")}
          />
        </Field>
        <Button
          onClick={onJoin}
          className="py-6 text-base md:text-base cursor-pointer"
        >
          {t("join.joinRoom")}
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </main>
    </div>
  );
}
