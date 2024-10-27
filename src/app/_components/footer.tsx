import Image from "next/image";
import "../styles/components/footer.module.css";

export default function Footer () {
    return (
        <footer className={"footer vertical-list flex-center"}>
          <div className={"vertical-list flex-center gap-4mm"}>
            <div className="logo-container center">
              <Image className="footer-logo" src="/images/logo-dark.png" alt="Furizon logo" width={256} height={60}></Image>
            </div>
            <div className="horizontal-list gap-4mm normal title flex-center">
              <a href="https://todo.com" target="_blank" rel="noopener noreferrer"> Code of conduct </a>
              <a href="https://todo.com" target="_blank" rel="noopener noreferrer"> Volunteers </a>
              <a href="https://todo.com" target="_blank" rel="noopener noreferrer"> Contacts </a>
            </div>
            <div className="horizontal-list gap-4mm normal title flex-center flex-align-center">
              <a href="https://www.youtube.com/@apsfurizon7425" target="_blank" rel="noopener noreferrer">
                <Image className="footer-logo-youtube" src="/images/footer/youtube-brands-solid.svg" alt="Youtube logo" width={32} height={32}></Image>
              </a>
              <a href="https://x.com/FurizonEvents" target="_blank" rel="noopener noreferrer">
                <Image className="footer-logo-twitter" src="/images/footer/square-x-twitter-brands-solid.svg" alt="Twitter logo" width={32} height={32}></Image>
              </a>
              <a href="https://www.facebook.com/Furizon/" target="_blank" rel="noopener noreferrer">
                <Image className="footer-logo-facebook" src="/images/footer/facebook-brands-solid.svg" alt="Facebook logo" width={28} height={28}></Image>
              </a>
              <a href="https://t.me/APSFurizon" target="_blank" rel="noopener noreferrer">
                <Image className="footer-logo-telegram" src="/images/footer/telegram-brands-solid.svg" alt="Facebook logo" width={28} height={28}></Image>
              </a>
            </div>
            <div className="horizontal-list gap-4mm tiny normal title flex-center">
              <span>Associazione di Promozione Sociale FURIZON</span>
              <span>Via G. Turri, 12, 42121 - Reggio Emilia (RE)</span>
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