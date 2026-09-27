"use client";
import { useModalUpdate } from "@/components/context/modalProvider";
import Modal from "@/components/modal";
import { APP_GIT_PROJECT_RELEASE, APP_VERSION, READ_CHANGELOG_STORAGE_NAME } from "@/lib/constants";
import { shouldShowChangelog } from "@/lib/utils";
import "@/styles/furpanel/layout.css";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const t = useTranslations();
  const { isOpen, icon, title, modalChildren, hideModal, showModal } = useModalUpdate();

  useEffect(() => {
    if (shouldShowChangelog()) {
      localStorage.setItem(READ_CHANGELOG_STORAGE_NAME, APP_VERSION ?? "");
      showModal(
        t("common.changelog.title"),
        <span>
          {t.rich("common.changelog.description", {
            a: () => (
              <a target="_blank" href={APP_GIT_PROJECT_RELEASE.toString()}>
                {APP_GIT_PROJECT_RELEASE.toString()}
              </a>
            ),
          })}
        </span>,
        "FEATURED_SEASONAL_AND_GIFTS"
      );
    }
  }, []);

  return (
    <>
      <div className="main-dialog rounded-s">{children}</div>
      <Modal icon={icon} title={title} open={isOpen} onClose={hideModal} zIndex={600}>
        {modalChildren}
      </Modal>
    </>
  );
}
