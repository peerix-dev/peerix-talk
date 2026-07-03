import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Comment02Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ButtonGroup } from "@/components/ui/button-group";
import { ChatMessage } from "@/views/room/chat-message";

type ChatPanelProps = { className?: string; onClose?: () => void };

export function ChatPanel({ className = "", onClose }: ChatPanelProps) {
  const { t } = useTranslation();
  const [isOpening, setIsOpening] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<
    { author: string; text: string; time: number }[]
  >([]);
  const lastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsOpening(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    lastRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { author: t("chat.author"), text: trimmed, time: Date.now() },
    ]);
    setText("");
  };

  return (
    <Card
      className={cn(
        "z-10 flex h-full min-w-0 flex-col overflow-hidden shadow-sm transition-[width] duration-300",
        isOpening ? "w-full md:w-[max(20%,20rem)]" : "w-0",
        className,
      )}
    >
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{t("chat.title")}</CardTitle>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label={t("chat.close")}
        >
          <HugeiconsIcon icon={Cancel01Icon} />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0 overflow-hidden">
        {messages.length === 0 ? (
          <Empty className="flex h-full items-center justify-center">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Comment02Icon} />
              </EmptyMedia>
              <EmptyTitle>{t("chat.empty")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-4">
              {messages.map((msg, i) => (
                <div key={i} ref={i === messages.length - 1 ? lastRef : null}>
                  <ChatMessage
                    author={msg.author}
                    text={msg.text}
                    time={msg.time}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter>
        <ButtonGroup className="w-full">
          <Input
            className="flex-1 md:text-sm"
            placeholder={t("chat.placeholder")}
            value={text}
            maxLength={1000}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button
            className="cursor-pointer"
            onClick={send}
            variant="outline"
            aria-label={t("chat.send")}
          >
            <HugeiconsIcon icon={SentIcon} />
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
