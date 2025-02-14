import {useTranslations} from 'next-intl';
import Image from "next/image";
import "@/styles/components/footer.css";
import { APP_GIT } from '@/lib/constants';


export default function Footer () {
  const t = useTranslations('common');
  return (
      <footer className={"footer vertical-list flex-center"}>
        <div className={"vertical-list flex-center gap-4mm"}>
          <div className="center">
            <picture className="footer-logo">
                <source srcSet="/images/logo-dark.png" media="(prefers-color-scheme: dark)" />
                <Image className="footer-logo" src="/images/logo-light.png" alt={t('header.alt_logo')} width={256} height={60}></Image>
            </picture>
          </div>
          <div className="horizontal-list gap-4mm normal title flex-center">
            <a href={t("footer.link_code_of_conduct")} target="_blank" rel="noopener noreferrer">{t('footer.code_of_conduct')}</a>
            <a href="https://furizon.net/join-furizon-staff/" target="_blank" rel="noopener noreferrer">{t('footer.volunteers')}</a>
            <a href="https://furizon.net/contact/" target="_blank" rel="noopener noreferrer">{t('footer.contact_us')}</a>
          </div>
          <div className="horizontal-list gap-4mm normal title flex-center flex-align-center">
            <a href="https://www.youtube.com/@apsfurizon7425" target="_blank" rel="noopener noreferrer">
              <Image className="footer-logo-youtube" src="/images/footer/youtube-brands-solid.svg" alt="Youtube logo" width={32} height={32}></Image>
            </a>
            <a href="https://www.instagram.com/furizonaps/" target="_blank" rel="noopener noreferrer">
              <Image className="footer-logo-instagram" src="/images/footer/instagram-brands-solid.svg" alt="Instagram logo" width={32} height={32}></Image>
            </a>
            <a href="https://t.me/APSFurizon" target="_blank" rel="noopener noreferrer">
              <Image className="footer-logo-telegram" src="/images/footer/telegram-brands-solid.svg" alt="Facebook logo" width={32} height={32}></Image>
            </a>
            <a href="https://x.com/FurizonEvents" target="_blank" rel="noopener noreferrer">
              <Image className="footer-logo-twitter" src="/images/footer/square-x-twitter-brands-solid.svg" alt="Twitter logo" width={32} height={32}></Image>
            </a>
            <a href="https://www.facebook.com/Furizon/" target="_blank" rel="noopener noreferrer">
              <Image className="footer-logo-facebook" src="/images/footer/facebook-brands-solid.svg" alt="Facebook logo" width={32} height={32}></Image>
            </a>
          </div>
          <div className="footer-info horizontal-list gap-4mm tiny normal title flex-center">
            <span>{t('footer.society_name')}</span>
            <span>{t('footer.address')}</span>
          </div>
          <p className="tiny color-subtitle center">
            <span>Made by </span>
            <a className="color-link" href="https://www.instagram.com/stranckv2">Stranck</a>
            <span>, </span>
            <a className="color-link" href="https://about.woffo.ovh">Drew</a>
            <span> & </span>
            <a className="color-link" href="https://x.com/starkthedragon">Stark</a>
          </p>
          <div className="tiny color-subtitle center">
            <span>{t("source_code")} <a className="color-link" href={APP_GIT}>{APP_GIT}</a></span>
          </div>
        </div>
      </footer>
  )
}