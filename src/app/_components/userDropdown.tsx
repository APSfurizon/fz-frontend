"use client"
import {useTranslations} from 'next-intl';
import { HeaderData } from '../_lib/components/header';
import { useEffect, useState } from 'react';
import { getUserPicture } from '../_lib/api/user';
import Icon, { ICONS } from './icon';
import UserPicture from './userPicture';
import "../styles/components/userDropDown.css";
import { runRequest } from '../_lib/api/global';
import { LogoutApiAction } from '../_lib/api/login';
import { useRouter } from 'next/navigation';
import { useHeaderUpdate } from '../_lib/context/headerProvider';

export default function UserDropDown ({headerData}: Readonly<{headerData: HeaderData}>) { 
    const [isOpen, setOpen] = useState(false);
    const [isHover, setHover] = useState(false);
    const t = useTranslations('common');
    const {updateHeader, setUpdateHeader} = useHeaderUpdate();
    const router = useRouter();
    
    const logout = () => {
        runRequest(new LogoutApiAction())
        .catch((err)=>console.warn("Could not log out: "+ err))
        .finally(()=>{
            setUpdateHeader(true);
            router.replace("/login");
        });
    }

    return (
        <span tabIndex={0} className="user-dropdown horizontal-list flex-vertical-center rounded-m" onClick={()=>setOpen(!isOpen)}
            onBlur={()=>{if (!isHover) setOpen(false)}} onPointerOver={()=>setHover(true)} onPointerLeave={()=>setHover(false)}>
            <Icon style={{fontSize: "24px"}} iconName={isOpen ? ICONS.ARROW_DROP_UP : ICONS.ARROW_DROP_DOWN}></Icon>
            <span className="title semibold nickname">{headerData.fursonaName}</span>
            <UserPicture userData={getUserPicture(headerData)}></UserPicture>
            <div className={`dropdown-container ${isOpen && 'open'}`} onClick={(e)=>e.stopPropagation()}>
                <a href='#' onClick={() => logout()} className='title rounded-m vertical-align-middle'>{t('header.logout')}</a>
            </div>
        </span>
    )
}