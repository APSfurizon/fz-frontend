"use client";

import { runRequest } from "@/lib/api/networking";
import { BookingOrderApiAction, BookingOrderResponse, OrderEditLinkApiAction, OrderRetryLinkApiAction } from "@/lib/api/reservation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { WidgetBaseProps } from "../types";

type ReservationWidgetProps = WidgetBaseProps<BookingOrderResponse>;

export default function ReservationWidget({ initialData }: Readonly<ReservationWidgetProps>) {
  const query = useQuery({
    queryKey: ["reservation-widget"],
    queryFn: ({ signal }) => runRequest({ action: new BookingOrderApiAction(), signal }),
    initialData: initialData,
  });

  // Mutations

  /** The mutation triggered when the user requests to retry payment */
  const getRetryPaymentLinkMutation = useMutation({
    mutationFn: () => runRequest({ action: new OrderRetryLinkApiAction() }),
    onSuccess: (data) => {
      window.open(data.link, "_blank")?.focus();
    },
    onError: (/*data*/) => {
      // No-op
    },
  });

  /** The mutation triggered when the user requests to edit their order */
  const getEditLinkMutation = useMutation({
    mutationFn: () => runRequest({ action: new OrderEditLinkApiAction() }),
    onSuccess: (data) => {
      window.open(data.link, "_blank")?.focus();
    },
    onError: (/*data*/) => {
      // No-op
    },
  });

  const postTransferRequest = useMutation({
    mutationFn: (data: )
  });
}
