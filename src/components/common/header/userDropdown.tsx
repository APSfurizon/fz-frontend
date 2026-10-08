import Icon from "@/components/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { UserData } from "@/lib/api/user";
import { useTranslations } from "next-intl";

export function getUsernameFallback(name: string) {
  if (name.trim().length == 0) return "?";
  if (name.trim().length == 1) return name;
  return name.includes(" ")
    ? name
        .split(" ")
        .splice(0, 2)
        .map((s) => s[0])
        .join()
        .toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

export default function UserDropDown({ userData }: Readonly<{ userData?: UserData }>) {
  const t = useTranslations("common");

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="align-middle">
        {userData && (
          <>
            {/*<UserPicture userData={userData} />*/}
            <Avatar>
              <AvatarImage src={userData.propic?.mediaUrl} alt={userData.fursonaName} />
              <AvatarFallback>{getUsernameFallback(userData.fursonaName ?? "")}</AvatarFallback>
            </Avatar>
            &nbsp;
            <span>{userData.fursonaName}</span>
          </>
        )}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/user">
          <Icon icon="PERSON" />
          {t("header.links.user.title")}
        </NavigationMenuLink>
        <NavigationMenuLink href="/logout">
          <Icon icon="LOGOUT" />
          {t("header.links.logout.title")}
        </NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
