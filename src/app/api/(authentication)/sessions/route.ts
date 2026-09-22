import { LoginFormAction, LoginResponse, LogoutApiAction } from "@/lib/api/authentication/login";
import { ApiRequest, runRequest } from "@/lib/api/networking";
import { SESSION_DURATION, TOKEN_STORAGE_NAME } from "@/lib/constants";
import { NextResponse } from "next/server";

/**
 * The session creation endpoint for logging in
 * @param req The request data
 */
export async function POST(req: Request) {
  try {
    const result = await runRequest({
      action: new LoginFormAction(),
      body: (await req.json()) as ApiRequest,
    });
    return getSuccessResponse(result);
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
function getSuccessResponse(result: LoginResponse) {
  const toReturn = NextResponse.json({});
  const sessionExpiry = new Date(new Date().getTime() + SESSION_DURATION * 24 * 60 * 60 * 1000);
  toReturn.cookies.set(TOKEN_STORAGE_NAME, result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: sessionExpiry,
  });

  return toReturn;
}
