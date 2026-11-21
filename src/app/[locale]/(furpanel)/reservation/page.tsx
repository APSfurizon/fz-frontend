import { GetBadgeStatusAction } from "@/lib/api/badge/badge";
import { runRequest } from "@/lib/api/networking/main";
import { BookingOrderApiAction, calculateReservationData } from "@/lib/api/reservation";
import "@/styles/furpanel/booking.css";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { ReservationWidget } from "./widgets";
import Countdown from "./widgets/countdown/countdown";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("furpanel.booking.title") + " - Furpanel",
  };
}

export default async function ReservationPage() {
  const cookieStore = await cookies();
  const queryClient = new QueryClient();

  // Reservation data
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const reservationData = await queryClient.query({
    queryKey: ["reservation-widget"],
    queryFn: ({ signal }) =>
      runRequest({ action: new BookingOrderApiAction(), cookieStore, signal }).then((result) =>
        calculateReservationData(result)
      ),
    staleTime: 10_000,
  });
  // Badge data
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  await queryClient.query({
    queryKey: ["badge-widget"],
    queryFn: ({ signal }) => runRequest({ action: new GetBadgeStatusAction(), cookieStore, signal }),
    staleTime: 10_000,
  });

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="widget-container mx-auto w-full max-w-7xl p-1 xl:p-0">
          {reservationData.hasOrder ? <ReservationWidget /> : <Countdown data={reservationData} />}
        </div>
      </HydrationBoundary>
    </>
  );
}
