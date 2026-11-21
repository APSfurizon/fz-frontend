import {
  AdminSecondaryLoginApiAction,
  AdminSecondaryLoginResponse,
  InternalLoginAction,
  LoginData,
  LoginResponse,
  LogoutApiAction,
} from "@/lib/api/authentication/login";
import { runRequest } from "@/lib/api/networking";
import { APP_VERSION, MOBILE_ADMIN_TOKEN_STORAGE_NAME, SESSION_DURATION, TOKEN_STORAGE_NAME } from "@/lib/constants";
import { NextResponse } from "next/server";

/**
 * The session creation endpoint for logging in
 * @param req The request data
 */
export async function POST(req: Request) {
  const loginData = (await req.json()) as LoginData;
  try {
    const result = await runRequest({
      action: new InternalLoginAction(),
      body: loginData,
    });
    let secondaryResult: AdminSecondaryLoginResponse | null = null;
    try {
      secondaryResult = await runRequest({
        action: new AdminSecondaryLoginApiAction(),
        body: {
          username: loginData.email?.trim().toLowerCase(),
          password: encodeURIComponent(loginData.password!),
          platform: "web",
          versione: APP_VERSION,
        },
      });
    } catch (e) {
      console.debug("Mobile login failed", e);
    }

    return getSuccessResponse(result, secondaryResult);
  } catch (e) {
    return NextResponse.json(e, { status: 400 });
  }
}

/**
 * The session deletion endpoint for logging out
 * @param req The request data
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(req: Request) {
  await runRequest({
    action: new LogoutApiAction(),
  });
  const toReturn = NextResponse.json({});
  toReturn.cookies.delete(TOKEN_STORAGE_NAME);
  return toReturn;
}

/**
 * Adds the session cookie to the response
 * @param result The login api response data
 * @returns The response with the new session cookie
 */
function getSuccessResponse(result: LoginResponse, secondaryResult: AdminSecondaryLoginResponse | null) {
  const toReturn = NextResponse.json({});
  const sessionExpiry = new Date(new Date().getTime() + SESSION_DURATION * 24 * 60 * 60 * 1000);
  toReturn.cookies.set(TOKEN_STORAGE_NAME, result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: sessionExpiry,
  });

  if (!!secondaryResult?.accessToken) {
    toReturn.cookies.set(MOBILE_ADMIN_TOKEN_STORAGE_NAME, secondaryResult.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: sessionExpiry,
    });
  }

  return toReturn;
}
