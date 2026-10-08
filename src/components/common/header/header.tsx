"use client";
import { useUser } from "@/components/context/userProvider";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { UserDisplayResponse } from "@/lib/api/user";
import { isMobile, UA } from "@/lib/userAgent";
import "@/styles/components/header.css";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { OSName } from "ua-parser-js/enums";
import HeaderDrawer from "../drawer/headerDrawer";
import HeaderLinks from "./headerLinks";

export enum DEVICE_TYPE {
  APPLE = "apple",
  ANDROID = "android",
  GENERIC = "generic",
}

export const currentDeviceType = isMobile()
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
  const { userDisplay, setUserDisplay } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [latestScroll, setLatestScroll] = useState<number>();
  const [newScroll, setNewScroll] = useState<number>();
  const headerRef = useRef<HTMLElement>(null);

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
            <HeaderDrawer userData={userDisplay} />
          </NavigationMenuItem>
        </NavigationMenuList>
        <HeaderLinks userData={userDisplay} />
      </NavigationMenu>
    </header>
  );
}
