import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, REGEX_AUTHENTICATED_URLS, TOKEN_STORAGE_NAME } from './app/_lib/constants';
 
const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const loginToken = req.cookies.get(TOKEN_STORAGE_NAME);
  const needsAuthentication = REGEX_AUTHENTICATED_URLS.test(path);

  if (needsAuthentication) {
    if (loginToken && loginToken.value) {
      // Try validating the request
      const headers = new Headers({
        'Content-type': 'application/json',
        'Authorization': loginToken.value
      });
      const fetchResult = await fetch(`${API_BASE_URL}users/me`, {method: 'GET', headers: headers});
      console.log("Fetch status: " + fetchResult.status + " - " + fetchResult.statusText + " - " + loginToken.value + " " + JSON.stringify(fetchResult.body));
      if (fetchResult.ok) {
        return intlMiddleware(req);
      } else {
        req.cookies.delete(TOKEN_STORAGE_NAME);
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } else {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } else {
    return intlMiddleware(req);
  }
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