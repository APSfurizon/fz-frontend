import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export type ServerTranslator = typeof getTranslations;
export type ClientTranslator = ReturnType<typeof useTranslations>;

export type Translator = ServerTranslator | ClientTranslator;
