import { getTranslations } from "next-intl/server";
import { ImageResponse } from "next/og";

export async function GET() {
  const tcommon = await getTranslations("common");
  try {
    return new ImageResponse(
      <div style={{ display: "flex" }}>
        <p>{tcommon("coming_soon")}</p>
      </div>
    );
  } catch {
    return new Response("Could not return OG image", { status: 500 });
  }
}
