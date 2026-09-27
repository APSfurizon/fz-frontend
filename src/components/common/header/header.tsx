"use client";
import { Button } from "@/components/common";
import { useUser } from "@/components/context/userProvider";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from "@/components/dialogs";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { UserDisplayResponse } from "@/lib/api/user";
import { APP_LINKS, SHOW_APP_BANNER } from "@/lib/constants";
import { isMobile, UA } from "@/lib/userAgent";
import "@/styles/components/header.css";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { OSName } from "ua-parser-js/enums";
import Icon from "../../icon";
import DrawerLinks from "./drawerLinks";
import HeaderLinks from "./headerLinks";

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
  const { setUserDisplay } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [latestScroll, setLatestScroll] = useState<number>();
  const [newScroll, setNewScroll] = useState<number>();
  const headerRef = useRef<HTMLElement>(null);
  const language = locale.split("-")[0];
  const deviceTypeLower = type.toString().toLowerCase();
  const appBadgeSrc = `/images/app-badge/${deviceTypeLower}/${deviceTypeLower}_${language}.png`;

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
      <div className="logo-container center sm:hidden lg:block">
        <Image
          className="header-logo"
          src="/images/logo_light.svg"
          alt={t("header.alt_logo")}
          width={130}
          height={30}
          loading="eager"
        />
      </div>
      <NavigationMenu className="w-full max-w-none">
        <NavigationMenuList className="flex sm:hidden">
          <div className="flex-1" />
          <NavigationMenuItem>
            <Drawer swipeDirection="right">
              <DrawerTrigger className="hamburger-menu" render={<Button variant={"ghost"} title={t("menu")} />}>
                <Icon icon="MENU" />
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
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
                </DrawerHeader>
                <div className="p-4">
                  <DrawerLinks userData={props.userData} />
                </div>
                <DrawerFooter>
                  {/* Phone app */}
                  {[DEVICE_TYPE.ANDROID, DEVICE_TYPE.APPLE].includes(type) && SHOW_APP_BANNER && (
                    <>
                      <div className="horizontal-list gap-2mm align-items-center">
                        <span className="color-subtitle font-sans text-sm text-nowrap">{t("header.app_badge")}</span>
                        <div className="spacer"></div>
                        <a target="_blank" href={APP_LINKS[deviceTypeLower] ?? ""}>
                          <Image
                            className="app-badge"
                            src={appBadgeSrc}
                            width={160}
                            height={40}
                            alt={t("header.alt_app_badge")}
                          ></Image>
                        </a>
                      </div>
                    </>
                  )}
                  <DrawerClose render={<Button variant="outline" />}>
                    <Icon icon="CLOSE" />
                    {t("close")}
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </NavigationMenuItem>
        </NavigationMenuList>
        <HeaderLinks userData={props.userData} />
      </NavigationMenu>
    </header>
  );
}
