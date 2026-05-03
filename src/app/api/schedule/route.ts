import { API_MOBILE_URL } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function GET() {
    if (!API_MOBILE_URL) {
        return NextResponse.json({ errorMessage: "Mobile API base URL is not configured." }, { status: 500 });
    }

    const requestUrl = new URL("server/loadEventi", API_MOBILE_URL);
    requestUrl.searchParams.set("id", "attivita");

    try {
        const response = await fetch(requestUrl, {
            headers: {
                Accept: "application/json",
            },
            next: { revalidate: 300 },
        });

        const responseText = await response.text();

        if (!response.ok) {
            return new NextResponse(responseText || "Failed to load schedule.", { status: response.status });
        }

        return new NextResponse(responseText, {
            status: 200,
            headers: {
                "Content-Type": response.headers.get("content-type") ?? "application/json",
                "Cache-Control": "no-cache, no-store",
            },
        });
    } catch {
        return NextResponse.json({ errorMessage: "Failed to load schedule." }, { status: 502 });
    }
}