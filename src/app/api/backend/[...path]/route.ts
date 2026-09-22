import { API_BASE_URL, DEFAULT_TRANSLATION_KEY, TOKEN_STORAGE_NAME } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

type PathParams = Promise<{ path: string[] }>;

export async function GET(req: NextRequest, context: { params: PathParams }) {
  return await handler("GET", req, (await context.params)?.path ?? []);
}

export async function POST(req: NextRequest, context: { params: PathParams }) {
  return await handler("POST", req, (await context.params)?.path ?? []);
}

export async function PUT(req: NextRequest, context: { params: PathParams }) {
  return await handler("PUT", req, (await context.params)?.path ?? []);
}

export async function PATCH(req: NextRequest, context: { params: PathParams }) {
  return await handler("PATCH", req, (await context.params)?.path ?? []);
}

export async function DELETE(req: NextRequest, context: { params: PathParams }) {
  return await handler("DELETE", req, (await context.params)?.path ?? []);
}

export async function OPTIONS(req: NextRequest, context: { params: PathParams }) {
  return await handler("OPTIONS", req, (await context.params)?.path ?? []);
}

async function handler(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS",
  request: NextRequest,
  paths: string[]
) {
  // Get cookies
  const headers = new Headers();
  // Real ip
  const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  if (clientIp) headers.append("X-Forwarded-For", clientIp);
  /** The cookie token */
  if (request.cookies.has(TOKEN_STORAGE_NAME)) {
    headers.append("Authorization", `Bearer ${request.cookies.get(TOKEN_STORAGE_NAME)?.value}`);
  }
  // Set language
  headers.append("Accept-Language", request.cookies.get("NEXT_LOCALE")?.value ?? DEFAULT_TRANSLATION_KEY);

  const allowBody = ["POST", "PUT"].includes(method);
  const body: BodyInit | null = allowBody ? request.body : null;
  const url = new URL(paths.join("/") + request.nextUrl.search, API_BASE_URL);

  try {
    const response = await fetch(url, {
      headers,
      method,
      body,
      signal: request.signal,
      cache: "no-store",
    });
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");
    // Return as is
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (e) {
    return NextResponse.json(e);
  }
}
