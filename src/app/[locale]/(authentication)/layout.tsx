import {useTranslations} from 'next-intl';
import Icon, { ICONS } from "@/app/_components/icon";
import ToolLink from "@/app/_components/toolLink";

export default function Layout({children}: Readonly<{children: React.ReactNode;}>) {
    const t = useTranslations('authentication');
    return (
        <div className="main-dialog rounded-s">
            <div className="horizontal-list gap-4mm flex-center">
                <span className="title-pair">
                    <Icon iconName="design_services"></Icon>
                    <span className="titular bold highlight">furpanel</span>
                    <span> - </span>
                    <span className="titular bold">{t('title')}</span>
                </span>
            </div>
            {children}
        </div>
    );
  }