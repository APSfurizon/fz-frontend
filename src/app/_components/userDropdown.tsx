"use client"
import {useTranslations} from 'next-intl';
import { useEffect, useState } from 'react';
import Icon, { ICONS } from './icon';
import UserPicture from './userPicture';
import "../styles/components/userDropDown.css";
import { runRequest } from '../_lib/api/global';
import { LogoutApiAction } from '../_lib/api/login';
import { useRouter } from 'next/navigation';
import { useUser } from '../_lib/context/userProvider';
import { UserData } from '../_lib/api/user';

export default function UserDropDown ({userData}: Readonly<{userData: UserData}>) { 
    const [isOpen, setOpen] = useState(false);
    const [isHover, setHover] = useState(false);
    const t = useTranslations('common');
    const {setUpdateUser} = useUser();
    const router = useRouter();
    
    const logout = () => {
        runRequest(new LogoutApiAction())
        .catch((err)=>console.warn("Could not log out: "+ err))
        .finally(()=>{
            setUpdateUser(true);
            router.replace("/login");
        });
    }

    return (
        <span tabIndex={0} className="user-dropdown horizontal-list flex-vertical-center rounded-m" onClick={()=>setOpen(!isOpen)}
            onBlur={()=>{if (!isHover) setOpen(false)}} onPointerOver={()=>setHover(true)} onPointerLeave={()=>setHover(false)}>
            <Icon style={{fontSize: "24px"}} iconName={isOpen ? ICONS.ARROW_DROP_UP : ICONS.ARROW_DROP_DOWN}></Icon>
            <span className="title semibold nickname">{userData.fursonaName}</span>
            <UserPicture userData={userData}></UserPicture>
            <div className={`dropdown-container ${isOpen && 'open'}`} onClick={(e)=>e.stopPropagation()}>
                <a href='#' onClick={() => logout()} className='title rounded-m vertical-align-middle'>{t('header.logout')}</a>
            </div>
        </span>
    )
}