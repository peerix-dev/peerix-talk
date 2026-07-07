import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, CopyCheckIcon } from "@hugeicons/core-free-icons";
import { inviteLink } from "@/lib/room-info";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ShareDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [qrSrc, setQrSrc] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !inviteLink) return;
    QRCode.toDataURL(inviteLink, { width: 256, margin: 1 })
      .then(setQrSrc)
      .catch(console.error);
  }, [open, inviteLink]);

  const copy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, console.error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>{t("share.title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("share.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {qrSrc ? (
            <img
              src={qrSrc}
              alt={t("share.qrAlt")}
              className="rounded-lg border bg-white p-2"
            />
          ) : (
            <div className="flex h-64 w-64 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
              {t("share.generating")}
            </div>
          )}

          <Field>
            <ButtonGroup>
              <Input
                id="invite-link"
                value={inviteLink}
                readOnly
                tabIndex={-1}
                aria-label={t("share.inviteLink")}
              />
              <Button
                className="min-w-12"
                onClick={copy}
                size="icon"
                variant="outline"
                aria-label={copied ? t("share.copied") : t("share.copy")}
              >
                <HugeiconsIcon icon={copied ? CopyCheckIcon : Copy01Icon} />
              </Button>
            </ButtonGroup>
          </Field>
        </div>
      </DialogContent>
    </Dialog>
  );
}
