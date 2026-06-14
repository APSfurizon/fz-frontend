import { TOKEN_STORAGE_NAME } from "@/lib/constants";
import { getCookie } from "@/lib/utils";

export function getToken(): string | null {
  return `Bearer ${getCookie(TOKEN_STORAGE_NAME)}`;
}
