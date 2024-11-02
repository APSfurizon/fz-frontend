"use client"
import {useTranslations} from 'next-intl';
import { EMPTY_HEADER_DATA, HeaderData } from '../_lib/components/header';
import Image from "next/image";
import Icon, { ICONS } from './icon';
import Button from "../_components/button";
import "../styles/components/header.css";
import { useEffect, useState } from 'react';
import UserDropDown from './userDropdown';
import { getTestHeaderUserData } from '../_lib/debug';

export default function Header () {
    const t = useTranslations('common');
    const [headerData, setHeaderData] = useState<HeaderData>(EMPTY_HEADER_DATA);
    const [isLoading, setLoading] = useState(true);

    useEffect(()=> {
        getTestHeaderUserData().then((data)=> {
            setHeaderData(data);
            setLoading(false);
        });
    }, []);

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
                    isLoading 
                        ? <Button busy={isLoading}>{t('loading')}</Button>
                        : headerData.loggedIn 
                            ? <UserDropDown headerData={headerData}></UserDropDown>
                            : <Button iconName='key'>{t('header.login')}</Button>
                }
            </div>
        </header>
    )
}