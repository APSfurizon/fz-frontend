import {useTranslations} from 'next-intl';
import Image from "next/image";
import "../styles/components/footer.css";


export default function Footer () {
  const t = useTranslations('common');
  return (
      <footer className={"footer vertical-list flex-center"}>
        <div className={"vertical-list flex-center gap-4mm"}>
          <div className="center">
            <Image className="footer-logo" src="/images/logo-dark.png" alt="Furizon logo" width={256} height={60}></Image>
          </div>
          <div className="horizontal-list gap-4mm normal title flex-center">
            <a href="https://todo.com" target="_blank" rel="noopener noreferrer">{t('footer.code_of_conduct')}</a>
            <a href="https://todo.com" target="_blank" rel="noopener noreferrer">{t('footer.volunteers')}</a>
            <a href="https://todo.com" target="_blank" rel="noopener noreferrer">{t('footer.contact_us')}</a>
          </div>
          <div className="horizontal-list gap-4mm normal title flex-center flex-align-center">
            <a href="https://www.youtube.com/@apsfurizon7425" target="_blank" rel="noopener noreferrer">
              <Image className="footer-logo-youtube" src="/images/footer/youtube-brands-solid.svg" alt="Youtube logo" width={32} height={32}></Image>
            </a>
            <a href="https://x.com/FurizonEvents" target="_blank" rel="noopener noreferrer">
              <Image className="footer-logo-twitter" src="/images/footer/square-x-twitter-brands-solid.svg" alt="Twitter logo" width={32} height={32}></Image>
            </a>
            <a href="https://www.facebook.com/Furizon/" target="_blank" rel="noopener noreferrer">
              <Image className="footer-logo-facebook" src="/images/footer/facebook-brands-solid.svg" alt="Facebook logo" width={32} height={32}></Image>
            </a>
            <a href="https://t.me/APSFurizon" target="_blank" rel="noopener noreferrer">
              <Image className="footer-logo-telegram" src="/images/footer/telegram-brands-solid.svg" alt="Facebook logo" width={32} height={32}></Image>
            </a>
          </div>
          <div className="horizontal-list gap-4mm tiny normal title flex-center">
            <span>{t('footer.society_name')}</span>
            <span>{t('footer.address')}</span>
          </div>
          <p className="tiny color-subtitle center">
            <span>Designed by </span>
            <a className="color-link" href="https://about.woffo.ovh">Drew</a>
            <span>, co-engineered by </span>
            <a className="color-link" href="https://about.woffo.ovh">Stark</a>
            <span> & </span>
            <a className="color-link" href="https://about.woffo.ovh">Stranck</a>
          </p>
        </div>
      </footer>
  )
}