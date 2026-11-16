"use client";
import { Button } from "@/components/common";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialogs";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TransferOrderModal() {
  const t = useTranslations();

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button title={t("furpanel.booking.actions.transfer_order")} variant="destructive">
            <Send />
            {t("furpanel.booking.actions.transfer_order")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("furpanel.booking.actions.transfer_order")}</DialogTitle>
          <DialogDescription>{t("furpanel.booking.messages.transfer_explanation")}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">{t("common.cancel")}</Button>} />
          <Button type="submit">{t("common.confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
