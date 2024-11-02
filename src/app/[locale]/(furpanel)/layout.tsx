import {useTranslations} from 'next-intl';
import Icon, { ICONS } from "@/app/_components/icon";
import ToolLink from "@/app/_components/toolLink";

export default function Layout({children}: Readonly<{children: React.ReactNode;}>) {
    const t = useTranslations('furpanel');
    return (
        <div className="form rounded-s">
            <div className="horizontal-list gap-4mm">
                <span className="title-pair">
                    <Icon iconName="design_services"></Icon>
                    <span className="titular bold highlight">furpanel</span>
                </span>
                <div className="tools-list horizontal-list gap-4mm">
                    <ToolLink href="/badge" iconName={ICONS.PERSON_BOOK}>{t('badge')}</ToolLink>
                    <ToolLink href="/room" iconName={ICONS.BED}>{t('room')}</ToolLink>
                    <ToolLink href="/upload-area" iconName={ICONS.PHOTO_CAMERA}>{t('upload_area')}</ToolLink>
                    <ToolLink href="/user" iconName={ICONS.PERSON}>{t('user')}</ToolLink>
                </div>
            </div>
            
            {children}
        </div>
    );
  }