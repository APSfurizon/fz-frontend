"use client";
import { Button } from "@/components/common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialogs";
import Icon from "@/components/icon";
import { qrCodeLogo, qrCodeOptions } from "@/lib/api/reservation";
import { useTranslations } from "next-intl";
import { useQRCode } from "next-qrcode";

export default function QrCodeModal({ secret }: Readonly<{ secret: string }>) {
  // order QR logic
  const { Canvas } = useQRCode();
  const t = useTranslations();

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button title={t("furpanel.booking.actions.show_qr")}>
            <Icon icon="QR_CODE" />
            {t("furpanel.booking.actions.show_qr")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("furpanel.booking.reservation_qr")}</DialogTitle>

          <DialogDescription>{t("furpanel.booking.messages.reservation_qr")}</DialogDescription>
        </DialogHeader>
        <div className="horizontal-list" style={{ justifyContent: "center" }}>
          <div className="rounded-l" style={{ overflow: "hidden" }}>
            <Canvas text={secret} options={qrCodeOptions} logo={qrCodeLogo} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
