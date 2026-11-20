import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import "server-only";

export type Credit = {
  name: string;
  link?: string;
};

export type FooterCredit = {
  credits: Credit[];
};

/** */
export const getCredits: () => Promise<FooterCredit | null> = cache(async () => {
  try {
    const readFile = await fs.readFile(path.join(process.cwd(), "credits.json"), "utf-8");
    if (!readFile) {
      return null;
    }
    return JSON.parse(readFile) as FooterCredit;
  } catch {
    return null;
  }
});
