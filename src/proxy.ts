import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import {
  API_BASE_URL, REGEX_UNAUTHENTICATED_URLS, REGEX_LOGOUT, REGEX_SKIP_AUTHENTICATED,
  TOKEN_STORAGE_NAME
} from './lib/constants';

const intlMiddleware = createMiddleware(routing);

type TokenResult = {
  status: TokenVerification;
  language?: string
}
enum TokenVerification {
  SUCCESS,
  NOT_VALID,
  NETWORK_ERROR
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const params = req.nextUrl.searchParams;

  // Check Token
  const loginToken = req.cookies.get(TOKEN_STORAGE_NAME);
  const loginTokenParam = params.get(TOKEN_STORAGE_NAME);
  const getTokenPresent = loginTokenParam && loginTokenParam.length > 0;
  const tokenPresent = (!!loginToken && !!loginToken.value) || !!getTokenPresent;

  // Check url regex
  const needsAuthentication = !REGEX_UNAUTHENTICATED_URLS.test(path);
  const shouldSkipIfAuthenticated = REGEX_SKIP_AUTHENTICATED.test(path);
  const isLogout = REGEX_LOGOUT.test(path);

  // Create continue params
  const strippedParams = new URLSearchParams(params);
  strippedParams.delete("continue");
  strippedParams.delete(TOKEN_STORAGE_NAME);
  const continueParams = new URLSearchParams({ "continue": `${path}?${strippedParams.toString()}` });

  const intlMiddlewareResult = await intlMiddleware(req);
  // Goddamn next-intl putting the url rewrite even when strictly said not to
  intlMiddlewareResult.headers.set('x-middleware-rewrite', req.nextUrl.toString());

  if (isLogout) {
    return stripToken(intlMiddlewareResult);
  }

  const clientIp = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");

  const tokenResult: TokenResult = tokenPresent
    ? await verifyToken(clientIp, loginToken?.value ?? loginTokenParam!)
    : { status: TokenVerification.NOT_VALID };

  if (tokenResult.status == TokenVerification.SUCCESS) {
    if (tokenResult.language) {
      intlMiddlewareResult.cookies.set("NEXT_LOCALE", tokenResult.language, intlMiddlewareResult.cookies.get("NEXT_LOCALE"));
    }
    if (shouldSkipIfAuthenticated) {
      return redirectToUrl(params.get("continue") ?? "/home", req);
    } else {
      return intlMiddlewareResult;
    }
  } else {
    if (needsAuthentication) {
      return redirectToLogin(req, continueParams, tokenResult.status == TokenVerification.NOT_VALID);
    } else {
      if (tokenResult.status == TokenVerification.NOT_VALID)
        return stripToken(intlMiddlewareResult);
      else
        return intlMiddlewareResult;
    }
  }
}

async function verifyToken(clientIp: string | null, token: string): Promise<TokenResult> {
  // Try validating the request
  const headers = new Headers({
    "Content-type": "application/json",
    "Authorization": `Bearer ${token}`,
  });
  clientIp && headers.append("X-Forwarded-For", clientIp);
  let fetchResult: Response | undefined = undefined;
  try {
    fetchResult = await fetch(`${API_BASE_URL}users/me`, { method: 'GET', headers: headers });
  } catch {
    return { status: TokenVerification.NETWORK_ERROR }
  }
  const body = await fetchResult.json();
  return fetchResult && fetchResult.ok
    ? {
      status: TokenVerification.SUCCESS,
      language: String(body["language"])?.replace("_", "-")
    } : { status: TokenVerification.NOT_VALID };
}

const stripToken = (res: NextResponse): NextResponse => {
  res.cookies.delete(TOKEN_STORAGE_NAME);
  return res;
}

const redirectToLogin = (req: NextRequest, continueParams: URLSearchParams, strip: boolean) => {
  const url = new URL(`/login`, req.url);
  continueParams.forEach((v, k) => url.searchParams.append(k, v));
  const response = NextResponse.redirect(url, { status: 303 });
  return strip ? stripToken(response) : response;
}

const redirectToUrl = (path: string, req: NextRequest, searchParams?: URLSearchParams) => {
  const newUrl = new URL(path, req.url);
  if (searchParams) {
    searchParams?.forEach((v, k) => newUrl.searchParams.append(k, v));
  }
  return NextResponse.redirect(newUrl, { status: 303 });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images/footer|.*\\.woff2|.*\\.png|.*\\.webp$).*)'],
}