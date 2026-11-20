import { getUser } from "@/lib/api/user/server";
import { getCredits } from "@/lib/components/footer";
import { APP_GIT, APP_VERSION } from "@/lib/constants";
import { cn } from "@/lib/utils";
import "@/styles/components/footer.css";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function Footer() {
  const t = await getTranslations();
  const { user } = await getUser();
  const allCredits = await getCredits();
  return (
    <footer className={"footer px-15 py-12"}>
      <div className="footer__container mx-auto max-w-7xl">
        <picture>
          <source srcSet="/images/logo_dark.svg" media="(prefers-color-scheme: dark)" />
          <Image
            className="footer__logo -translate-x-9"
            src="/images/logo_light.svg"
            alt={t("common.header.alt_logo")}
            width={256}
            height={60}
            loading="eager"
          />
        </picture>
        {/* Main content */}
        <div className="mt-10 flex flex-col gap-4 md:flex-row">
          <div className="title flex flex-col gap-2">
            <p className="bold text-xl">{t("common.header.organizer.title")}</p>
            <a
              href={t("common.footer.organizer.terms_of_service.link")}
              target="_blank"
              rel="noopener noreferrer external"
            >
              {t("common.footer.organizer.terms_of_service.title")}
            </a>
            <a
              href={t("common.footer.organizer.code_of_conduct.link")}
              target="_blank"
              rel="noopener noreferrer external"
            >
              {t("common.footer.organizer.code_of_conduct.title")}
            </a>
            <a href="https://furizon.net/join-furizon-staff/" target="_blank" rel="noopener noreferrer external">
              {t("common.footer.organizer.volunteers.title")}
            </a>
            <a href="https://furizon.net/contact/" target="_blank" rel="noopener noreferrer external">
              {t("common.footer.organizer.contact_us.title")}
            </a>
            {user && <a href="mailto:helpdesk@furizon.net">{t("common.footer.organizer.email_us.title")}</a>}
          </div>
          <div className="flex-1"></div>
          <div>
            {/* Social media */}
            <div className="title">
              <p className="bold text-xl">{t("common.footer.social.title")}</p>
              <div className="mt-4 flex gap-4">
                <a href="https://www.youtube.com/@apsfurizon7425" target="_blank" rel="noopener noreferrer external">
                  <Image
                    className="footer__social-logo"
                    src="/images/footer/socials/youtube.svg"
                    alt="Youtube logo"
                    width={24}
                    height={24}
                  />
                </a>
                <a href="https://www.instagram.com/furizonaps/" target="_blank" rel="noopener noreferrer external">
                  <Image
                    className="footer__social-logo"
                    src="/images/footer/socials/instagram.svg"
                    alt="Instagram logo"
                    width={24}
                    height={24}
                  />
                </a>
                <a href="https://t.me/APSFurizon" target="_blank" rel="noopener noreferrer external">
                  <Image
                    className="footer__social-logo"
                    src="/images/footer/socials/telegram.svg"
                    alt="Facebook logo"
                    width={24}
                    height={24}
                  />
                </a>
                <a href="https://x.com/FurizonEvents" target="_blank" rel="noopener noreferrer external">
                  <Image
                    className="footer__social-logo"
                    src="/images/footer/socials/x.svg"
                    alt="Facebook logo"
                    width={24}
                    height={24}
                  />
                </a>
                <a href="https://www.facebook.com/Furizon/" target="_blank" rel="noopener noreferrer external">
                  <Image
                    className="footer__social-logo"
                    src="/images/footer/socials/facebook.svg"
                    alt="Facebook logo"
                    width={24}
                    height={24}
                  />
                </a>
                <a href={APP_GIT} target="_blank" rel="noopener noreferrer external">
                  <Image
                    className="footer__social-logo"
                    src="/images/footer/socials/github.svg"
                    alt="GitHub logo"
                    width={24}
                    height={24}
                  />
                </a>
              </div>
            </div>
            {/* Credits */}
            {allCredits && (
              <div className="title mt-4">
                <p className="bold text-xl">{t("common.footer.developers.title")}</p>
                <p className="flex gap-2 text-base wrap-normal">
                  {allCredits.credits.map((credit, index) => (
                    <a key={index} className={cn(credit.link ? "color-link" : "")} href={credit.link ?? undefined}>
                      {credit.name}
                    </a>
                  ))}
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Lower content */}
        <div className="mt-10 flex">
          <p className="text-sm">Furpanel {APP_VERSION ?? ""}</p>
          <div className="flex-1"></div>
          <p className="text-sm">{t("common.footer.society_name")}</p>
        </div>
      </div>
    </footer>
  );
}
