import { useTranslation } from "react-i18next";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";

export function ChatMessage(options: {
  author: string;
  text: string;
  time: number;
}) {
  const { author, text, time } = options;
  const { i18n } = useTranslation();

  return (
    <Item variant="muted" className="p-2">
      <ItemHeader className="justify-between">
        <ItemTitle className="text-xs font-medium">{author}</ItemTitle>
        <div className="text-xs text-muted-foreground">
          {new Date(time).toLocaleTimeString(i18n.language, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </ItemHeader>
      <ItemContent>
        <ItemDescription className="text-sm text-muted-foreground">
          {text}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
