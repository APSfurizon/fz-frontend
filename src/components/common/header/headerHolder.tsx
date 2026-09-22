import { ApiErrorResponse, runRequest } from "@/lib/api/networking";
import { UserDisplayAction } from "@/lib/api/user";
import { cookies } from "next/headers";
import Header from "./header";

export default async function HeaderHolder() {
  let data = null;
  let error: ApiErrorResponse | null = null;
  try {
    data = await runRequest({
      action: new UserDisplayAction(),
      cookieStore: await cookies(),
    });
  } catch (e) {
    error = e as ApiErrorResponse;
  }

  return (
    <>
      <Header userData={data} />
    </>
  );
}
