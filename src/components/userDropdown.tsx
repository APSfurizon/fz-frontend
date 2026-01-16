"use client"
import { useLocale, useTranslations } from 'next-intl';
import { Link, routing, useRouter } from '@/i18n/routing';
import { ToggleEvent, useId, useState } from 'react';
import Icon from '@/components/icon';
import UserPicture from '@/components/userPicture';
import { runRequest } from '@/lib/api/global';
import { LogoutApiAction } from '@/lib/api/authentication/login';
import { changeLanguage, UserData } from '@/lib/api/user';
import LoadingPanel from './loadingPanel';
import "@/styles/components/userDropDown.css";
import { mapLanguageToFlag } from '@/lib/utils';

export default function UserDropDown({ userData, loading }: Readonly<{ userData?: UserData, loading: boolean }>) {
    const t = useTranslations('common');
    const router = useRouter();
    const locale = useLocale();
    const [isOpen, setOpen] = useState(false);
    const id = useId();

    const logout = () => {
        runRequest(new LogoutApiAction())
            .catch((err) => console.warn("Could not log out: " + err))
            .finally(() => router.replace("/logout"));
    }

    const onToggle = (e: ToggleEvent<HTMLDivElement>) => {
        setOpen (e.newState === "open");
    }

    return (
        <div className="user-dropdown rounded-m">
            <button tabIndex={0}
                className="dropdown-button horizontal-list flex-vertical-center gap-2mm rounded-m"
                popoverTarget={id}>
                {loading && <LoadingPanel />}
                {!userData && !loading && <div className="horizontal-list flex-vertical-center gap-2mm">
                    <Icon icon="KEY"/>
                    <Link className="title small" href="/login">{t('header.login')}</Link>
                </div>}
                {userData && <>
                    <UserPicture userData={userData}></UserPicture>
                    <span className="title average semibold nickname">{userData.fursonaName}</span>
                </>}
                <Icon style={{ fontSize: "24px" }} icon={(isOpen) ? "ARROW_DROP_UP" : "ARROW_DROP_DOWN"}/>
            </button>
            <div id={id}
                className={`vertical-list dropdown-container rounded-m ${isOpen ? "open" : ""}`}
                popover="auto"
                onToggle={onToggle}>
                {/* Logout */}
                {userData && <a href="#"
                    onClick={() => logout()}
                    className="title small rounded-s vertical-align-middle">
                    {t('header.dropdown.logout')}
                </a>}
                {/* Language selector */}
                <hr />
                {routing.locales.filter (lng => lng !== locale).map((lng, index) => <Link href="#"
                    className="title small rounded-s vertical-align-middle horizontal-list"
                    key={index}
                    onClick={() => changeLanguage(lng, userData)}>
                    {mapLanguageToFlag(lng)}&nbsp;
                    {t(`header.dropdown.language.${lng}`)}
                    {lng === locale && <Icon className='medium' icon="CHECK"/>}
                </Link>)}
            </div>
        </div>
    )
}