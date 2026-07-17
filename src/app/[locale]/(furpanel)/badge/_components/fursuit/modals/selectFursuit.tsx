import FpButton from "@/components/input/fpButton";
import Modal from "@/components/modal";
import { FursuitEventData } from "@/lib/api/badge/types";
import { useTranslations } from "next-intl";
import { MouseEvent, useEffect, useState } from "react";
import { useBadge } from "../../badgeProvider";
import FursuitCard from "../fursuitCard";

type SelectFursuitProps = {
  open: boolean;
  loading: boolean;
  onConfirm(fursuitIds: Set<number>): void;
  onClose(): void;
};

export default function SelectFursuitModal(props: Readonly<SelectFursuitProps>) {
  const t = useTranslations();
  const { badgeData } = useBadge();

  // Logic
  const [selectedFursuits, setSelectedFursuits] = useState<Set<number>>(new Set<number>());

  const onSelectClick = (e: MouseEvent<HTMLDivElement>, fursuitData: FursuitEventData) => {
    setSelectedFursuits((prev) => {
      const newSet = new Set<number>(prev);
      const id = fursuitData.fursuit.id;
      if (newSet.has(id)) {
        newSet.delete(id);
      } else if (newSet.size < (badgeData?.maxFursuits ?? 0)) {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Reset on close
  useEffect(() => {
    if (!props.open) {
      setSelectedFursuits(new Set<number>());
    } else if (badgeData) {
      setSelectedFursuits(
        new Set<number>((badgeData.fursuits || []).filter((f) => f.bringingToEvent).map((f) => f.fursuit.id))
      );
    }
  }, [props.open, badgeData]);

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title={t("common.CRUD.select")}
      icon="SELECT_CHECK_BOX"
      busy={props.loading}
    >
      <div className="horizontal-list flex-wrap gap-4mm">
        {badgeData?.fursuits.map((fursuitData: FursuitEventData, index: number) => (
          <FursuitCard
            key={index}
            fursuitEventData={fursuitData}
            selected={selectedFursuits.has(fursuitData.fursuit.id)}
            onClick={onSelectClick}
          />
        ))}
      </div>
      <div className="horizontal-list gap-4mm">
        <div className="spacer"></div>
        <FpButton danger icon="CANCEL" onClick={props.onClose} busy={props.loading}>
          {t("common.cancel")}
        </FpButton>
        <FpButton
          success
          icon="CHECK"
          onClick={() => props.onConfirm(selectedFursuits)}
          disabled={!selectedFursuits?.size}
          busy={props.loading}
        >
          {t("common.confirm")} ({selectedFursuits.size}/{badgeData?.maxFursuits ?? 0})
        </FpButton>
      </div>
    </Modal>
  );
}
