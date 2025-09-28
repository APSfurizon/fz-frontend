import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, REGEX_AUTHENTICATED_URLS, REGEX_LOGOUT, REGEX_SKIP_AUTHENTICATED,
  TOKEN_STORAGE_NAME } from './lib/constants';
 
const intlMiddleware = createMiddleware(routing);

enum TokenVerification {
  SUCCESS,
  NOT_VALID,
  NETWORK_ERROR
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const params = req.nextUrl.searchParams;

  // Check Token
  const loginToken = req.cookies.get(TOKEN_STORAGE_NAME);
  const loginTokenParam = params.get(TOKEN_STORAGE_NAME);
  const getTokenPresent = loginTokenParam && loginTokenParam.length > 0;
  const tokenPresent = (!!loginToken && !!loginToken.value) || !!getTokenPresent;

  // Check url regex
  const needsAuthentication = REGEX_AUTHENTICATED_URLS.test(path);
  const shouldSkipIfAuthenticated = REGEX_SKIP_AUTHENTICATED.test(path);
  const isLogout = REGEX_LOGOUT.test(path);

  // Create continue params
  const strippedParams = new URLSearchParams(params);
  strippedParams.delete("continue");
  strippedParams.delete(TOKEN_STORAGE_NAME);
  const continueParams = new URLSearchParams({"continue": `${path}?${strippedParams.toString()}`});

  if (isLogout) {
    return stripToken(intlMiddleware(req));
  }

  const tokenResult = tokenPresent
    ? await verifyToken(loginToken?.value ?? loginTokenParam!)
    : TokenVerification.NOT_VALID;

  if (tokenResult == TokenVerification.SUCCESS) {
    if (shouldSkipIfAuthenticated){
      return redirectToUrl(params.get("continue") ?? "/home", req);
    } else {
      return intlMiddleware(req);
    }
  } else {
    if (needsAuthentication) {
      return redirectToLogin(req, continueParams, tokenResult == TokenVerification.NOT_VALID);
    } else {
      if (tokenResult == TokenVerification.NOT_VALID)
        return stripToken(intlMiddleware(req));
      else 
        return intlMiddleware(req);
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
  } catch {
    return TokenVerification.NETWORK_ERROR;
  }

  return fetchResult && fetchResult.ok ? TokenVerification.SUCCESS : TokenVerification.NOT_VALID;
}

const stripToken = (res: NextResponse): NextResponse => {
  res.cookies.delete(TOKEN_STORAGE_NAME);
  return res;
}

const redirectToLogin = (req: NextRequest, continueParams: URLSearchParams, strip: boolean) => {
  const url = new URL(`/login`, req.url);
  continueParams.forEach((v, k)=>url.searchParams.append(k, v));
  const response = NextResponse.redirect(url, {status: 303});
  return strip ? stripToken(response) : response;
}

const redirectToUrl = (path: string, req: NextRequest, searchParams?: URLSearchParams) => {
  const newUrl = new URL(path, req.url);
  if (searchParams) {
    searchParams?.forEach((v,k)=>newUrl.searchParams.append(k, v));
  }
  return NextResponse.redirect(newUrl, {status: 303});
}
 
export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(it-IT|en-GB)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};