"use client";
import { useUser } from "@/components/context/userProvider";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Permissions } from "@/lib/api/permission";
import { UserDisplayResponse } from "@/lib/api/user";
import { APP_LINKS, GALLERY_ENABLED, NOSECOUNT_ENABLED, SCHEDULE_ENABLED, SHOW_APP_BANNER } from "@/lib/constants";
import { isMobile, UA } from "@/lib/userAgent";
import "@/styles/components/header.css";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { OSName } from "ua-parser-js/enums";
import Icon from "../../icon";
import UserDropDown from "../../userDropdown";

enum DEVICE_TYPE {
  APPLE = "apple",
  ANDROID = "android",
  GENERIC = "generic",
}

const type = isMobile()
  ? UA.os.is(OSName.ANDROID)
    ? DEVICE_TYPE.ANDROID
    : UA.os.is(OSName.IOS)
      ? DEVICE_TYPE.APPLE
      : DEVICE_TYPE.GENERIC
  : DEVICE_TYPE.GENERIC;

type HeaderProps = {
  userData: UserDisplayResponse | null;
};

export default function Header(props: Readonly<HeaderProps>) {
  const t = useTranslations("common");
  const locale = useLocale();
  const { userDisplay, setUserDisplay } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [latestScroll, setLatestScroll] = useState<number>();
  const [newScroll, setNewScroll] = useState<number>();
  const headerRef = useRef<HTMLElement>(null);
  const language = locale.split("-")[0];
  const deviceTypeLower = type.toString().toLowerCase();
  const appBadgeSrc = `/images/app-badge/${deviceTypeLower}/${deviceTypeLower}_${language}.png`;
  const canViewAdminPages = props.userData?.permissions?.includes(Permissions.CAN_SEE_ADMIN_PAGES);

  const updateScroll = () => setNewScroll(document.body.scrollTop);
  useEffect(() => {
    document.body.addEventListener("scroll", updateScroll);
    setUserDisplay(props.userData);
    return () => {
      document.body.removeEventListener("scroll", updateScroll);
    };
  }, []);

  useEffect(() => {
    if (newScroll === undefined) return;
    if (latestScroll === undefined) {
      setLatestScroll(newScroll);
      return;
    }

    /*Scrolled down*/
    if (newScroll > latestScroll) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
    setLatestScroll(newScroll);
  }, [newScroll]);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const updateHeaderOffset = () => {
      const rect = headerEl.getBoundingClientRect();
      const visibleOffset = Math.max(0, Math.round(rect.bottom));
      document.documentElement.style.setProperty("--app-header-offset", `${visibleOffset}px`);
    };

    updateHeaderOffset();

    const observer = new ResizeObserver(updateHeaderOffset);
    observer.observe(headerEl);
    window.addEventListener("resize", updateHeaderOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderOffset);
    };
  }, []);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const rect = headerEl.getBoundingClientRect();
    const visibleOffset = Math.max(0, Math.round(rect.bottom));
    document.documentElement.style.setProperty("--app-header-offset", `${visibleOffset}px`);
  }, [newScroll, collapsed]);

  return (
    <header ref={headerRef} className={`header ${collapsed ? "collapsed" : ""}`}>
      <div className="logo-container center">
        <picture className="header-logo">
          <source srcSet="/images/logo_dark.svg" media="(prefers-color-scheme: dark)" />
          <Image
            className="header-logo"
            src="/images/logo_light.svg"
            alt={t("header.alt_logo")}
            width={175}
            height={40}
            loading="eager"
          />
        </picture>
      </div>
      <NavigationMenu className="w-full max-w-none">
        <NavigationMenuList className="flex sm:hidden">
          <div className="flex-1" />
          <NavigationMenuItem>
            <NavigationMenuLink title={t("menu")} href="#">
              <Icon icon="MENU" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="hidden w-full items-center sm:flex">
          {/* Reservation item */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>{t("header.links.reservation.title")}</NavigationMenuTrigger>
            <NavigationMenuContent>
              {/* TODO: Check if no ticket <NavigationMenuLink>{t("header.links.reservation.links.manage.title")}</NavigationMenuLink> */}
              <NavigationMenuLink href="/reservation">
                <Icon icon="LOCAL_ACTIVITY" />
                {t("header.links.reservation.links.my_booking.title")}
              </NavigationMenuLink>
              <NavigationMenuLink href="/badge">
                <Icon icon="PERSON_BOOK" />
                {t("header.links.reservation.links.badge.title")}
              </NavigationMenuLink>
              <NavigationMenuLink href="/room">
                <Icon icon="BED" />
                {t("header.links.reservation.links.room.title")}
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          {/* Convention item */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>{t("header.links.convention.title")}</NavigationMenuTrigger>
            <NavigationMenuContent>
              {SCHEDULE_ENABLED && (
                <NavigationMenuLink href="/schedule">
                  <Icon icon="CALENDAR_MONTH" />
                  {t("header.links.convention.links.schedule.title")}
                </NavigationMenuLink>
              )}
              {GALLERY_ENABLED && (
                <NavigationMenuLink href="/gallery/explore">
                  <Icon icon="IMAGE" />
                  {t("header.links.convention.links.gallery.title")}
                </NavigationMenuLink>
              )}
              {NOSECOUNT_ENABLED && (
                <NavigationMenuLink href="/nosecount">
                  <Icon icon="GROUPS" />
                  {t("header.links.convention.links.nosecount.title")}
                </NavigationMenuLink>
              )}
            </NavigationMenuContent>
          </NavigationMenuItem>
          {canViewAdminPages && (
            <NavigationMenuItem>
              <NavigationMenuLink href="/admin">
                <Icon icon="SECURITY" />
                {t("header.links.admin.title")}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
          <div className="flex-1" />
          <NavigationMenuItem>
            <UserDropDown userData={userDisplay?.display} loading={false}></UserDropDown>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* OLD */}

      <div className={`header-link-container horizontal-list align-items-center`}>
        {/* Phone app */}
        {[DEVICE_TYPE.ANDROID, DEVICE_TYPE.APPLE].includes(type) && SHOW_APP_BANNER && (
          <>
            <div className="horizontal-list gap-4mm align-items-center" style={{ width: "100%" }}>
              <span className="descriptive small color-subtitle">{t("header.app_badge")}</span>
              <div className="spacer"></div>
              <a target="_blank" href={APP_LINKS[deviceTypeLower] ?? ""}>
                <Image
                  className="app-badge"
                  src={appBadgeSrc}
                  width={120}
                  height={40}
                  alt={t("header.alt_app_badge")}
                ></Image>
              </a>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
