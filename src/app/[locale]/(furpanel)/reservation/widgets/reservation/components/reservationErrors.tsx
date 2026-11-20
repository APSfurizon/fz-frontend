import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/common";
import { ReservationError } from "@/lib/api/reservation";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  Baby,
  BanknoteArrowDown,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  CopyX,
  CreditCardX,
  Files,
  PackageQuestionMark,
  PencilOff,
  ServerCrash,
  ShieldOff,
  StickyNoteX,
  TicketX,
  UserRoundExclamationPoint,
  UsersRoundCollaboration,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ReservationErrors({ errors }: Readonly<{ errors: ReservationError[] }>) {
  const t = useTranslations();
  const [isOpen, setOpen] = useState(false);

  const translateErrorTitle = (type: ReservationError) => {
    switch (type) {
      case "SERVER_ERROR":
        return t("furpanel.booking.errors.SERVER_ERROR.title");
      case "MEMBERSHIP_MULTIPLE_DONE":
        return t("furpanel.booking.errors.MEMBERSHIP_MULTIPLE_DONE.title");
      case "MEMBERSHIP_MISSING":
        return t("furpanel.booking.errors.MEMBERSHIP_MISSING.title");
      case "ORDER_NOT_FOUND":
        return t("furpanel.booking.errors.ORDER_NOT_FOUND.title");
      case "ORDER_MULTIPLE_DONE":
        return t("furpanel.booking.errors.ORDER_MULTIPLE_DONE.title");
      case "ORDER_SECRET_NOT_MATCH":
        return t("furpanel.booking.errors.ORDER_SECRET_NOT_MATCH.title");
      case "ORDER_ALREADY_OWNED_BY_SOMEBODY_ELSE":
        return t("furpanel.booking.errors.ORDER_ALREADY_OWNED_BY_SOMEBODY_ELSE.title");
      case "SHOP_NOT_OPENED_YET":
        return t("furpanel.booking.errors.SHOP_NOT_OPENED_YET.title");
      case "ORDER_EDITS_CLOSED":
        return t("furpanel.booking.errors.ORDER_EDITS_CLOSED.title");
      case "PERSONAL_USER_INFO_NOT_UPDATED":
        return t("furpanel.booking.errors.PERSONAL_USER_INFO_NOT_UPDATED.title");
      case "BELOW_MINIMUM_AGE":
        return t("furpanel.booking.errors.BELOW_MINIMUM_AGE.title");
      case "PAYMENT_INVALID_STATE":
        return t("furpanel.booking.errors.PAYMENT_INVALID_STATE.title");
      case "REFUND_INVALID_STATE":
        return t("furpanel.booking.errors.REFUND_INVALID_STATE.title");
      case "POSITION_CANCELED":
        return t("furpanel.booking.errors.POSITION_CANCELED.title");
      default:
        console.warn("Reservation error not handled", type);
        return type;
    }
  };

  const translateErrorTitleDescription = (type: ReservationError) => {
    switch (type) {
      case "SERVER_ERROR":
        return t("furpanel.booking.errors.SERVER_ERROR.description");
      case "MEMBERSHIP_MULTIPLE_DONE":
        return t("furpanel.booking.errors.MEMBERSHIP_MULTIPLE_DONE.description");
      case "MEMBERSHIP_MISSING":
        return t("furpanel.booking.errors.MEMBERSHIP_MISSING.description");
      case "ORDER_NOT_FOUND":
        return t("furpanel.booking.errors.ORDER_NOT_FOUND.description");
      case "ORDER_MULTIPLE_DONE":
        return t("furpanel.booking.errors.ORDER_MULTIPLE_DONE.description");
      case "ORDER_SECRET_NOT_MATCH":
        return t("furpanel.booking.errors.ORDER_SECRET_NOT_MATCH.description");
      case "ORDER_ALREADY_OWNED_BY_SOMEBODY_ELSE":
        return t("furpanel.booking.errors.ORDER_ALREADY_OWNED_BY_SOMEBODY_ELSE.description");
      case "SHOP_NOT_OPENED_YET":
        return t("furpanel.booking.errors.SHOP_NOT_OPENED_YET.description");
      case "ORDER_EDITS_CLOSED":
        return t("furpanel.booking.errors.ORDER_EDITS_CLOSED.description");
      case "PERSONAL_USER_INFO_NOT_UPDATED":
        return t("furpanel.booking.errors.PERSONAL_USER_INFO_NOT_UPDATED.description");
      case "BELOW_MINIMUM_AGE":
        return t("furpanel.booking.errors.BELOW_MINIMUM_AGE.description");
      case "PAYMENT_INVALID_STATE":
        return t("furpanel.booking.errors.PAYMENT_INVALID_STATE.description");
      case "REFUND_INVALID_STATE":
        return t("furpanel.booking.errors.REFUND_INVALID_STATE.description");
      case "POSITION_CANCELED":
        return t("furpanel.booking.errors.POSITION_CANCELED.description");
      default:
        console.warn("Reservation error not handled", type);
        return type;
    }
  };

  const getErrorIcon = (type: ReservationError) => {
    switch (type) {
      case "SERVER_ERROR":
        return <ServerCrash />;
      case "MEMBERSHIP_MULTIPLE_DONE":
        return <Files />;
      case "MEMBERSHIP_MISSING":
        return <StickyNoteX />;
      case "ORDER_NOT_FOUND":
        return <PackageQuestionMark />;
      case "ORDER_MULTIPLE_DONE":
        return <CopyX />;
      case "ORDER_SECRET_NOT_MATCH":
        return <ShieldOff />;
      case "ORDER_ALREADY_OWNED_BY_SOMEBODY_ELSE":
        return <UsersRoundCollaboration />;
      case "SHOP_NOT_OPENED_YET":
        return <CalendarClock />;
      case "ORDER_EDITS_CLOSED":
        return <PencilOff />;
      case "PERSONAL_USER_INFO_NOT_UPDATED":
        return <UserRoundExclamationPoint />;
      case "BELOW_MINIMUM_AGE":
        return <Baby />;
      case "PAYMENT_INVALID_STATE":
        return <CreditCardX />;
      case "REFUND_INVALID_STATE":
        return <BanknoteArrowDown />;
      case "POSITION_CANCELED":
        return <TicketX />;
      default:
        console.warn("Reservation error not handled", type);
        return <AlertCircleIcon />;
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-destructive font-heading text-l font-bold">
          {t("furpanel.booking.errors.title", { number: errors.length })}
        </h3>
        <div className="grow"></div>
        <CollapsibleTrigger
          render={
            <Button
              variant="destructive"
              size="icon"
              className={cn("reservation-error__button size-8", !isOpen ? "after:animate-ping" : "after:hidden")}
            >
              {isOpen ? <ChevronUp /> : <ChevronDown />}
              <span className="sr-only">Toggle details</span>
            </Button>
          }
        />
      </div>
      <CollapsibleContent className="mt-4">
        {errors.map((error, index) => (
          <Alert key={index} variant="destructive">
            {getErrorIcon(error)}
            <AlertTitle>{translateErrorTitle(error)}</AlertTitle>
            <AlertDescription>{translateErrorTitleDescription(error)}</AlertDescription>
          </Alert>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
