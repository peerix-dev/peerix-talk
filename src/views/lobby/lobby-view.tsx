import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { roomId } from "@/lib/room-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { MediaButton } from "@/components/media-button";
import { useStorage } from "@/hooks/use-storage";

export function LobbyView({ onJoin }: { onJoin: () => void }) {
  const { t } = useTranslation();
  const { value: name, setValue: setName } = useStorage("username");
  const [mic, setMic] = useState(false);
  const [cam, setCam] = useState(false);

  return (
    <div className="flex h-max w-96 flex-col overflow-auto rounded bg-background shadow">
      <header className="flex items-center gap-4 p-4">
        <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
        <Separator orientation="vertical" />
        <div className="min-w-0 flex flex-col">
          <div className="text-sm truncate">{t("common.appName")}</div>
          <div className="text-xs font-bold font-mono truncate">#{roomId}</div>
        </div>
        <div className="grow" />
        <div className="flex gap-2">
          <MediaButton
            kind="audio"
            enabled={mic}
            onToggle={() => setMic(!mic)}
          />
          <MediaButton
            kind="video"
            enabled={cam}
            onToggle={() => setCam(!cam)}
          />
        </div>
      </header>

      <form
        className="flex flex-col gap-6 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          onJoin();
        }}
      >
        <Field>
          <FieldLabel htmlFor="username">{t("lobby.yourName")}</FieldLabel>
          <Input
            className="md:text-base px-2 py-4"
            id="username"
            name="username"
            value={name}
            autoComplete="on"
            onChange={(e) => setName(e.target.value)}
            placeholder={t("common.defaultUserName")}
          />
        </Field>
        <Button type="submit" className="cursor-pointer py-5 text-base">
          {t("lobby.joinRoom")}
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </form>
    </div>
  );
}
