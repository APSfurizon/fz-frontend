"use client"
import {useTranslations} from 'next-intl';
import { EMPTY_HEADER_DATA, getHeaderUserData, HeaderData } from '../_lib/components/header';
import Image from "next/image";
import Icon, { ICONS } from './icon';
import { useRouter } from 'next/navigation';
import Button from "../_components/button";
import "../styles/components/header.css";
import { useEffect, useState } from 'react';
import UserDropDown from './userDropdown';
import { useHeaderUpdate } from '../_lib/context/headerProvider';

export default function Header () {
    const t = useTranslations('common');
    const [headerData, setHeaderData] = useState<HeaderData>(EMPTY_HEADER_DATA);
    const [isLoading, setLoading] = useState(true);
    const {updateHeader, setUpdateHeader} = useHeaderUpdate();
    const router = useRouter();

    const headerUpdateLogic = (doUpdate: boolean) => {
        if (doUpdate) {
            getHeaderUserData().then((data)=> {
                setHeaderData(data);
            }).catch(()=>{
                return EMPTY_HEADER_DATA;
            }).finally(()=>{
                setLoading(false);
            });
            setUpdateHeader(false);
        }
    }

    useEffect(()=> {
        headerUpdateLogic(updateHeader);
    }, [updateHeader]);

    useEffect(()=> {
        headerUpdateLogic(true);
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
                            : <Button onClick={()=>router.push('/login')} iconName='key'>{t('header.login')}</Button>
                }
            </div>
        </header>
    )
}