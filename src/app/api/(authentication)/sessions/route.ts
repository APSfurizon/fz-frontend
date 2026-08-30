import { LoginFormAction, LoginResponse } from "@/lib/api/authentication/login";
import { runRequest } from "@/lib/api/networking";
import { APP_HOSTNAME, SESSION_DURATION, TOKEN_STORAGE_NAME } from "@/lib/constants";
import { NextResponse } from "next/server";

/**
 * The session creation endpoint for loggin in
 * @param req The request data
 */
export async function POST(req: Request) {
  try {
    const result = await runRequest({
      action: new LoginFormAction(),
      body: req.formData,
    });
    return getSuccessResponse(result);
  } catch (e) {
    return NextResponse.json(e, { status: 400 });
  }
}

/**
 * Adds the session cookie to the response
 * @param result The login api response data
 * @returns The response with the new session cookie
 */
function getSuccessResponse(result: LoginResponse) {
  const toReturn = NextResponse.redirect(new URL("/home", APP_HOSTNAME));
  const sessionExpiry = new Date(new Date().getTime() + SESSION_DURATION * 24 * 60 * 60 * 1000);
  toReturn.cookies.set(TOKEN_STORAGE_NAME, result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: sessionExpiry,
  });

  return toReturn;
}
