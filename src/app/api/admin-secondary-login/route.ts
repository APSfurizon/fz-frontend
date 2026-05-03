import { API_MOBILE_URL, MOBILE_FURIZON_AUTH_HEADER } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    if (!API_MOBILE_URL) {
        return NextResponse.json({ errorMessage: "Mobile API base URL is not configured." }, { status: 500 });
    }

    const input = await req.json().catch(() => null);
    if (!input?.username || !input?.password) {
        return NextResponse.json({ errorMessage: "Missing username or password." }, { status: 400 });
    }

    const requestUrl = new URL("mail/sendMail", API_MOBILE_URL);

    const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(MOBILE_FURIZON_AUTH_HEADER
                ? { furizonauth: MOBILE_FURIZON_AUTH_HEADER }
                : {}),
        },
        body: JSON.stringify({
            username: input.username,
            password: encodeURIComponent(input.password),
            platform: input.platform ?? "web",
            versione: input.versione,
        }),
        cache: "no-store",
    });

    const text = await response.text();
    const contentType = response.headers.get("content-type") ?? "application/json";

    return new NextResponse(text, {
        status: response.status,
        headers: {
            "Content-Type": contentType,
        },
    });
}
