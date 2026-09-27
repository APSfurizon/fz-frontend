import { Badge, Button } from "@/components/common";
import Icon from "@/components/icon";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { runRequest } from "@/lib/api/networking/main";
import {
  Board,
  BookingOrderApiAction,
  BookingOrderUiData,
  BookingTicketData,
  calcTicketData,
} from "@/lib/api/reservation";
import { EVENT_MAIN_LOCATION_NAME, GROUP_CHAT_URL } from "@/lib/constants";
import { translate } from "@/lib/translations";
import { isMobile } from "@/lib/userAgent";
import "@/styles/furpanel/booking.css";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import OrderItem from "./_components/orderItem";
import Countdown from "./countdown";

export default async function BookingPage() {
  const t = await getTranslations();
  const formatter = await getFormatter();
  //const router = useRouter();
  const locale = await getLocale();
  const cookieStore = await cookies();
  // TODO: const { userDisplay } = useUser();

  // Main data
  const bookingData = await runRequest({ action: new BookingOrderApiAction(), cookieStore });
  /**If user has a valid and paid order */
  const hasOrder =
    !!bookingData && bookingData?.order && ["PENDING", "PAID", "CANCELED"].includes(bookingData?.order?.orderStatus);
  const ticketData: BookingTicketData = hasOrder
    ? calcTicketData(bookingData.order)
    : {
        isDaily: false,
        ticketName: "",
        dailyDays: undefined,
      };

  const pageData: BookingOrderUiData = {
    ...ticketData,
    hasOrder: hasOrder,
    bookingStartDate: new Date(bookingData?.bookingStartTime ?? 0),
    editBookEndDate: new Date(bookingData?.editBookEndTime ?? 0),
    showCountdown: bookingData?.shouldDisplayCountdown ?? true,
    shouldUpdateInfo: bookingData?.shouldUpdateInfo,
    shouldRetry: ["PENDING", "CANCELED"].includes(bookingData.order?.orderStatus),
  };

  const promptExchange = () => {
    if (!bookingData) return;
  };

  /* TODO: const exchangeSuccess = () => {
    setExchangeModalOpen(false);
    showModal(
      t("furpanel.booking.messages.transfer_invite_sent.title"),
      <span className="descriptive average">{t("furpanel.booking.messages.transfer_invite_sent.description")}</span>,
      "CHECK_CIRCLE"
    );
  };*/

  // TODO: useTitle(t("furpanel.booking.title"));

  /**UI variables */
  /**If editing's locked */
  let isEditLocked = undefined;

  const requestOrderEditLink = () => {
    /*runRequest({ action: new OrderEditLinkApiAction() })
      .then((result) => router.push(result.link))
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setActionLoading(false));*/
  };

  const requestRetryPaymentLink = () => {
    /*runRequest({ action: new OrderRetryLinkApiAction() })
      .then((result) => router.push(result.link))
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setActionLoading(false));*/
  };

  const confirmMembershipData = () => {
    /*runRequest({ action: new ConfirmMembershipDataApiAction() })
      .then(() => setBookingData(undefined))
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setActionLoading(false));*/
  };

  /**Date calculations */
  if (!!pageData) {
    isEditLocked = Math.max(pageData.editBookEndDate.getTime() - new Date().getTime(), 0) <= 0;
  }

  const formattedDailyDays = pageData?.dailyDays?.map((dt) => formatter.dateTime(dt, { day: "2-digit" })).join(", ");

  const allDaysRange =
    pageData?.hasOrder && bookingData?.order?.noRoomTicketFromDate && bookingData?.order?.noRoomTicketToDate
      ? formatter.dateTimeRange(
          new Date(bookingData.order.noRoomTicketFromDate),
          new Date(bookingData.order.noRoomTicketToDate),
          { dateStyle: "medium" }
        )
      : undefined;

  const desktopGeoLink = `https://www.google.com/maps/search/?api=1&query=${bookingData?.geoLatitude},${bookingData?.geoLongitude}`;
  const mobileGeoLink = `geo:${bookingData?.geoLatitude},${bookingData?.geoLongitude}?q=${encodeURI(EVENT_MAIN_LOCATION_NAME)}`;
  const geoLink = bookingData ? (isMobile() ? mobileGeoLink : desktopGeoLink) : "";
  const showGeoData = bookingData?.geoLatitude && bookingData?.geoLongitude;

  return (
    <>
      <div className="page">
        <Countdown data={pageData}></Countdown>
        {pageData?.shouldUpdateInfo && (
          <>
            <NoticeBox
              title={t("furpanel.booking.messages.review_info.title")}
              theme={NoticeTheme.Error}
              className="vertical-list gap-2mm"
            >
              {t("furpanel.booking.messages.review_info.description")}
              <span className="horizontal-list gap-2mm" style={{ marginTop: ".5em" }}>
                <div className="spacer"></div>
                <Button className="success" /*onClick={confirmMembershipData}*/>
                  <Icon icon="CHECK" />
                  {t("furpanel.booking.actions.confirm_info")}
                </Button>
                <Button className="danger" /*onClick={/*() => router.push("/user") undefined}*/>
                  <Icon icon="OPEN_IN_NEW" />
                  {t("furpanel.booking.actions.review_info")}
                </Button>
              </span>
            </NoticeBox>
          </>
        )}
        {pageData.hasOrder && (
          <>
            {/* Order view */}
            <div className="horizontal-list align-items-center gap-2mm flex-wrap">
              <span className="title medium">{t("furpanel.booking.your_booking")}</span>
              <div className="horizontal-list align-items-center gap-2mm flex-wrap">
                <span className="title medium">
                  ({t("furpanel.booking.items.code")}&nbsp;
                  <b className="highlight">{bookingData?.order?.code}</b>)
                </span>
                <Badge
                  variant={
                    "default"
                  } /*status={mapOrderStatusToStatusBox(bookingData?.order.orderStatus ?? "CANCELED")}*/
                >
                  <span>{t(`common.order_status.${bookingData?.order.orderStatus}`)}</span>
                </Badge>
              </div>
            </div>

            {/* Reservation info */}
            <div className="booking-information gap-4mm flex-wrap">
              {bookingData?.order.checkinDate && (
                <p>
                  <Icon className="x-large" icon="CONCIERGE" />
                  <span>
                    {t.rich("furpanel.booking.information.check_in_date", {
                      b: (chunks) => <b>{chunks}</b>,
                      checkinDate: formatter.dateTime(new Date(bookingData.order.checkinDate), {
                        dateStyle: "medium",
                      }),
                    })}
                  </span>
                </p>
              )}
              {bookingData?.order.checkoutDate && (
                <p>
                  <Icon className="x-large" icon="TRIP" />
                  <span>
                    {t.rich("furpanel.booking.information.check_out_date", {
                      b: (chunks) => <b>{chunks}</b>,
                      checkoutDate: formatter.dateTime(new Date(bookingData.order.checkoutDate), {
                        dateStyle: "medium",
                      }),
                    })}
                  </span>
                </p>
              )}
              {showGeoData && (
                <p>
                  <Icon className="x-large" icon="LOCATION_ON" />
                  <span>
                    {t.rich("furpanel.booking.information.location", {
                      b: (chunks) => <b>{chunks}</b>,
                      a: (chunks) => (
                        <a className="highlight hoverable" target={isMobile() ? "_self" : "_blank"} href={geoLink}>
                          {chunks}
                          <Icon className="medium" icon="OPEN_IN_NEW" />
                        </a>
                      ),
                      link: EVENT_MAIN_LOCATION_NAME,
                    })}
                  </span>
                </p>
              )}
            </div>

            {/* Order Items */}
            <div className="order-data">
              <div className="order-items-container horizontal-list flex-same-base gap-4mm flex-wrap">
                {/* Ticket item */}
                <OrderItem
                  icon="LOCAL_ACTIVITY"
                  title={t.rich(`furpanel.booking.items.${pageData.ticketName}`, {
                    sponsor: (chunks) => <b className="sponsor-highlight">{chunks}</b>,
                    supersponsor: (chunks) => <b className="super-sponsor-highlight">{chunks}</b>,
                    ultrasponsor: (chunks) => <b className="ultra-sponsor-highlight">{chunks}</b>,
                  })}
                  description={
                    pageData.isDaily
                      ? t("furpanel.booking.items.daily_days", { days: formattedDailyDays ?? "" })
                      : allDaysRange
                  }
                />
                {/* Membership item */}
                {bookingData.hasActiveMembershipForEvent && (
                  <OrderItem icon="ID_CARD" title={t("furpanel.booking.items.membership_card")} />
                )}
                {/* Extra days */}
                {bookingData.order.extraDays !== "NONE" && (
                  <OrderItem
                    icon="CALENDAR_ADD_ON"
                    title={t("furpanel.booking.items.extra_days")}
                    description={t(`furpanel.booking.items.extra_days_${bookingData.order.extraDays}`)}
                  />
                )}
                {/* Room */}
                {bookingData.order.room && (
                  <OrderItem
                    icon="BED"
                    title={[
                      t("furpanel.booking.items.room"),
                      translate(bookingData.order.room.roomTypeNames, locale) ?? "",
                    ].join(" ")}
                    description={t("furpanel.booking.items.room_capacity", {
                      capacity: bookingData.order.room.roomCapacity,
                    })}
                  />
                )}
                {/* Board */}
                {bookingData.order.board && bookingData.order.board != Board.NONE && (
                  <OrderItem icon="DINING" title={t(`furpanel.booking.items.board_${bookingData.order.board}`)} />
                )}
              </div>

              {/* Order actions */}
              <div className="horizontal-list gap-4mm flex-space-between flex-wrap">
                {pageData?.shouldRetry && (
                  <Button className="action-button" /*onClick={requestRetryPaymentLink}*/>
                    <Icon icon="REPLAY" />
                    {t("furpanel.booking.retry_payment")}
                  </Button>
                )}
                {/* TODO: bookingData?.order?.checkinSecret && <QrCodeModal secret={bookingData?.order?.checkinSecret} />*/}
                <div className="spacer" style={{ flexGrow: "300" }}></div>
                <div className="horizontal-list gap-4mm flex-space-between flex-wrap" style={{ flexGrow: "1" }}>
                  <Button className="action-button" disabled={isEditLocked} /*onClick={requestOrderEditLink}*/>
                    <Icon icon="OPEN_IN_NEW" />
                    {t("furpanel.booking.edit_booking")}
                  </Button>
                  {bookingData?.exchangeSupported && (
                    <Button
                      className="action-button danger"
                      disabled={isEditLocked} /*onClick={() => promptExchange()}*/
                    >
                      <Icon icon="SEND" />
                      {t("furpanel.booking.actions.transfer_order")}
                    </Button>
                  )}
                </div>
              </div>

              <div className="vertical-list gap-2mm">
                <NoticeBox
                  theme={isEditLocked ? NoticeTheme.Warning : NoticeTheme.FAQ}
                  title={
                    isEditLocked
                      ? t("furpanel.booking.messages.editing_locked.title")
                      : t("furpanel.booking.messages.editing_locked_warning.title")
                  }
                >
                  {t(
                    isEditLocked
                      ? "furpanel.booking.messages.editing_locked.description"
                      : "furpanel.booking.messages.editing_locked_warning.description",
                    { lockDate: formatter.dateTime(pageData.editBookEndDate) }
                  )}
                </NoticeBox>

                {GROUP_CHAT_URL && (
                  <NoticeBox
                    theme={NoticeTheme.FAQ}
                    icon="GROUPS"
                    title={t("furpanel.booking.messages.invite_group.title")}
                  >
                    {t.rich("furpanel.booking.messages.invite_group.description", {
                      link: () => (
                        <a className="highlight" target="_blank" href={new URL(GROUP_CHAT_URL!).toString()}>
                          {GROUP_CHAT_URL}
                        </a>
                      ),
                    })}
                  </NoticeBox>
                )}
              </div>

              {/* Errors view */}
              {bookingData?.errors && (
                <>
                  <div className="errors-container vertical-list gap-4mm">
                    {bookingData.errors.map((errorCode, index) => {
                      return (
                        <NoticeBox
                          key={index}
                          theme={NoticeTheme.Warning}
                          title={t(`furpanel.booking.errors.${errorCode}.title`)}
                        >
                          {t(`furpanel.booking.errors.${errorCode}.description`)}
                        </NoticeBox>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
      {/* TODO: Order exchange modal 
      <Modal
        icon="SEND"
        open={exchangeModalOpen}
        title={t("furpanel.booking.actions.transfer_order")}
        onClose={() => setExchangeModalOpen(false)}
        busy={modalLoading}
      >
        <span className="descriptive small">{t("furpanel.booking.messages.transfer_explanation")}</span>
        <DataForm
          action={new OrderExchangeFormAction()}
          busy={modalLoading}
          setBusy={setModalLoading}
          onSuccess={exchangeSuccess}
          onFail={exchangeFail}
          hideSave
          className="vertical-list gap-2mm"
          shouldReset={!exchangeModalOpen}
        >
          <input type="hidden" name="userId" value={userDisplay?.display?.userId ?? ""}></input>
          <AutoInput
            fieldName="recipientId"
            required
            manager={new AutoInputOrderExchangeManager()}
            multiple={false}
            disabled={modalLoading}
            label={t("furpanel.booking.input.transfer_user.label")}
            placeholder={t("furpanel.booking.input.transfer_user.placeholder")}
            style={{ maxWidth: "500px" }}
          />
          <div className="horizontal-list gap-4mm">
            <FpButton
              type="button"
              className="danger"
              icon="CANCEL"
              busy={modalLoading}
              onClick={() => setExchangeModalOpen(false)}
            >
              {t("common.cancel")}
            </FpButton>
            <div className="spacer"></div>
            <FpButton type="submit" className="success" icon="CHECK" busy={modalLoading}>
              {t("common.confirm")}
            </FpButton>
          </div>
        </DataForm>
      </Modal>*/}
    </>
  );
}
