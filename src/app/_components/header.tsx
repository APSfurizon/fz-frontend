"use client"
import {useTranslations} from 'next-intl';
import Image from "next/image";
import Icon, { ICONS } from './icon';
import { useRouter } from 'next/navigation';
import Button from "../_components/button";
import "../styles/components/header.css";
import UserDropDown from './userDropdown';
import { useUser } from '../_lib/context/userProvider';

export default function Header () {
    const t = useTranslations('common');
    const {userData, userLoading} = useUser();
    const router = useRouter();

    return (
        <header className='header'>
            <div className="logo-container center">
                <Image className="header-logo" src="/images/logo-dark.png" alt={t('header.alt_logo')} width={175} height={40}></Image>
            </div>
            <div className="header-link-container horizontal-list flex-vertical-center">
                <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName={ICONS.HOME}></Icon>
                    <span className="title semibold">{t('header.home')}</span>
                </a>
                <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName={ICONS.GROUPS}></Icon>
                    <span className="title semibold">{t('header.nose_count')}</span>
                </a>
                <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName={ICONS.INFO}></Icon>
                    <span className="title semibold">{t('header.information')}</span>
                </a>
                <div className="spacer"></div>
                <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName={ICONS.BOOKMARK_STAR}></Icon>
                    <span className="title semibold">{t('header.archive')}</span>
                </a>
                {
                    userLoading 
                        ? <Button busy={userLoading}>{t('loading')}</Button>
                        : userData 
                            ? <UserDropDown userData={userData}></UserDropDown>
                            : <Button onClick={()=>router.push('/login')} iconName='key'>{t('header.login')}</Button>
                }
            </div>
        </header>
    )
}