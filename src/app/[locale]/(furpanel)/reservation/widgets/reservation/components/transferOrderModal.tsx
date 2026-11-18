"use client";
import { Alert, AlertDescription, AlertTitle, Button } from "@/components/common";
import { getUsernameFallback } from "@/components/common/header/userDropdown";
import { useUser } from "@/components/context/userProvider";
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
import ErrorMessage from "@/components/errorMessage";
import { useAppForm } from "@/components/form";
import { WebComboboxConfig } from "@/components/form/custom/webCombobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FieldGroup } from "@/components/ui/field";
import { ApiErrorResponse, runRequest } from "@/lib/api/networking";
import { InitOrderExchangeApiAction, OrderExchangeInitApiData } from "@/lib/api/reservation";
import { GetUserByIdAction, UserSearchAction, UserSearchResult } from "@/lib/api/user";
import { buildSearchParams } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { AlertCircleIcon, CheckCircle2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import z from "zod";

class ExchangeRecipientWebCombobox extends WebComboboxConfig<UserSearchResult, string> {
  public itemToValue(option: UserSearchResult): string {
    return "" + option.id;
  }
  public searchFn(): (query: string, signal: AbortSignal, locale: string) => Promise<UserSearchResult[]> {
    return (query: string, signal: AbortSignal) =>
      runRequest({
        action: new UserSearchAction(),
        searchParams: buildSearchParams({ name: query, "filter-not-made-an-order": "true" }),
        signal: signal,
      }).then((results) => results.users);
  }
  public inquiringFn(): (values: string, signal: AbortSignal) => Promise<UserSearchResult[]> {
    return (values: string) =>
      runRequest({
        action: new GetUserByIdAction(),
        searchParams: buildSearchParams({ id: values }),
      }).then((result) => result.users);
  }
  public optionsRenderer(option: UserSearchResult): React.ReactNode {
    return (
      <p className="flex items-center gap-1">
        <Avatar size="sm">
          <AvatarImage src={option.propic?.mediaUrl} />
          <AvatarFallback>{getUsernameFallback(option.description ?? "")}</AvatarFallback>
        </Avatar>
        {option?.description}
      </p>
    );
  }
  public selectionsRenderer(selection: UserSearchResult): React.ReactNode {
    return (
      <p className="flex items-center gap-1">
        <Avatar size="sm" className="scale-75">
          <AvatarImage src={selection.propic?.mediaUrl} />
          <AvatarFallback>{getUsernameFallback(selection.description ?? "")}</AvatarFallback>
        </Avatar>
        {selection?.description}
      </p>
    );
  }
  override itemToLabel(): (option: UserSearchResult, locale: string) => string {
    return (option: UserSearchResult) => option.description!;
  }
}

export default function TransferOrderModal() {
  const t = useTranslations();
  const { userDisplay } = useUser();
  const formRef = useRef<HTMLFormElement>(null);

  /** Whenever a user submits an order transfer request */
  const initTransferRequestMutation = useMutation({
    mutationFn: (data: OrderExchangeInitApiData) =>
      runRequest({
        action: new InitOrderExchangeApiAction(),
        body: data,
      }),
  });

  const initiateTransferForm = useAppForm({
    defaultValues: {
      sourceUserId: userDisplay?.display.userId,
      destUserId: "",
      action: "order",
    },
    validators: {
      onChange: z.object({
        sourceUserId: z.number().nonoptional({ error: "Source is empty" }),
        destUserId: z
          .string()
          .nonempty({ error: t("furpanel.booking.input.transfer_user.validation.empty") })
          .transform((v) => Number(v))
          .refine((n) => !Number.isNaN(n), { error: t("furpanel.booking.input.transfer_user.validation.numeric") }),
        action: z.enum(["room", "order"], { error: "The action must be either a room or an order" }),
      }),
    },
    onSubmit: ({ value }) => {
      const toSend: OrderExchangeInitApiData = {
        action: value.action as "room" | "order",
        destUserId: Number(value.destUserId),
        sourceUserId: value.sourceUserId!,
      };
      initTransferRequestMutation.mutate(toSend);
    },
  });

  const onClose = (open: boolean) => {
    if (!open) {
      initiateTransferForm.reset();
      initTransferRequestMutation.reset();
    }
  };

  return (
    <Dialog onOpenChangeComplete={onClose}>
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
        {initTransferRequestMutation.isSuccess && (
          <Alert className="text-green-700 dark:text-green-200">
            <CheckCircle2 />
            <AlertTitle>{t("furpanel.booking.messages.transfer_invite_sent.title")}</AlertTitle>
            <AlertDescription>{t("furpanel.booking.messages.transfer_invite_sent.description")}</AlertDescription>
          </Alert>
        )}
        {initTransferRequestMutation.isError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>
              <ErrorMessage error={initTransferRequestMutation.error as ApiErrorResponse} />
            </AlertDescription>
          </Alert>
        )}
        <form
          ref={formRef}
          id="init-transfer-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            initiateTransferForm.handleSubmit();
          }}
        >
          <FieldGroup>
            <initiateTransferForm.AppField
              name="destUserId"
              key="destUserId"
              children={(field) => (
                <field.WebComboboxField
                  multiple
                  max={1}
                  label={t("furpanel.booking.input.transfer_user.label")}
                  config={new ExchangeRecipientWebCombobox()}
                  placeholder={t("furpanel.booking.input.transfer_user.placeholder")}
                />
              )}
            ></initiateTransferForm.AppField>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <DialogClose render={<Button variant="outline">{t("common.cancel")}</Button>} />
            <Button form="init-transfer-form" type="submit">
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
