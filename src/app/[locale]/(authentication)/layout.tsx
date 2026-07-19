"use client";

import { useModalUpdate } from "@/components/context/modalProvider";
import Modal from "@/components/modal";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isOpen, icon, title, modalChildren, hideModal } = useModalUpdate();
  return (
    <>
      <div className="main-dialog rounded-s">{children}</div>
      <Modal icon={icon} title={title} open={isOpen} onClose={hideModal} zIndex={600}>
        {modalChildren}
      </Modal>
    </>
  );
}
