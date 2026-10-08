import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from "@/components/dialogs";
import Icon from "@/components/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserDisplayResponse } from "@/lib/api/user";
import { APP_LINKS, SHOW_APP_BANNER } from "@/lib/constants";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { currentDeviceType, DEVICE_TYPE } from "../header/header";
import { getUsernameFallback } from "../header/userDropdown";
import DrawerLinks from "./drawerLinks";

export default function HeaderDrawer(props: Readonly<{ userData?: UserDisplayResponse | null }>) {
  const t = useTranslations("common");

  const locale = useLocale();
  const language = locale.split("-")[0];
  const deviceTypeLower = currentDeviceType.toString().toLowerCase();
  const appBadgeSrc = `/images/app-badge/${deviceTypeLower}/${deviceTypeLower}_${language}.png`;

  return (
    <Drawer swipeDirection="right">
      <DrawerTrigger className="hamburger-menu" render={<Button variant="secondary" title={t("menu")} />}>
        <Icon icon="MENU" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex flex-row">
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
          <div className="flex-auto"></div>
          <DrawerClose render={<Button variant="ghost" title={t("close")} />}>
            <Icon icon="CLOSE" />
          </DrawerClose>
        </DrawerHeader>
        <div className="font-heading mt-5 pl-4">
          <DrawerLinks userData={props.userData} />
        </div>
        <DrawerFooter className="bg-sidebar-accent pt-4">
          {/* Phone app */}
          {[DEVICE_TYPE.ANDROID, DEVICE_TYPE.APPLE].includes(currentDeviceType) && SHOW_APP_BANNER && (
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
          {/* User */}
          <div className="user-container flex flex-row items-center">
            <DrawerClose
              nativeButton={false}
              className="flex flex-row items-center gap-0.5"
              render={<Link href="/user" />}
            >
              <Avatar size="lg">
                <AvatarImage
                  src={props.userData?.display?.propic?.mediaUrl}
                  alt={props.userData?.display?.fursonaName}
                />
                <AvatarFallback>{getUsernameFallback(props.userData?.display?.fursonaName ?? "")}</AvatarFallback>
              </Avatar>
              &nbsp;
              <span className="font-heading font-bold">{props.userData?.display?.fursonaName}</span>
            </DrawerClose>
            <div className="flex-auto"></div>
            <DrawerClose
              nativeButton={false}
              render={
                props.userData ? (
                  <Button
                    nativeButton={false}
                    variant="destructive"
                    render={<Link href="/logout" />}
                    title={t("header.links.logout.title")}
                  />
                ) : (
                  <Button
                    nativeButton={false}
                    variant="default"
                    render={<Link href="/login" />}
                    title={t("header.links.login.title")}
                  />
                )
              }
            >
              <Icon icon={props.userData ? "LOGOUT" : "KEY"} />
              {!props.userData ? t("header.links.login.title") : ""}
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
