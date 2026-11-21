import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { cache } from "react";
import "server-only";
import { ApiErrorResponse, runRequest } from "../networking";
import { UserDisplayAction } from "./main";
import { GetUserResult } from "./types";

/**
 * Retrieves the user via server side connection
 */
export const getUser: () => Promise<GetUserResult> = cache(async () => {
  let data = null;
  let error = null;
  try {
    data = await runRequest({
      action: new UserDisplayAction(),
      cookieStore: await cookies(),
    });
  } catch (e) {
    error = e as ApiErrorResponse;
  }
  return {
    user: data,
    error,
  };
});

export async function getTitleMetadata(
  translationGetter: (t: Awaited<ReturnType<typeof getTranslations>>) => string
): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: translationGetter(t) + " - Furpanel",
  };
}
