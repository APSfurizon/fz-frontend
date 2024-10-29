import {useTranslations} from 'next-intl';
import "../styles/components/header.css";

export default function Header () {
    const t = useTranslations('common');
    return (
        <header className='header'>
            <p>{t('header.home')}</p>
        </header>
    )
}