"use client"
import {useTranslations} from 'next-intl';
import { HeaderData } from '../_lib/components/header';
import { useEffect, useState } from 'react';
import { getUserPicture } from '../_lib/api/user';
import Icon, { ICONS } from './icon';
import UserPicture from './userPicture';
import "../styles/components/userDropDown.css";

export default function UserDropDown ({headerData}: Readonly<{headerData: HeaderData}>) { 
    const [isOpen, setOpen] = useState(false);
    const t = useTranslations('common');
    return (
        <span tabIndex={0} className="user-dropdown horizontal-list flex-vertical-center rounded-m" onClick={()=>setOpen(!isOpen)} onBlur={()=>setOpen(false)}>
            <Icon style={{fontSize: "24px"}} iconName={isOpen ? ICONS.ARROW_DROP_UP : ICONS.ARROW_DROP_DOWN}></Icon>
            <span className="title semibold nickname">{headerData.nickname}</span>
            <UserPicture userData={getUserPicture(headerData)}></UserPicture>
            <div className={`dropdown-container ${isOpen && 'open'}`} onClick={(e)=>e.stopPropagation()}>
                <a className='title rounded-m vertical-align-middle'>
                    {t('header.logout')}
                </a>
            </div>
        </span>
    )
}