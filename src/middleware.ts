import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, REGEX_AUTHENTICATED_URLS, REGEX_LOGIN, REGEX_LOGOUT, REGEX_SKIP_AUTHENTICATED, SESSION_DURATION, TOKEN_STORAGE_NAME } from './app/_lib/constants';
 
const intlMiddleware = createMiddleware(routing);

enum TokenVerification {
  SUCCESS,
  NOT_VALID,
  NETOWRK_ERROR
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const params = req.nextUrl.searchParams;
  const loginToken = req.cookies.get(TOKEN_STORAGE_NAME);
  const tokenPresent = loginToken && loginToken.value
  const needsAuthentication = REGEX_AUTHENTICATED_URLS.test(path);
  const shouldSkipIfAuthenticated = REGEX_SKIP_AUTHENTICATED.test(path);
  const continueParams = new URLSearchParams({"continue": path});
  const isLogin = REGEX_LOGIN.test(path);
  const isLogout = REGEX_LOGOUT.test(path);

  if (isLogin) {
    if ((params.get(TOKEN_STORAGE_NAME) ?? "").length > 0) {
      const token = params.get(TOKEN_STORAGE_NAME) ?? "";
      const newParams = new URLSearchParams(params);
      newParams.delete(TOKEN_STORAGE_NAME);
      newParams.delete("continue");
      const response = redirectToUrl(params.get("continue") ?? "/home", req, newParams);
      return addToken(response, token);
    } else {
      return intlMiddleware(req);
    }
  } else if (isLogout) {
    return redirectToLogin(req, new URLSearchParams());
  }

  const tokenResult = tokenPresent ? await verifyToken(loginToken.value) : TokenVerification.NOT_VALID;

  if (tokenResult == TokenVerification.SUCCESS) {
    if (shouldSkipIfAuthenticated){
      const newParams = new URLSearchParams(params);
      newParams.delete("continue");
      return redirectToUrl(params.get("continue") ?? "/home", req, newParams);
    } else {
      return intlMiddleware(req);
    }
  } else {
    if (needsAuthentication) {
      return redirectToLogin(req, continueParams);
    } else {
      if (tokenResult == TokenVerification.NOT_VALID)
        return stripToken(intlMiddleware(req));
      else 
        return redirectToLogin(req, continueParams);
    }
  }
}

async function verifyToken(token: string): Promise<TokenVerification> {
  // Try validating the request
  const headers = new Headers({
    'Content-type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
  let fetchResult: Response | undefined = undefined;
  try {
    fetchResult = await fetch(`${API_BASE_URL}users/me`, {method: 'GET', headers: headers});
  } catch (err) {
    return TokenVerification.NETOWRK_ERROR;
  }

  return fetchResult && fetchResult.ok ? TokenVerification.SUCCESS : TokenVerification.NOT_VALID;
}

const stripToken = (res: NextResponse): NextResponse => {
  res.cookies.delete(TOKEN_STORAGE_NAME);
  return res;
}

const addToken = (res: NextResponse, token: string): NextResponse => {
  let sessionExpiry = new Date();
  sessionExpiry = new Date (sessionExpiry.setDate (sessionExpiry.getDate () + SESSION_DURATION));
  res.cookies.set(TOKEN_STORAGE_NAME, token, {
    expires: sessionExpiry,
    path: '/',
    sameSite: 'lax'
  });
  return res;
}

const redirectToLogin = (req: NextRequest, continueParams: URLSearchParams) => {
  const response = NextResponse.redirect(new URL(`/login?${continueParams.toString()}`, req.url), {status: 303});
  return stripToken(response);
}

const redirectToUrl = (path: string, req: NextRequest, continueParams: URLSearchParams) => {
  return NextResponse.redirect(new URL(`${path}?${continueParams.toString()}`, req.url), {status: 303});
}
 
export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(it|en)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};