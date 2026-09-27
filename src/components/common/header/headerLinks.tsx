import { useUser } from "@/components/context/userProvider";
import Icon from "@/components/icon";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Permissions } from "@/lib/api/permission";
import { UserDisplayResponse } from "@/lib/api/user";
import { GALLERY_ENABLED, NOSECOUNT_ENABLED, SCHEDULE_ENABLED } from "@/lib/constants";
import { useTranslations } from "next-intl";
import LanguageSelector from "./languageSelector";
import UserDropDown from "./userDropdown";

export default function HeaderLinks(props: Readonly<{ userData: UserDisplayResponse | null }>) {
  const t = useTranslations("common");
  const { userDisplay } = useUser();
  const canViewAdminPages = props.userData?.permissions?.includes(Permissions.CAN_SEE_ADMIN_PAGES);

  return (
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
      {/* Language selector */}
      <LanguageSelector />
      {/* User dropdown */}
      {userDisplay?.display && <UserDropDown userData={userDisplay?.display} />}
      {!userDisplay && (
        <NavigationMenuItem>
          <NavigationMenuLink href="/login">
            <Icon icon="KEY" />
            {t("header.links.login.title")}
          </NavigationMenuLink>
        </NavigationMenuItem>
      )}
    </NavigationMenuList>
  );
}
