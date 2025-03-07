import { ImageResponse } from "next/og";
import {getTranslations} from 'next-intl/server';

export const runtime = "edge";

export async function GET(request: Request) {
    const tcommon = await getTranslations("common");
    try {
        return new ImageResponse((
            <div style={{display: 'flex'}}>
                <p>{tcommon("coming_soon")}</p>
            </div>
        ))
    } catch (e) {
        return new Response("Could not return OG image", {status: 500});
    }
}