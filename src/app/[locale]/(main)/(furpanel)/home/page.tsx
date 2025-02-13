"use client"
import Icon, { ICONS } from "@/components/icon";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations('furpanel');
  return (
    <div className="page">
      <div className="large title horizontal-list flex-vertical-center flex-center">
        <Icon className="x-large" style={{marginRight: '.1em'}} iconName={ICONS.CONTEXTUAL_TOKEN}></Icon>
        <span>{t.rich('home.header', {
          highlighted: (chunks) => <b className="highlight">{chunks}</b>
        })}</span>
      </div>
      <span className="spacer"></span>
    </div>
  );
}
