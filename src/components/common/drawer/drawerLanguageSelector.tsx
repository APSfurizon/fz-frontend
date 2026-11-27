import { useUser } from "@/components/context/userProvider";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link, routing, usePathname } from "@/i18n/routing";
import { changeLanguage } from "@/lib/api/user";
import { cn, languageToCountryCode } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export default function DrawerLanguageSelector() {
  const locale = useLocale();
  const path = usePathname();
  const t = useTranslations();
  const selectableLanguages = routing.locales.filter((lng) => lng !== locale);
  const { userDisplay } = useUser();

  return (
    <AccordionItem value="language">
      <AccordionTrigger className="text-md">
        <span className={cn("mr-2 rounded-xs text-lg", "fi fis fi-" + languageToCountryCode(locale))}></span>
        {t("common.header.language.title")}
      </AccordionTrigger>
      <AccordionContent>
        {selectableLanguages.map((language, index) => (
          <Link
            key={index}
            locale={locale}
            prefetch={false}
            shallow={false}
            href={path}
            onNavigate={(e) => changeLanguage(e, language, userDisplay?.display)}
          >
            <Button variant="ghost">
              <span className={"fi fis fi-" + languageToCountryCode(language) + " rounded-xs"}></span>
              {t("common.header.dropdown.language" + "." + language)}
            </Button>
          </Link>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
