import { useUser } from "@/components/context/userProvider";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link, routing, usePathname } from "@/i18n/routing";
import { changeLanguage } from "@/lib/api/user";
import { languageToCountryCode } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export default function LanguageSelector() {
  const locale = useLocale();
  const path = usePathname();
  const t = useTranslations();
  const selectableLanguages = routing.locales.filter((lng) => lng !== locale);
  const { userDisplay } = useUser();

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="text-base" title={t("common.header.language.title")}>
        <span className={"fi fis fi-" + languageToCountryCode(locale) + " rounded-xs"}></span>
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        {selectableLanguages.map((language, index) => (
          <NavigationMenuLink
            key={index}
            render={
              <Link
                locale={language}
                prefetch={false}
                shallow={false}
                href={path}
                onNavigate={(e) => changeLanguage(e, language, userDisplay?.display)}
              />
            }
          >
            <span className={"fi fis fi-" + languageToCountryCode(language) + " rounded-xs"}></span>
            {t("common.header.dropdown.language" + "." + language)}
          </NavigationMenuLink>
        ))}
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
