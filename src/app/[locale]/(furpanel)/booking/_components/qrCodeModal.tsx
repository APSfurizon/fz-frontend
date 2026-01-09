import Button from "@/components/input/button";
import Modal from "@/components/modal";
import { qrCodeOptions } from "@/lib/api/booking";
import { useTranslations } from "next-intl";
import { useQRCode } from "next-qrcode";
import { useState } from "react";

export default function QrCodeModal({secret} : Readonly<{secret: string}>) {
    // order QR logic
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const { Canvas } = useQRCode();
    const t = useTranslations();

    return <>
        <Button iconName={"QR_CODE"}
            onClick={() => setQrModalOpen(true)}
            title={t("furpanel.booking.actions.show_qr")}>
            {t("furpanel.booking.actions.show_qr")}
        </Button>
        <Modal open={qrModalOpen}
            icon={"QR_CODE"}
            title={t("furpanel.booking.reservation_qr")}
            onClose={() => setQrModalOpen(false)}>
            <div className="horizontal-list" style={{ justifyContent: "center" }}>
                <div className="rounded-l" style={{ overflow: "hidden" }}>
                    <Canvas text={secret}
                        options={qrCodeOptions}
                        logo={{
                            src: '/images/favicon.png',
                            options: {
                                width: 30
                            }
                        }}
                    />
                </div>
            </div>
            <span className="descriptive small">{t("furpanel.booking.messages.reservation_qr")}</span>
        </Modal>
    </>
}