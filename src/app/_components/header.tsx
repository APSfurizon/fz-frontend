import {useTranslations} from 'next-intl';
import Image from "next/image";
import "../styles/components/header.css";

export default function Header () {
    const t = useTranslations('common');
    return (
        <header className='header'>
            <div className="logo-container center">
                <Image className="header-logo" src="/images/logo-dark.png" alt={t('header.alt_logo')} width={256} height={60}></Image>
            </div>
            <div className="horizontal-list">

            </div>
        </header>
    )
}