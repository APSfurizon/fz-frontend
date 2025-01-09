import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, REGEX_AUTHENTICATED_URLS, TOKEN_STORAGE_NAME } from './app/_lib/constants';
 
const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const loginToken = req.cookies.get(TOKEN_STORAGE_NAME);
  const tokenPresent = loginToken && loginToken.value
  const needsAuthentication = REGEX_AUTHENTICATED_URLS.test(path);
  const continueParams = new URLSearchParams({"continue": path});
  const tokenValid = tokenPresent ? await verifyToken(loginToken.value) : false;

  if (tokenValid) {
    return intlMiddleware(req);
  } else {
    if (needsAuthentication) {
      return redirectToLogin(req, continueParams);
    } else {
      return stripToken(intlMiddleware(req));
    }
  }
}

async function verifyToken(token: string) {
  // Try validating the request
  const headers = new Headers({
    'Content-type': 'application/json',
    'Authorization': token
  });
  let fetchResult: Response | undefined = undefined;
  try {
    fetchResult = await fetch(`${API_BASE_URL}users/me`, {method: 'GET', headers: headers});
  } catch (err) {
    return false;
  }

  return fetchResult && fetchResult.ok;
}

const stripToken = (res: NextResponse): NextResponse => {
  res.cookies.delete(TOKEN_STORAGE_NAME);
  return res;
}

const redirectToLogin = (req: NextRequest, continueParams: URLSearchParams) => {
  const response = NextResponse.redirect(new URL(`/login?${continueParams.toString()}`, req.url), {status: 303});
  return stripToken(response);
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