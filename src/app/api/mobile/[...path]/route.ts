import { MOBILE_ADMIN_TOKEN_STORAGE_NAME, API_MOBILE_URL, MOBILE_FURIZON_AUTH_HEADER } from "@/lib/constants";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function proxy(req: Request, params: { path: string[] }) {
    if (!API_MOBILE_URL) {
        return NextResponse.json({ errorMessage: "Mobile API base URL is not configured." }, { status: 500 });
    }

    const url = new URL(req.url);
    const target = new URL(params.path.join("/"), API_MOBILE_URL);
    target.search = url.search;

    const requestHeaders = new Headers();
    const incomingContentType = req.headers.get("content-type");
    const incomingAcceptLanguage = req.headers.get("accept-language");
    const incomingAuthorization = req.headers.get("authorization");
    const incomingAdminToken = req.headers.get("furizon_admin") ?? (await cookies()).get(MOBILE_ADMIN_TOKEN_STORAGE_NAME)?.value;

    if (incomingContentType) requestHeaders.set("content-type", incomingContentType);
    if (incomingAcceptLanguage) requestHeaders.set("accept-language", incomingAcceptLanguage);
    if (incomingAuthorization) requestHeaders.set("authorization", incomingAuthorization);
    if (incomingAdminToken) requestHeaders.set("furizon_admin", incomingAdminToken);
    if (MOBILE_FURIZON_AUTH_HEADER) requestHeaders.set("furizonauth", MOBILE_FURIZON_AUTH_HEADER);

    const hasBody = !["GET", "HEAD"].includes(req.method.toUpperCase());
    const body = hasBody ? await req.arrayBuffer() : undefined;

    const response = await fetch(target, {
        method: req.method,
        headers: requestHeaders,
        body,
        cache: "no-store",
    });

    const responseText = await response.text();

    // Mobile backend can return JSON with text/plain content-type.
    // Normalize to JSON when possible so client-side runRequest decodes payload fields.
    try {
        const json = JSON.parse(responseText);
        return NextResponse.json(json, { status: response.status });
    } catch {
        const contentType = response.headers.get("content-type") ?? "text/plain;charset=utf-8";
        return new NextResponse(responseText, {
            status: response.status,
            headers: {
                "Content-Type": contentType,
            },
        });
    }
}

export async function GET(req: Request, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxy(req, { path });
}

export async function POST(req: Request, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxy(req, { path });
}

export async function PATCH(req: Request, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxy(req, { path });
}

export async function PUT(req: Request, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxy(req, { path });
}

export async function DELETE(req: Request, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxy(req, { path });
}
